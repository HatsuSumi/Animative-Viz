from typing import Literal, TypedDict, cast

from .seasons import NON_VOTE_COLUMNS, SEASONS_CONFIG

SpecialVoteTag = Literal['wildcard', 'ranking']


class CharacterRef(TypedDict):
    character: str
    series: str


class SpecialVoteCell(CharacterRef):
    tags: list[SpecialVoteTag]


class SeasonConfig(TypedDict, total=False):
    vote_columns: list[str]
    eliminated_characters: dict[str, list[CharacterRef]]
    special_vote_cells: dict[str, list[SpecialVoteCell]]


SpecialVoteCellCounts = dict[SpecialVoteTag, int]


def _get_season_config(season: str) -> SeasonConfig:
    if season not in SEASONS_CONFIG:
        raise KeyError(f"赛季配置不存在: {season}")
    return cast(SeasonConfig, SEASONS_CONFIG[season])


def get_season_rounds(season: str) -> list[str]:
    season_config = _get_season_config(season)
    return season_config['vote_columns']


def get_eliminated_characters(season: str, round_name: str) -> list[CharacterRef]:
    season_config = _get_season_config(season)
    return season_config.get('eliminated_characters', {}).get(round_name, [])


def get_special_vote_cells(season: str) -> dict[str, list[SpecialVoteCell]]:
    season_config = _get_season_config(season)
    return season_config.get('special_vote_cells', {})


def get_special_vote_cell_counts(season: str) -> SpecialVoteCellCounts:
    counts: SpecialVoteCellCounts = {
        'wildcard': 0,
        'ranking': 0,
    }

    for cells in get_special_vote_cells(season).values():
        for cell in cells:
            for tag in cell.get('tags', []):
                counts[tag] += 1

    return counts
