import argparse
import json
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
CN_HTML_PATH = BACKEND_ROOT / 'data' / '2025_nominees.html'
EN_HTML_PATH = BACKEND_ROOT / 'data' / '2025_nominees_en.html'
DRAFT_PATH = BACKEND_ROOT / 'data' / '2025_missing_female_characters.json'
CHARACTERS_DATA_PATH = PROJECT_ROOT / 'frontend' / 'src' / 'config' / 'characters-data.json'
CHARACTER_LOOKUP_PATH = PROJECT_ROOT / 'frontend' / 'src' / 'config' / 'character-lookup.json'
IP_DATA_PATH = PROJECT_ROOT / 'frontend' / 'src' / 'config' / 'ip-data.json'


@dataclass(frozen=True)
class NominationRow:
    rank: str
    name: str
    series: str
    ballots: str


@dataclass(frozen=True)
class CharacterEntry:
    name: str
    series: str


class NominationTableParser(HTMLParser):
    def __init__(self, heading_name: str) -> None:
        super().__init__()
        self.heading_name = heading_name
        self.current_heading: str | None = None
        self.in_h2 = False
        self.in_row = False
        self.in_cell = False
        self.current_cell_parts: list[str] = []
        self.current_row: list[str] = []
        self.rows: list[NominationRow] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == 'h2':
            self.in_h2 = True
            self.current_heading = None
        elif tag == 'tr':
            self.in_row = True
            self.current_row = []
        elif tag in {'td', 'th'} and self.in_row:
            self.in_cell = True
            self.current_cell_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag == 'h2':
            self.in_h2 = False
        elif tag in {'td', 'th'} and self.in_row and self.in_cell:
            self.current_row.append(normalize_text(''.join(self.current_cell_parts)))
            self.current_cell_parts = []
            self.in_cell = False
        elif tag == 'tr' and self.in_row:
            self.flush_row()
            self.current_row = []
            self.in_row = False

    def handle_data(self, data: str) -> None:
        if self.in_h2:
            heading_text = normalize_text(data)
            if heading_text:
                self.current_heading = heading_text

        if self.in_cell:
            self.current_cell_parts.append(data)

    def flush_row(self) -> None:
        if self.current_heading != self.heading_name:
            return

        if len(self.current_row) < 4:
            return

        rank, name, series, ballots = self.current_row[:4]
        if rank == 'Rank' or name == 'Name' or series == 'Series' or ballots == 'Ballots':
            return
        if not name or not series:
            return

        self.rows.append(NominationRow(rank=rank, name=name, series=series, ballots=ballots))


def normalize_text(value: str) -> str:
    return ' '.join(value.replace('\xa0', ' ').split())


def load_json(path: Path) -> dict:
    with path.open('r', encoding='utf-8') as file_obj:
        return json.load(file_obj)


def dump_json(path: Path, data: dict | list) -> None:
    with path.open('w', encoding='utf-8') as file_obj:
        json.dump(data, file_obj, ensure_ascii=False, indent=4)
        file_obj.write('\n')


def parse_nomination_rows(path: Path, heading_name: str) -> list[NominationRow]:
    parser = NominationTableParser(heading_name)
    parser.feed(path.read_text(encoding='utf-8'))
    return parser.rows


def build_existing_character_entries(characters_data: dict, ip_data: dict) -> tuple[set[CharacterEntry], dict[str, set[str]]]:
    existing_entries: set[CharacterEntry] = set()
    series_by_character_name: dict[str, set[str]] = {}

    for character in characters_data.values():
        ip_id = character.get('ip_id')
        ip_info = ip_data.get(ip_id)
        if not isinstance(ip_info, dict):
            continue

        name = normalize_text(str(character.get('name', '')))
        series = normalize_text(str(ip_info.get('name', '')))
        if not name or not series:
            continue

        entry = CharacterEntry(name=name, series=series)
        existing_entries.add(entry)
        series_by_character_name.setdefault(name, set()).add(series)

    return existing_entries, series_by_character_name


def build_ip_ids_by_series(ip_data: dict) -> dict[str, list[str]]:
    ip_ids_by_series: dict[str, list[str]] = {}

    for ip_id, ip_info in ip_data.items():
        series_name = normalize_text(str(ip_info.get('name', '')))
        if not series_name:
            continue
        ip_ids_by_series.setdefault(series_name, []).append(ip_id)

    return ip_ids_by_series


def resolve_match_status(candidate_ip_ids: list[str]) -> str:
    if len(candidate_ip_ids) == 1:
        return 'resolved'
    if len(candidate_ip_ids) == 0:
        return 'missing_ip'
    return 'ambiguous_ip'


def build_missing_character_draft(
    cn_rows: list[NominationRow],
    en_rows: list[NominationRow],
    existing_entries: set[CharacterEntry],
    series_by_character_name: dict[str, set[str]],
    ip_ids_by_series: dict[str, list[str]],
) -> tuple[list[dict], list[dict]]:
    if len(cn_rows) != len(en_rows):
        raise ValueError(f'中英文页面条目数不一致: {len(cn_rows)} != {len(en_rows)}')

    draft_entries: list[dict] = []
    conflict_entries: list[dict] = []

    for cn_row, en_row in zip(cn_rows, en_rows):
        if cn_row.rank != en_row.rank or cn_row.ballots != en_row.ballots:
            raise ValueError(
                '中英文页面行顺序不一致: '
                f'{cn_row.name} / {en_row.name}, rank={cn_row.rank}/{en_row.rank}, ballots={cn_row.ballots}/{en_row.ballots}'
            )

        entry = CharacterEntry(name=cn_row.name, series=cn_row.series)
        if entry in existing_entries:
            continue

        existing_series = sorted(series_by_character_name.get(cn_row.name, set()))
        if existing_series:
            conflict_entries.append({
                'name': cn_row.name,
                'series': cn_row.series,
                'name_en': en_row.name,
                'series_en': en_row.series,
                'existing_series': existing_series,
            })
            continue

        matched_ip_ids = ip_ids_by_series.get(cn_row.series, [])
        draft_entries.append({
            'name': cn_row.name,
            'name_en': en_row.name,
            'series': cn_row.series,
            'series_en': en_row.series,
            'ip_id': matched_ip_ids[0] if len(matched_ip_ids) == 1 else '',
            'cv': '',
            'avatar': '',
            'match_status': resolve_match_status(matched_ip_ids),
            'candidate_ip_ids': matched_ip_ids,
        })

    return draft_entries, conflict_entries


def get_next_character_id(characters_data: dict) -> int:
    max_numeric_id = 0
    for character_id in characters_data:
        if not character_id.startswith('char_'):
            continue
        numeric_part = character_id.removeprefix('char_')
        if numeric_part.isdigit():
            max_numeric_id = max(max_numeric_id, int(numeric_part))
    return max_numeric_id + 1


def backfill_draft_ip_ids(draft_entries: list[dict], ip_data: dict) -> tuple[list[dict], int]:
    ip_ids_by_series = build_ip_ids_by_series(ip_data)
    updated_entries: list[dict] = []
    changed_count = 0

    for entry in draft_entries:
        updated_entry = dict(entry)
        series = normalize_text(str(updated_entry.get('series', '')))
        candidate_ip_ids = ip_ids_by_series.get(series, [])
        match_status = resolve_match_status(candidate_ip_ids)

        updated_entry['candidate_ip_ids'] = candidate_ip_ids
        updated_entry['match_status'] = match_status
        updated_entry['ip_id'] = candidate_ip_ids[0] if len(candidate_ip_ids) == 1 else ''

        if updated_entry != entry:
            changed_count += 1

        updated_entries.append(updated_entry)

    return updated_entries, changed_count


def apply_draft(draft_entries: list[dict], characters_data: dict, character_lookup: dict, ip_data: dict) -> tuple[dict, dict, int]:
    next_id = get_next_character_id(characters_data)
    updated_characters_data = dict(characters_data)
    updated_character_lookup = dict(character_lookup)
    created_count = 0

    existing_lookup_keys = set(updated_character_lookup.keys())

    for entry in draft_entries:
        if entry.get('match_status') != 'resolved':
            raise ValueError(f'存在未解决的作品映射，无法写入: {entry["name"]} @ {entry["series"]}')

        ip_id = str(entry.get('ip_id', '')).strip()
        if not ip_id or ip_id not in ip_data:
            raise ValueError(f'角色 {entry["name"]} 的 ip_id 无效: {ip_id}')

        name = normalize_text(str(entry.get('name', '')))
        name_en = normalize_text(str(entry.get('name_en', '')))
        cv = normalize_text(str(entry.get('cv', '')))
        avatar = normalize_text(str(entry.get('avatar', '')))
        ip_name = normalize_text(str(ip_data[ip_id].get('name', '')))
        lookup_key = f'{name}@{ip_name}'

        if not name or not name_en:
            raise ValueError(f'角色资料不完整，至少需要 name 和 name_en: {entry}')
        if lookup_key in existing_lookup_keys:
            raise ValueError(f'角色已存在或 lookup 冲突: {lookup_key}')

        character_id = f'char_{next_id:06d}'
        updated_characters_data[character_id] = {
            'id': character_id,
            'name': name,
            'name_en': name_en,
            'ip_id': ip_id,
            'cv': cv,
            'avatar': avatar,
        }
        updated_character_lookup[lookup_key] = character_id
        existing_lookup_keys.add(lookup_key)
        next_id += 1
        created_count += 1

    return updated_characters_data, updated_character_lookup, created_count


def generate_command() -> int:
    cn_rows = parse_nomination_rows(CN_HTML_PATH, '女子')
    en_rows = parse_nomination_rows(EN_HTML_PATH, 'Female')
    characters_data = load_json(CHARACTERS_DATA_PATH)
    ip_data = load_json(IP_DATA_PATH)

    existing_entries, series_by_character_name = build_existing_character_entries(characters_data, ip_data)
    ip_ids_by_series = build_ip_ids_by_series(ip_data)
    draft_entries, conflict_entries = build_missing_character_draft(
        cn_rows,
        en_rows,
        existing_entries,
        series_by_character_name,
        ip_ids_by_series,
    )

    dump_json(DRAFT_PATH, draft_entries)

    print(f'已生成待补角色草稿: {DRAFT_PATH}')
    print(f'待补真实缺失角色数: {len(draft_entries)}')
    print(f'同名不同作品人工复核数: {len(conflict_entries)}')
    print(f'可直接解析到唯一 ip_id 的角色数: {sum(1 for entry in draft_entries if entry["match_status"] == "resolved")}')
    print(f'缺少匹配 IP 的角色数: {sum(1 for entry in draft_entries if entry["match_status"] == "missing_ip")}')
    print(f'匹配到多个 IP 的角色数: {sum(1 for entry in draft_entries if entry["match_status"] == "ambiguous_ip")}')

    if conflict_entries:
        print('\n以下角色同名但作品不同，未写入草稿:')
        for entry in conflict_entries:
            print(f'{entry["name"]} @ {entry["series"]} -> 已有作品: {", ".join(entry["existing_series"])}')

    return 0


def backfill_command() -> int:
    draft_entries = load_json(DRAFT_PATH)
    if not isinstance(draft_entries, list):
        raise ValueError(f'草稿文件格式错误: {DRAFT_PATH}')

    ip_data = load_json(IP_DATA_PATH)
    updated_draft_entries, changed_count = backfill_draft_ip_ids(draft_entries, ip_data)
    dump_json(DRAFT_PATH, updated_draft_entries)

    print(f'已回填草稿条目数: {changed_count}')
    print(f'可直接解析到唯一 ip_id 的角色数: {sum(1 for entry in updated_draft_entries if entry["match_status"] == "resolved")}')
    print(f'缺少匹配 IP 的角色数: {sum(1 for entry in updated_draft_entries if entry["match_status"] == "missing_ip")}')
    print(f'匹配到多个 IP 的角色数: {sum(1 for entry in updated_draft_entries if entry["match_status"] == "ambiguous_ip")}')
    return 0


def apply_command() -> int:
    draft_entries = load_json(DRAFT_PATH)
    if not isinstance(draft_entries, list):
        raise ValueError(f'草稿文件格式错误: {DRAFT_PATH}')

    characters_data = load_json(CHARACTERS_DATA_PATH)
    character_lookup = load_json(CHARACTER_LOOKUP_PATH)
    ip_data = load_json(IP_DATA_PATH)

    updated_characters_data, updated_character_lookup, created_count = apply_draft(
        draft_entries,
        characters_data,
        character_lookup,
        ip_data,
    )

    dump_json(CHARACTERS_DATA_PATH, updated_characters_data)
    dump_json(CHARACTER_LOOKUP_PATH, updated_character_lookup)

    print(f'已写入角色数: {created_count}')
    print(f'characters-data.json 新总数: {len(updated_characters_data)}')
    print(f'character-lookup.json 新总数: {len(updated_character_lookup)}')
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description='根据 2025 中英文提名页生成、回填或导入缺失女性角色数据')
    parser.add_argument('--apply', action='store_true', help='将已填写完成的草稿导入 characters-data.json 和 character-lookup.json')
    parser.add_argument('--backfill-ip', action='store_true', help='根据 ip-data.json 回填草稿中的 ip_id、match_status 和 candidate_ip_ids')
    args = parser.parse_args()

    if args.apply:
        return apply_command()
    if args.backfill_ip:
        return backfill_command()
    return generate_command()


if __name__ == '__main__':
    raise SystemExit(main())

