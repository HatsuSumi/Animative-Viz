import json
import os
import sys
from collections import defaultdict
from dataclasses import dataclass
from html.parser import HTMLParser
from typing import Iterable


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHARACTERS_DATA_PATH = os.path.join(PROJECT_ROOT, 'frontend', 'src', 'config', 'characters-data.json')
IP_DATA_PATH = os.path.join(PROJECT_ROOT, 'frontend', 'src', 'config', 'ip-data.json')


@dataclass(frozen=True)
class CharacterEntry:
    name: str
    series: str


@dataclass(frozen=True)
class NameConflictEntry:
    entry: CharacterEntry
    existing_series: tuple[str, ...]


class FemaleNominationParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.current_heading: str | None = None
        self.in_h2 = False
        self.in_row = False
        self.in_cell = False
        self.current_cell_parts: list[str] = []
        self.current_row: list[str] = []
        self.rows: list[CharacterEntry] = []

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
            cell_text = normalize_text(''.join(self.current_cell_parts))
            self.current_row.append(cell_text)
            self.current_cell_parts = []
            self.in_cell = False
        elif tag == 'tr' and self.in_row:
            self._flush_row()
            self.current_row = []
            self.in_row = False

    def handle_data(self, data: str) -> None:
        if self.in_h2:
            heading_text = normalize_text(data)
            if heading_text:
                self.current_heading = heading_text

        if self.in_cell:
            self.current_cell_parts.append(data)

    def _flush_row(self) -> None:
        if self.current_heading != '女子':
            return

        if len(self.current_row) < 4:
            return

        rank, name, series, ballots = self.current_row[:4]
        if rank == 'Rank' or name == 'Name' or series == 'Series' or ballots == 'Ballots':
            return

        if not name or not series:
            return

        self.rows.append(CharacterEntry(name=name, series=series))


def normalize_text(value: str) -> str:
    return ' '.join(value.replace('\xa0', ' ').split())


def load_json(path: str) -> dict:
    with open(path, 'r', encoding='utf-8') as file_obj:
        return json.load(file_obj)



def build_existing_character_entries() -> tuple[set[CharacterEntry], dict[str, set[str]], dict[CharacterEntry, str]]:
    characters_data = load_json(CHARACTERS_DATA_PATH)
    ip_data = load_json(IP_DATA_PATH)

    existing_entries: set[CharacterEntry] = set()
    series_by_character_name: dict[str, set[str]] = defaultdict(set)
    character_ids_by_entry: dict[CharacterEntry, str] = {}

    for character in characters_data.values():
        ip_id = character.get('ip_id')
        ip_info = ip_data.get(ip_id)
        if not ip_info:
            continue

        name = normalize_text(str(character.get('name', '')))
        series = normalize_text(str(ip_info.get('name', '')))
        if not name or not series:
            continue

        entry = CharacterEntry(name=name, series=series)
        existing_entries.add(entry)
        series_by_character_name[name].add(series)
        character_ids_by_entry[entry] = str(character.get('id', ''))

    return existing_entries, series_by_character_name, character_ids_by_entry



def deduplicate(entries: Iterable[CharacterEntry]) -> list[CharacterEntry]:
    seen: set[CharacterEntry] = set()
    ordered_entries: list[CharacterEntry] = []

    for entry in entries:
        if entry in seen:
            continue
        seen.add(entry)
        ordered_entries.append(entry)

    return ordered_entries



def classify_entries(
    female_entries: list[CharacterEntry],
    existing_entries: set[CharacterEntry],
    series_by_character_name: dict[str, set[str]]
) -> tuple[list[CharacterEntry], list[NameConflictEntry], list[NameConflictEntry]]:
    missing_entries: list[CharacterEntry] = []
    series_mismatch_entries: list[NameConflictEntry] = []
    possible_name_conflict_entries: list[NameConflictEntry] = []

    for entry in female_entries:
        if entry in existing_entries:
            continue

        existing_series = tuple(sorted(series_by_character_name.get(entry.name, set())))
        if not existing_series:
            missing_entries.append(entry)
            continue

        possible_name_conflict_entries.append(NameConflictEntry(entry=entry, existing_series=existing_series))

    return missing_entries, series_mismatch_entries, possible_name_conflict_entries



def parse_female_entries(html_text: str) -> list[CharacterEntry]:
    parser = FemaleNominationParser()
    parser.feed(html_text)
    return deduplicate(parser.rows)


def print_entries(title: str, entries: list[CharacterEntry]) -> None:
    print(title)
    if not entries:
        print('无')
        return

    for index, entry in enumerate(entries, start=1):
        print(f'{index}. {entry.name} @ {entry.series}')


def print_series_mismatch_entries(
    title: str,
    entries: list[NameConflictEntry]
) -> None:
    print(title)
    if not entries:
        print('无')
        return

    for index, conflict in enumerate(entries, start=1):
        print(f'{index}. {conflict.entry.name} @ {conflict.entry.series}')
        print(f'   数据库中已有IP: {", ".join(conflict.existing_series)}')


def print_possible_name_conflicts(
    title: str,
    entries: list[NameConflictEntry]
) -> None:
    print(title)
    if not entries:
        print('无')
        return

    for index, conflict in enumerate(entries, start=1):
        print(f'{index}. {conflict.entry.name} @ {conflict.entry.series}')
        print(f'   数据库中同名角色IP: {", ".join(conflict.existing_series)}')


def read_html_input() -> str:
    if len(sys.argv) > 1 and sys.argv[1] != '-':
        input_path = sys.argv[1]
        with open(input_path, 'r', encoding='utf-8') as file_obj:
            return file_obj.read()

    return sys.stdin.read()


def main() -> int:
    html_text = read_html_input()
    if not html_text.strip():
        print('未提供 HTML 内容，请传入文件路径或通过标准输入传入。')
        return 1

    female_entries = parse_female_entries(html_text)
    existing_entries, series_by_character_name, _ = build_existing_character_entries()
    missing_entries, series_mismatch_entries, possible_name_conflict_entries = classify_entries(
        female_entries,
        existing_entries,
        series_by_character_name
    )

    print(f'提取到女性角色总数: {len(female_entries)}')
    print(f'数据库中缺失的角色数: {len(missing_entries)}')
    print(f'角色存在但 IP 名不一致的条目数: {len(series_mismatch_entries)}')
    print(f'同名但作品不同，需人工复核的条目数: {len(possible_name_conflict_entries)}')

    print_entries('\n真实缺失角色: ', missing_entries)
    print_series_mismatch_entries('\n角色存在但 IP 名不一致: ', series_mismatch_entries)
    print_possible_name_conflicts('\n同名但作品不同，需人工复核: ', possible_name_conflict_entries)

    return 0


if __name__ == '__main__':
    raise SystemExit(main())

