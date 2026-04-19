import hashlib
import os
from typing import Optional

from ..logger import logger
from ..vote_tracker import VoteTracker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.dirname(BASE_DIR)
BACKEND_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(BACKEND_DIR, 'data')
CONTEXTS_DIR = os.path.join(DATA_DIR, 'contexts')

_vote_trackers: dict[str, VoteTracker] = {}


def build_vote_tracker_context_id(file_path: str) -> str:
    normalized_path = os.path.abspath(file_path)
    return hashlib.md5(normalized_path.encode('utf-8')).hexdigest()


def _build_context_file_path(context_id: str) -> str:
    return os.path.join(CONTEXTS_DIR, f'{context_id}.txt')


def _load_context_csv_path(context_id: str) -> Optional[str]:
    context_file_path = _build_context_file_path(context_id)
    if not os.path.exists(context_file_path):
        logger.error(f'未找到上下文文件: {context_id}')
        return None

    with open(context_file_path, 'r', encoding='utf-8') as file_obj:
        csv_path = file_obj.read().strip()

    if not os.path.isabs(csv_path):
        csv_path = os.path.abspath(csv_path)

    if not os.path.exists(csv_path):
        logger.error(f'上下文对应的 CSV 文件不存在: {csv_path}')
        return None

    return csv_path


def get_vote_tracker(context_id: Optional[str] = None) -> Optional[VoteTracker]:
    """获取指定上下文的 VoteTracker 实例"""
    try:
        if not context_id:
            logger.error('缺少上下文 ID')
            return None

        if context_id in _vote_trackers:
            return _vote_trackers[context_id]

        csv_path = _load_context_csv_path(context_id)
        if csv_path is None:
            return None

        vote_tracker = VoteTracker(csv_path)
        _vote_trackers[context_id] = vote_tracker
        return vote_tracker
    except Exception as error:
        logger.error(f'获取 VoteTracker 失败: {str(error)}')
        return None


def save_vote_tracker_context(file_path: str) -> str:
    """保存上下文文件路径并返回上下文 ID"""
    try:
        os.makedirs(CONTEXTS_DIR, exist_ok=True)

        context_id = build_vote_tracker_context_id(file_path)
        context_file_path = _build_context_file_path(context_id)

        with open(context_file_path, 'w', encoding='utf-8') as file_obj:
            file_obj.write(file_path)

        _vote_trackers.pop(context_id, None)
        return context_id
    except Exception as error:
        logger.error(f'保存上下文文件路径失败: {str(error)}')
        raise

