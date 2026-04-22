import json
from collections import defaultdict
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
HTML_PATH = BACKEND_ROOT / 'data' / '2025_nominees.html'
CHARACTERS_DATA_PATH = PROJECT_ROOT / 'frontend' / 'src' / 'config' / 'characters-data.json'
CHARACTER_LOOKUP_PATH = PROJECT_ROOT / 'frontend' / 'src' / 'config' / 'character-lookup.json'
IP_DATA_PATH = PROJECT_ROOT / 'frontend' / 'src' / 'config' / 'ip-data.json'


@dataclass(frozen=True)
class PageEntry:
    name: str
    series: str


class NomineesPageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_row = False
        self.in_cell = False
        self.current_cell_parts: list[str] = []
        self.current_row: list[str] = []
        self.rows: list[PageEntry] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == 'tr':
            self.in_row = True
            self.current_row = []
        elif tag in {'td', 'th'} and self.in_row:
            self.in_cell = True
            self.current_cell_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag in {'td', 'th'} and self.in_row and self.in_cell:
            self.current_row.append(normalize_text(''.join(self.current_cell_parts)))
            self.current_cell_parts = []
            self.in_cell = False
        elif tag == 'tr' and self.in_row:
            self.flush_row()
            self.current_row = []
            self.in_row = False

    def handle_data(self, data: str) -> None:
        if self.in_cell:
            self.current_cell_parts.append(data)

    def flush_row(self) -> None:
        if len(self.current_row) < 4:
            return

        _, name, series, _ = self.current_row[:4]
        if name == 'Name' or series == 'Series':
            return
        if not name or not series:
            return

        self.rows.append(PageEntry(name=name, series=series))


def normalize_text(value: str) -> str:
    return ' '.join(value.replace('\xa0', ' ').split())


def load_json(path: Path) -> dict:
    with path.open('r', encoding='utf-8') as file_obj:
        return json.load(file_obj)


def dump_json(path: Path, data: dict) -> None:
    with path.open('w', encoding='utf-8') as file_obj:
        json.dump(data, file_obj, ensure_ascii=False, indent=4)
        file_obj.write('\n')


def parse_page_entries(path: Path) -> list[PageEntry]:
    parser = NomineesPageParser()
    parser.feed(path.read_text(encoding='utf-8'))

    seen: set[PageEntry] = set()
    result: list[PageEntry] = []
    for entry in parser.rows:
        if entry in seen:
            continue
        seen.add(entry)
        result.append(entry)
    return result


def build_name_to_candidates(characters_data: dict, ip_data: dict) -> dict[str, list[tuple[str, str]]]:
    name_to_candidates: dict[str, list[tuple[str, str]]] = defaultdict(list)

    for character in characters_data.values():
        character_name = character.get('name')
        ip_id = character.get('ip_id')
        if not isinstance(character_name, str) or not character_name.strip():
            continue
        if not isinstance(ip_id, str) or not ip_id.strip():
            continue

        ip_info = ip_data.get(ip_id)
        if not isinstance(ip_info, dict):
            continue

        ip_name = ip_info.get('name')
        if not isinstance(ip_name, str) or not ip_name.strip():
            continue

        name_to_candidates[normalize_text(character_name)].append((ip_id, normalize_text(ip_name)))

    return name_to_candidates


def build_page_series_candidates(
    page_entries: list[PageEntry],
    name_to_candidates: dict[str, list[tuple[str, str]]],
) -> dict[str, set[str]]:
    ip_ids_by_page_series: dict[str, set[str]] = defaultdict(set)

    for entry in page_entries:
        candidates = name_to_candidates.get(entry.name, [])
        for ip_id, _ in candidates:
            ip_ids_by_page_series[entry.series].add(ip_id)

    return ip_ids_by_page_series


def build_safe_rename_plan(
    ip_ids_by_page_series: dict[str, set[str]],
    ip_data: dict,
) -> tuple[dict[str, str], dict[str, set[str]], dict[str, set[str]]]:
    rename_plan: dict[str, str] = {}
    ambiguous_page_series: dict[str, set[str]] = {}
    conflicting_ip_targets: dict[str, set[str]] = defaultdict(set)

    for page_series, ip_ids in ip_ids_by_page_series.items():
        if len(ip_ids) != 1:
            ambiguous_page_series[page_series] = ip_ids
            continue

        ip_id = next(iter(ip_ids))
        current_ip_name = normalize_text(str(ip_data[ip_id]['name']))
        if current_ip_name == page_series:
            continue

        rename_plan[ip_id] = page_series
        conflicting_ip_targets[ip_id].add(page_series)

    conflicting_ip_targets = {
        ip_id: page_series_set
        for ip_id, page_series_set in conflicting_ip_targets.items()
        if len(page_series_set) > 1
    }

    if conflicting_ip_targets:
        for ip_id in conflicting_ip_targets:
            rename_plan.pop(ip_id, None)

    return rename_plan, ambiguous_page_series, conflicting_ip_targets


def apply_rename_plan(ip_data: dict, rename_plan: dict[str, str]) -> dict:
    updated_ip_data = json.loads(json.dumps(ip_data, ensure_ascii=False))

    for ip_id, page_series in rename_plan.items():
        updated_ip_data[ip_id]['name'] = page_series
        updated_ip_data[ip_id]['name_short'] = page_series

    return updated_ip_data


def rebuild_character_lookup(characters_data: dict, ip_data: dict) -> tuple[dict[str, str], list[str]]:
    lookup: dict[str, str] = {}
    duplicate_keys: list[str] = []

    for character_id, character in characters_data.items():
        character_name = character.get('name')
        ip_id = character.get('ip_id')
        if not isinstance(character_name, str) or not character_name.strip():
            raise ValueError(f'角色 {character_id} 缺少有效 name')
        if not isinstance(ip_id, str) or not ip_id.strip():
            raise ValueError(f'角色 {character_id} 缺少有效 ip_id')

        ip_info = ip_data.get(ip_id)
        if not isinstance(ip_info, dict):
            raise ValueError(f'角色 {character_id} 引用了不存在的 ip_id: {ip_id}')

        ip_name = ip_info.get('name')
        if not isinstance(ip_name, str) or not ip_name.strip():
            raise ValueError(f'IP {ip_id} 缺少有效 name')

        lookup_key = f'{normalize_text(character_name)}@{normalize_text(ip_name)}'
        if lookup_key in lookup and lookup[lookup_key] != character_id:
            duplicate_keys.append(f'{lookup_key} -> {lookup[lookup_key]}, {character_id}')
            continue

        lookup[lookup_key] = character_id

    return lookup, duplicate_keys


def main() -> int:
    page_entries = parse_page_entries(HTML_PATH)
    characters_data = load_json(CHARACTERS_DATA_PATH)
    ip_data = load_json(IP_DATA_PATH)
    current_lookup = load_json(CHARACTER_LOOKUP_PATH)

    name_to_candidates = build_name_to_candidates(characters_data, ip_data)
    ip_ids_by_page_series = build_page_series_candidates(page_entries, name_to_candidates)
    rename_plan, ambiguous_page_series, conflicting_ip_targets = build_safe_rename_plan(
        ip_ids_by_page_series,
        ip_data,
    )

    updated_ip_data = apply_rename_plan(ip_data, rename_plan)
    rebuilt_lookup, duplicate_keys = rebuild_character_lookup(characters_data, updated_ip_data)

    if duplicate_keys:
        print('重建 character-lookup.json 时出现重复键，已停止写入:')
        for item in duplicate_keys:
            print(item)
        return 1

    dump_json(IP_DATA_PATH, updated_ip_data)
    dump_json(CHARACTER_LOOKUP_PATH, rebuilt_lookup)

    print(f'页面条目数: {len(page_entries)}')
    print(f'识别出的安全改名数量: {len(rename_plan)}')

    if rename_plan:
        print('\n已应用的 IP 改名:')
        for ip_id, page_series in sorted(rename_plan.items()):
            print(f'{ip_id}: {ip_data[ip_id]["name"]} -> {page_series}')

    if ambiguous_page_series:
        print('\n以下页面作品名匹配到了多个 ip_id，已跳过:')
        for page_series, ip_ids in sorted(ambiguous_page_series.items()):
            print(f'{page_series}: {", ".join(sorted(ip_ids))}')

    if conflicting_ip_targets:
        print('\n以下 ip_id 同时匹配到多个页面作品名，已跳过:')
        for ip_id, page_series_set in sorted(conflicting_ip_targets.items()):
            print(f'{ip_id}: {", ".join(sorted(page_series_set))}')

    print(f'原 lookup 键数: {len(current_lookup)}')
    print(f'新 lookup 键数: {len(rebuilt_lookup)}')
    print('已按 backend/data/2025_nominees.html 的页面作品名更新 ip-data.json 和 character-lookup.json')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
