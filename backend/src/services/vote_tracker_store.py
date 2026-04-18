import os
from typing import Optional

from ..logger import logger
from ..vote_tracker import VoteTracker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.dirname(BASE_DIR)
BACKEND_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(BACKEND_DIR, 'data')
LATEST_FILE_PATH = os.path.join(DATA_DIR, '.latest')

_vote_tracker: Optional[VoteTracker] = None


def get_vote_tracker() -> Optional[VoteTracker]:
    """获取当前的 VoteTracker 实例"""
    global _vote_tracker

    try:
        if _vote_tracker is not None:
            return _vote_tracker

        if os.path.exists(LATEST_FILE_PATH):
            with open(LATEST_FILE_PATH, 'r', encoding='utf-8') as file_obj:
                csv_path = file_obj.read().strip()

            if not os.path.isabs(csv_path):
                csv_path = os.path.abspath(csv_path)

            if os.path.exists(csv_path):
                _vote_tracker = VoteTracker(csv_path)
                return _vote_tracker

            logger.error(f'CSV 文件不存在: {csv_path}')
        else:
            logger.error('未找到 .latest 文件')

        return None
    except Exception as error:
        logger.error(f'获取 VoteTracker 失败: {str(error)}')
        return None


def save_latest_file_path(file_path: str) -> None:
    """保存最新的文件路径"""
    global _vote_tracker

    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(LATEST_FILE_PATH, 'w', encoding='utf-8') as file_obj:
            file_obj.write(file_path)
        _vote_tracker = None
    except Exception as error:
        logger.error(f'保存最新文件路径失败: {str(error)}')

