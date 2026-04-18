import hashlib
import os
import shutil
import tempfile
from typing import Any

from fastapi import UploadFile

from .vote_tracker_store import save_latest_file_path
from ..logger import logger
from ..vote_tracker import VoteTracker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.dirname(BASE_DIR)
BACKEND_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(BACKEND_DIR, 'data')


def calculate_file_hash(file_path: str) -> str:
    """计算文件的 MD5 哈希值"""
    hash_md5 = hashlib.md5()
    with open(file_path, 'rb') as file_obj:
        for chunk in iter(lambda: file_obj.read(4096), b''):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()


def handle_upload_data(file: UploadFile, original_path: str) -> dict[str, Any]:
    """处理新版上传接口"""
    os.makedirs(DATA_DIR, exist_ok=True)

    filename = file.filename or os.path.basename(original_path)
    target_path = os.path.join(DATA_DIR, filename)

    if os.path.abspath(original_path) == os.path.abspath(target_path):
        logger.info(f'直接使用文件: {filename}')
        vote_tracker = VoteTracker(target_path)
        total_characters = len(vote_tracker.data.index) if vote_tracker.data is not None else 0
        save_latest_file_path(target_path)
        return {
            'message': '直接使用上传的文件',
            'filename': filename,
            'project_path': target_path,
            'total_characters': total_characters,
            'vote_rounds': vote_tracker.vote_columns
        }

    with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_path = temp_file.name

    try:
        vote_tracker_temp = VoteTracker(temp_path, filename)

        if os.path.exists(target_path):
            old_hash = calculate_file_hash(target_path)
            new_hash = calculate_file_hash(temp_path)

            if old_hash == new_hash:
                os.unlink(temp_path)
                logger.info(f'文件内容未变化: {filename}')
                save_latest_file_path(target_path)
                total_characters = len(vote_tracker_temp.data.index) if vote_tracker_temp.data is not None else 0
                return {
                    'message': '文件内容未变化，继续使用已有文件',
                    'filename': filename,
                    'project_path': target_path,
                    'total_characters': total_characters,
                    'vote_rounds': vote_tracker_temp.vote_columns
                }

            logger.info(f'更新文件: {filename}')
            shutil.move(temp_path, target_path)
        else:
            logger.info(f'新增文件: {filename}')
            shutil.move(temp_path, target_path)

        save_latest_file_path(target_path)

        vote_tracker = VoteTracker(target_path)
        total_characters = len(vote_tracker.data.index) if vote_tracker.data is not None else 0

        return {
            'message': '文件上传成功',
            'filename': filename,
            'project_path': target_path,
            'total_characters': total_characters,
            'vote_rounds': vote_tracker.vote_columns,
            'file_hash': calculate_file_hash(target_path)
        }
    except Exception:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
        raise

