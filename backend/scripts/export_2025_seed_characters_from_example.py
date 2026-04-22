from collections import OrderedDict
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
import json

from openpyxl import Workbook


BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
HTML_PATH = BACKEND_ROOT / 'data' / 'example.html'
OUTPUT_PATH = BACKEND_ROOT / 'data' / '2025_seed_characters.xlsx'
CHARACTERS_DATA_PATH = PROJECT_ROOT / 'frontend' / 'src' / 'config' / 'characters-data.json'
IP_DATA_PATH = PROJECT_ROOT / 'frontend' / 'src' / 'config' / 'ip-data.json'


@dataclass(frozen=True)
class ContestantEntry:
    name: str
    series: str


class ArenaContestantsParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_name = False
        self.in_series = False
        self.current_name_parts: list[str] = []
        self.current_series_parts: list[str] = []
        self.entries: list[ContestantEntry] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        class_name = attrs_dict.get('class', '') or ''

        if tag == 'p' and 'contestantName' in class_name:
            self.in_name = True
            self.current_name_parts = []
        elif tag == 'p' and 'contestantSeries' in class_name:
            self.in_series = True
            self.current_series_parts = []

    def handle_data(self, data: str) -> None:
        if self.in_name:
            self.current_name_parts.append(data)
        if self.in_series:
            self.current_series_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag != 'p':
            return

        if self.in_name:
            self.in_name = False
            return

        if self.in_series:
            self.in_series = False
            name = normalize_text(''.join(self.current_name_parts))
            series = normalize_text(''.join(self.current_series_parts))
            self.current_name_parts = []
            self.current_series_parts = []
            if name and series:
                self.entries.append(ContestantEntry(name=name, series=series))


def normalize_text(value: str) -> str:
    return ' '.join(value.replace('\xa0', ' ').split())


def load_json(path: Path) -> dict:
    with path.open('r', encoding='utf-8') as file_obj:
        return json.load(file_obj)


def parse_contestants(path: Path) -> list[ContestantEntry]:
    parser = ArenaContestantsParser()
    parser.feed(path.read_text(encoding='utf-8'))

    unique_entries: OrderedDict[ContestantEntry, None] = OrderedDict()
    for entry in parser.entries:
        unique_entries.setdefault(entry, None)

    return list(unique_entries.keys())


def build_cv_by_entry(characters_data: dict, ip_data: dict) -> dict[ContestantEntry, str]:
    cv_by_entry: dict[ContestantEntry, str] = {}

    for character in characters_data.values():
        name = normalize_text(str(character.get('name', '')))
        ip_id = str(character.get('ip_id', ''))
        cv = normalize_text(str(character.get('cv', '')))
        ip_info = ip_data.get(ip_id)
        if not name or not isinstance(ip_info, dict):
            continue

        series = normalize_text(str(ip_info.get('name', '')))
        if not series:
            continue

        cv_by_entry[ContestantEntry(name=name, series=series)] = cv

    return cv_by_entry


def export_excel(entries: list[ContestantEntry], cv_by_entry: dict[ContestantEntry, str], output_path: Path) -> tuple[int, list[ContestantEntry]]:
    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = '角色名单'
    worksheet.append(['序号', '角色', '作品', 'cv'])

    missing_cv_entries: list[ContestantEntry] = []

    for index, entry in enumerate(entries, start=1):
        cv = cv_by_entry.get(entry, '')
        if not cv:
            missing_cv_entries.append(entry)
        worksheet.append([index, entry.name, entry.series, cv])

    output_path.parent.mkdir(parents=True, exist_ok=True)
    workbook.save(output_path)
    return len(entries), missing_cv_entries


def main() -> int:
    contestants = parse_contestants(HTML_PATH)
    characters_data = load_json(CHARACTERS_DATA_PATH)
    ip_data = load_json(IP_DATA_PATH)
    cv_by_entry = build_cv_by_entry(characters_data, ip_data)
    total_count, missing_cv_entries = export_excel(contestants, cv_by_entry, OUTPUT_PATH)

    print(f'已提取去重角色数: {total_count}')
    print(f'未匹配到 cv 的角色数: {len(missing_cv_entries)}')
    if missing_cv_entries:
        print('\n以下角色未匹配到 cv:')
        for entry in missing_cv_entries:
            print(f'{entry.name} @ {entry.series}')
    print(f'Excel 已生成: {OUTPUT_PATH}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

