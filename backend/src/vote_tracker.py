import os
import sys
import re
import pandas as pd
from typing import Optional
from config.seasons_rounds import (
    NON_VOTE_COLUMNS,
    get_season_rounds,
    get_wildcard_rounds,
    get_eliminated_characters
)
from .logger import logger
from .utils import safe_float_convert

# 将项目根目录添加到 Python 路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

# 将当前目录添加到 Python 路径
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

_skipped_votes: set[tuple[str, str]] = set()  # 用集合来存储被跳过的轮次和角色

class VoteTracker:
    def __init__(self, csv_path: str, original_filename: Optional[str] = None):
        """
        初始化VoteTracker
        
        :param csv_path: CSV文件路径
        :param original_filename: 原始文件名（用于从文件名中获取赛季）
        :raises: ValueError 如果没有提供文件路径
        """
        self.data: Optional[pd.DataFrame] = None
        self.vote_columns: list[str] = []
        self.wildcard_rounds: list[str] = []
        self.season: Optional[str] = None
        self.csv_path = csv_path
        
        if csv_path:
            self.load_csv(csv_path, original_filename)
        else:
            raise ValueError("必须提供CSV文件路径")

    def load_csv(self, csv_path: str, original_filename: Optional[str] = None) -> pd.DataFrame:
        """
        加载CSV文件
        
        :param csv_path: CSV文件路径
        :param original_filename: 原始文件名（用于从文件名中获取赛季）
        :raises: FileNotFoundError 如果文件不存在
        :raises: ValueError 如果文件名格式不正确或赛季不存在
        """
        try:
            if not os.path.exists(csv_path):
                logger.error(f"数据文件不存在: {csv_path}")
                raise FileNotFoundError(f"数据文件不存在: {csv_path}")
            
            # 读取CSV文件
            self.data = pd.read_csv(csv_path)
            data = self.data
            
            # 清理列名中的所有空格
            data.columns = [col.replace(' ', '') for col in data.columns]
            
            # 获取赛季信息
            filename = original_filename or os.path.basename(csv_path)
            self.season = self.get_season_from_filename(filename)
            logger.debug(f"加载赛季: {self.season}")
            
            # 从配置获取投票轮次列
            expected_vote_columns = get_season_rounds(self.season)
            self.wildcard_rounds = get_wildcard_rounds(self.season)
            
            # 获取CSV文件中的投票列
            csv_vote_columns = [col for col in data.columns if col not in NON_VOTE_COLUMNS]
            
            # 检查CSV文件中的列名是否完全匹配配置
            missing_columns = [col for col in expected_vote_columns if col not in csv_vote_columns]
            extra_columns = [col for col in csv_vote_columns if col not in expected_vote_columns]
            
            if missing_columns:
                raise ValueError(f"CSV文件缺少以下必需的投票列: {missing_columns}")
            
            if extra_columns:
                logger.warning(f"CSV文件包含以下额外的投票列: {extra_columns}")
            
            # 使用配置中的投票列，保持原有顺序
            self.vote_columns = expected_vote_columns
            
            return data
            
        except Exception as e:
            logger.error(f"加载CSV文件失败: {str(e)}")
            raise

    def get_season_from_filename(self, filename: str) -> str:
        """从文件名中提取赛季信息"""
        season_match = re.search(r'(\d{4})_season', filename)
        if not season_match:
            logger.error(f"无法从文件名识别赛季: {filename}")
            raise ValueError(f"无法从文件名识别赛季: {filename}")
        return season_match.group(1)

    def get_vote_rounds(self) -> list[str]:
        """
        获取所有投票轮次列表
        
        :return: 投票轮次列表
        """
        if self.season is None:
            raise ValueError("赛季未初始化")
        return get_season_rounds(self.season)
    
    def get_filtered_vote_rounds(self, excluded_columns=None, exclude_wildcard=False):
        """
        获取过滤后的投票轮次列表
        
        Args:
            excluded_columns: 要排除的列名列表
            exclude_wildcard: 是否排除外卡赛
            
        Returns:
            list: 过滤后的投票轮次列表
        """
        if excluded_columns is None:
            excluded_columns = []
            
        data = self.data
        if data is None:
            raise ValueError("投票数据未加载")
            
        # 获取所有列（轮次）
        all_columns = [col.replace(' ', '') for col in data.columns.tolist()]
        
        # 过滤出投票列
        vote_columns = [col for col in all_columns if col not in NON_VOTE_COLUMNS]
        
        # 排除指定的列
        vote_columns = [col for col in vote_columns if col not in excluded_columns]
        
        # 排除外卡赛
        if exclude_wildcard and self.wildcard_rounds:
            excluded_wildcards = [col for col in vote_columns if col in self.wildcard_rounds]
            vote_columns = [col for col in vote_columns if col not in self.wildcard_rounds]
            logger.info(f'【get_filtered_vote_rounds】排除外卡赛：{", ".join(excluded_wildcards)}')

        return vote_columns

    def _build_vote_column_mapping(self, vote_rounds: list[str]) -> dict[str, str]:
        data = self.data
        if data is None:
            raise ValueError("投票数据未加载")

        return {
            round_name: next(column for column in data.columns if column.replace(' ', '') == round_name)
            for round_name in vote_rounds
        }

    def _find_eliminated_round(self, vote_rounds: list[str], character_name: str, series_name: str) -> Optional[str]:
        if self.season is None:
            raise ValueError("赛季未初始化")

        for round_name in vote_rounds:
            eliminated_chars = get_eliminated_characters(self.season, round_name)
            for char in eliminated_chars:
                if char['character'] == character_name and char['series'] == series_name:
                    return round_name

        return None

    def _exclude_votes_after_elimination(self, votes: list[Optional[float]], vote_rounds: list[str], eliminated_round: str) -> None:
        eliminated_round_index = vote_rounds.index(eliminated_round)

        for index, round_name in enumerate(vote_rounds):
            is_elimination_round = '淘汰赛' in round_name
            if (not is_elimination_round and index >= eliminated_round_index) or \
               (is_elimination_round and index > eliminated_round_index):
                votes[index] = None

    def get_vote_data(self, vote_rounds, exclude_ranking=False):
        """
        获取投票数据
        
        Args:
            vote_rounds: 投票轮次列表
            exclude_ranking: 是否排除排位赛
            
        Returns:
            list: 投票数据列表
        """
        if not vote_rounds:
            return []

        votes_data = []
        data = self.data
        if data is None:
            raise ValueError("投票数据未加载")
        if self.season is None:
            raise ValueError("赛季未初始化")

        vote_column_mapping = self._build_vote_column_mapping(vote_rounds)

        for _, row in data.iterrows():
            character_name = row['角色']
            series_name = row['作品']

            votes = []
            for col in vote_rounds:
                original_col = vote_column_mapping[col]
                vote = safe_float_convert(row[original_col])
                votes.append(vote)
            
            eliminated_round = None
            if exclude_ranking:
                eliminated_round = self._find_eliminated_round(vote_rounds, character_name, series_name)

                if eliminated_round:
                    self._exclude_votes_after_elimination(votes, vote_rounds, eliminated_round)
            
            votes_data.append({
                'character': character_name,
                'series': series_name,  
                'votes': votes
            })
                
        return votes_data

    def _get_eliminated_character_pairs(self, round_name: str) -> set[tuple[str, str]]:
        if self.season is None:
            raise ValueError("赛季未初始化")

        eliminated_chars = get_eliminated_characters(self.season, round_name)
        return {
            (char['character'], char['series'])
            for char in eliminated_chars
        }

    def get_participating_counts(self, vote_rounds, votes_data):
        """
        获取每轮参与的角色数量，只统计未被淘汰的角色
        每一轮显示的是上一轮结束后的人数，比如：
        - 第一阶段第一轮：显示预选赛第二轮结束后的人数（72-12=60人）
        - 第二阶段第一轮：显示第一阶段第四轮结束后的人数（60-20=40人）
        - 淘汰赛第一轮：显示第三阶段第四轮结束后的人数（24-8=16人）
        
        Args:
            vote_rounds: 投票轮次列表
            votes_data: 投票数据列表
            
        Returns:
            dict: 每轮参与角色数的字典
        """
        participating_counts = {}

        total_chars = {(char_data['character'], char_data['series']) for char_data in votes_data}
        eliminated_cache: dict[str, set[tuple[str, str]]] = {}

        for index, round_name in enumerate(vote_rounds):
            cumulative_eliminated_chars = set()

            for previous_round in vote_rounds[:index]:
                if previous_round not in eliminated_cache:
                    eliminated_cache[previous_round] = self._get_eliminated_character_pairs(previous_round)
                cumulative_eliminated_chars.update(eliminated_cache[previous_round])

            participating_counts[round_name] = len(total_chars.difference(cumulative_eliminated_chars))

            if round_name not in eliminated_cache:
                eliminated_cache[round_name] = self._get_eliminated_character_pairs(round_name)

        return participating_counts

    def get_votes_by_rounds(self, excluded_columns=None, exclude_wildcard=False, exclude_ranking=False):
        """
        获取每个轮次的投票数据。
        
        Args:
            excluded_columns: 要排除的列名列表
            exclude_wildcard: 是否排除外卡赛
            exclude_ranking: 是否排除排位赛
            
        Returns:
            dict: 包含投票数据的字典
        """
        try:
            logger.info(f'【get_votes_by_rounds】开始处理投票数据，参数：excluded_columns={excluded_columns}, exclude_wildcard={exclude_wildcard}, exclude_ranking={exclude_ranking}')
            
            # 获取过滤后的轮次列表
            vote_rounds = self.get_filtered_vote_rounds(excluded_columns, exclude_wildcard)
            
            # 如果没有投票列，返回空数据
            if not vote_rounds:
                logger.warning('【get_votes_by_rounds】没有找到任何投票列')
                return {
                    'votes_data': [],
                    'vote_rounds': [],
                    'participating_counts': {}
                }
            
            # 获取所有轮次（包括被排除的轮次）
            all_vote_rounds = self.get_vote_rounds()
            all_votes_data = self.get_vote_data(all_vote_rounds, exclude_ranking)
            round_index_map = {round_name: index for index, round_name in enumerate(all_vote_rounds)}
            
            # 使用所有轮次来计算参与人数
            all_participating_counts = self.get_participating_counts(all_vote_rounds, all_votes_data)
            
            # 只返回过滤后的轮次的数据
            filtered_votes_data = []
            for vote_data in all_votes_data:
                filtered_votes = []
                for round_name in vote_rounds:
                    round_index = round_index_map[round_name]
                    filtered_votes.append(vote_data['votes'][round_index])
                filtered_votes_data.append({
                    'character': vote_data['character'],
                    'series': vote_data['series'],
                    'votes': filtered_votes
                })
            
            # 只返回过滤后的轮次的参与人数
            participating_counts = {round_name: all_participating_counts[round_name] 
                                 for round_name in vote_rounds}
            
            return {
                'votes_data': filtered_votes_data,
                'vote_rounds': vote_rounds,
                'participating_counts': participating_counts
            }
            
        except Exception as e:
            logger.error(f'【get_votes_by_rounds】处理投票数据时发生错误：{str(e)}')
            raise

    def get_characters_info(self) -> list[dict[str, str]]:
        """
        获取角色的作品信息
        
        :return: 包含角色作品信息的列表，格式为 [{"character": "角色名", "ip": "作品名", "avatar": "头像URL"}, ...]
        """
        data = self.data
        if data is None:
            raise ValueError("投票数据未加载")

        # 确保 '角色' 和 '作品' 列存在
        if '角色' not in data.columns or '作品' not in data.columns:
            logger.error("数据文件缺少必要的列：'角色' 或 '作品'")
            raise ValueError("数据文件缺少必要的列：'角色' 或 '作品'")
        
        # 获取角色和作品的对应关系
        characters_info = []
        for _, row in data.iterrows():
            character_info = {
                'character': row['角色'],
                'ip': row['作品']
            }
            
            # 添加头像信息
            if '头像' in row:
                character_info['avatar'] = row['头像']
            
            characters_info.append(character_info)
        
        return characters_info
