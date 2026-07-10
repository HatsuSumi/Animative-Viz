import os
import sys
from typing import Optional

import pandas as pd

from config.seasons_rounds import NON_VOTE_COLUMNS, SpecialVoteTag

from .logger import logger
from .services.vote_season_config import VoteSeasonConfig
from .types import CharacterInfo, VoteData, VotesByRoundsResult
from .utils import safe_float_convert

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)


class VoteTracker:
    def __init__(self, csv_path: str, original_filename: Optional[str] = None):
        self.data: Optional[pd.DataFrame] = None
        self.vote_columns: list[str] = []
        self.season: Optional[str] = None
        self.season_config: Optional[VoteSeasonConfig] = None
        self.csv_path = csv_path
        self._special_vote_tag_lookup: dict[tuple[str, str, str], set[SpecialVoteTag]] = {}
        self._vote_data_cache: dict[tuple[tuple[str, ...], bool, bool], list[VoteData]] = {}
        self._participating_counts_cache: dict[tuple[str, ...], dict[str, int]] = {}
        self._votes_by_rounds_cache: dict[tuple[tuple[str, ...], bool, bool], VotesByRoundsResult] = {}
        self._characters_info_cache: Optional[list[CharacterInfo]] = None

        if csv_path:
            self.load_csv(csv_path, original_filename)
        else:
            raise ValueError('必须提供CSV文件路径')

    def load_csv(self, csv_path: str, original_filename: Optional[str] = None) -> pd.DataFrame:
        try:
            if not os.path.exists(csv_path):
                logger.error(f'数据文件不存在: {csv_path}')
                raise FileNotFoundError(f'数据文件不存在: {csv_path}')

            self.data = pd.read_csv(csv_path)
            data = self.data
            data.columns = [col.replace(' ', '') for col in data.columns]

            self.season_config = VoteSeasonConfig.from_csv(data, csv_path, original_filename)
            self.season = self.season_config.season
            self.vote_columns = self.season_config.vote_columns
            self._special_vote_tag_lookup = self._build_special_vote_tag_lookup()
            self._vote_data_cache.clear()
            self._participating_counts_cache.clear()
            self._votes_by_rounds_cache.clear()
            self._characters_info_cache = None

            return data

        except Exception as error:
            logger.error(f'加载CSV文件失败: {str(error)}')
            raise

    def get_season_from_filename(self, filename: str) -> str:
        return VoteSeasonConfig.get_season_from_filename(filename)

    def get_vote_rounds(self) -> list[str]:
        if self.season_config is None:
            raise ValueError('赛季配置未初始化')
        return self.season_config.vote_columns

    def _build_special_vote_tag_lookup(self) -> dict[tuple[str, str, str], set[SpecialVoteTag]]:
        if self.season_config is None:
            raise ValueError('赛季配置未初始化')

        lookup: dict[tuple[str, str, str], set[SpecialVoteTag]] = {}
        for round_name, cells in self.season_config.special_vote_cells.items():
            for cell in cells:
                key = (round_name, cell['character'], cell['series'])
                lookup[key] = set(cell.get('tags', []))
        return lookup

    def get_filtered_vote_rounds(self, excluded_columns: Optional[list[str]] = None) -> list[str]:
        if excluded_columns is None:
            excluded_columns = []

        data = self.data
        if data is None:
            raise ValueError('投票数据未加载')

        all_columns = [col.replace(' ', '') for col in data.columns.tolist()]
        vote_columns = [col for col in all_columns if col not in NON_VOTE_COLUMNS]
        vote_columns = [col for col in vote_columns if col not in excluded_columns]
        return vote_columns

    def _build_vote_column_mapping(self, vote_rounds: list[str]) -> dict[str, str]:
        data = self.data
        if data is None:
            raise ValueError('投票数据未加载')

        return {
            round_name: next(column for column in data.columns if column.replace(' ', '') == round_name)
            for round_name in vote_rounds
        }

    def _should_exclude_special_vote(
        self,
        round_name: str,
        character_name: str,
        series_name: str,
        exclude_wildcard: bool,
        exclude_ranking: bool,
    ) -> bool:
        tags = self._special_vote_tag_lookup.get((round_name, character_name, series_name), set())
        return (exclude_wildcard and 'wildcard' in tags) or (exclude_ranking and 'ranking' in tags)

    def get_vote_data(
        self,
        vote_rounds: list[str],
        exclude_wildcard: bool = False,
        exclude_ranking: bool = False,
    ) -> list[VoteData]:
        if not vote_rounds:
            return []

        cache_key = (tuple(vote_rounds), exclude_wildcard, exclude_ranking)
        cached_votes_data = self._vote_data_cache.get(cache_key)
        if cached_votes_data is not None:
            return cached_votes_data

        data = self.data
        if data is None:
            raise ValueError('投票数据未加载')
        if self.season_config is None:
            raise ValueError('赛季配置未初始化')

        vote_column_mapping = self._build_vote_column_mapping(vote_rounds)
        original_columns = [vote_column_mapping[round_name] for round_name in vote_rounds]
        base_columns = ['角色', '作品']
        if '头像' in data.columns:
            base_columns.append('头像')

        selected_columns = base_columns + original_columns
        rows = data[selected_columns].to_dict('records')
        votes_data: list[VoteData] = []

        for row in rows:
            character_name = row['角色']
            series_name = row['作品']
            votes = [safe_float_convert(row[column_name]) for column_name in original_columns]

            for index, round_name in enumerate(vote_rounds):
                if self._should_exclude_special_vote(
                    round_name,
                    character_name,
                    series_name,
                    exclude_wildcard,
                    exclude_ranking,
                ):
                    votes[index] = None

            votes_data.append({
                'character': character_name,
                'series': series_name,
                'votes': votes,
            })

        self._vote_data_cache[cache_key] = votes_data
        return votes_data

    def _get_eliminated_character_pairs(self, round_name: str) -> set[tuple[str, str]]:
        if self.season_config is None:
            raise ValueError('赛季配置未初始化')

        eliminated_chars = self.season_config.get_eliminated_characters(round_name)
        return {
            (char['character'], char['series'])
            for char in eliminated_chars
        }

    def get_participating_counts(self, vote_rounds: list[str], votes_data: list[VoteData]) -> dict[str, int]:
        cache_key = tuple(vote_rounds)
        cached_participating_counts = self._participating_counts_cache.get(cache_key)
        if cached_participating_counts is not None:
            return cached_participating_counts

        participating_counts: dict[str, int] = {}
        total_chars = {(char_data['character'], char_data['series']) for char_data in votes_data}
        cumulative_eliminated_chars: set[tuple[str, str]] = set()

        for round_name in vote_rounds:
            participating_counts[round_name] = len(total_chars.difference(cumulative_eliminated_chars))
            cumulative_eliminated_chars.update(self._get_eliminated_character_pairs(round_name))

        self._participating_counts_cache[cache_key] = participating_counts
        return participating_counts

    def get_votes_by_rounds(
        self,
        excluded_columns: Optional[list[str]] = None,
        exclude_wildcard: bool = False,
        exclude_ranking: bool = False,
    ) -> VotesByRoundsResult:
        try:
            logger.info(
                f'【get_votes_by_rounds】开始处理投票数据，参数：excluded_columns={excluded_columns}, '
                f'exclude_wildcard={exclude_wildcard}, exclude_ranking={exclude_ranking}'
            )
            normalized_excluded_columns = tuple(excluded_columns or [])
            cache_key = (normalized_excluded_columns, exclude_wildcard, exclude_ranking)
            cached_result = self._votes_by_rounds_cache.get(cache_key)
            if cached_result is not None:
                return cached_result

            vote_rounds = self.get_filtered_vote_rounds(list(normalized_excluded_columns))
            if not vote_rounds:
                logger.warning('【get_votes_by_rounds】没有找到任何投票列')
                empty_result: VotesByRoundsResult = {
                    'votes_data': [],
                    'vote_rounds': [],
                    'participating_counts': {},
                }
                self._votes_by_rounds_cache[cache_key] = empty_result
                return empty_result

            votes_data = self.get_vote_data(vote_rounds, exclude_wildcard, exclude_ranking)
            participating_counts = self.get_participating_counts(vote_rounds, votes_data)

            result: VotesByRoundsResult = {
                'votes_data': votes_data,
                'vote_rounds': vote_rounds,
                'participating_counts': participating_counts,
            }
            self._votes_by_rounds_cache[cache_key] = result
            return result

        except Exception as error:
            logger.error(f'【get_votes_by_rounds】处理投票数据时发生错误：{str(error)}')
            raise

    def get_characters_info(self) -> list[CharacterInfo]:
        if self._characters_info_cache is not None:
            return self._characters_info_cache

        data = self.data
        if data is None:
            raise ValueError('投票数据未加载')

        if '角色' not in data.columns or '作品' not in data.columns:
            logger.error("数据文件缺少必要的列：'角色' 或 '作品'")
            raise ValueError("数据文件缺少必要的列：'角色' 或 '作品'")

        characters_info: list[CharacterInfo] = []
        for row in data.to_dict('records'):
            character_info: CharacterInfo = {
                'character': row['角色'],
                'ip': row['作品'],
            }

            if '头像' in row:
                character_info['avatar'] = row['头像']

            characters_info.append(character_info)

        self._characters_info_cache = characters_info
        return characters_info
