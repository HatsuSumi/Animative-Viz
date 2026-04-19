import os
import re
from typing import Optional

import pandas as pd

from config.seasons_rounds import (
    EliminatedCharacter,
    NON_VOTE_COLUMNS,
    get_eliminated_characters,
    get_season_rounds,
    get_wildcard_rounds,
)

from ..logger import logger


class VoteSeasonConfig:
    def __init__(self, season: str, vote_columns: list[str], wildcard_rounds: list[str]):
        self.season = season
        self.vote_columns = vote_columns
        self.wildcard_rounds = wildcard_rounds

    @classmethod
    def from_csv(cls, data: pd.DataFrame, csv_path: str, original_filename: Optional[str] = None) -> 'VoteSeasonConfig':
        filename = original_filename or os.path.basename(csv_path)
        season = cls.get_season_from_filename(filename)
        logger.debug(f"加载赛季: {season}")

        expected_vote_columns = get_season_rounds(season)
        wildcard_rounds = get_wildcard_rounds(season)
        csv_vote_columns = [col for col in data.columns if col not in NON_VOTE_COLUMNS]

        missing_columns = [col for col in expected_vote_columns if col not in csv_vote_columns]
        extra_columns = [col for col in csv_vote_columns if col not in expected_vote_columns]

        if missing_columns:
            raise ValueError(f"CSV文件缺少以下必需的投票列: {missing_columns}")

        if extra_columns:
            logger.warning(f"CSV文件包含以下额外的投票列: {extra_columns}")

        return cls(
            season=season,
            vote_columns=expected_vote_columns,
            wildcard_rounds=wildcard_rounds,
        )

    @staticmethod
    def get_season_from_filename(filename: str) -> str:
        season_match = re.search(r'(\d{4})_season', filename)
        if not season_match:
            logger.error(f"无法从文件名识别赛季: {filename}")
            raise ValueError(f"无法从文件名识别赛季: {filename}")
        return season_match.group(1)

    def get_eliminated_characters(self, round_name: str) -> list[EliminatedCharacter]:
        return get_eliminated_characters(self.season, round_name)

