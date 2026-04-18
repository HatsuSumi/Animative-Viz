import os
import sys
import shutil
import tempfile
import hashlib
import json
from typing import Any, Optional
from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from config import settings
from .vote_tracker import VoteTracker
from .logger import logger

# 添加项目根目录到 Python 路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

# 创建 FastAPI 实例
app = FastAPI(title="动态数据可视化工具")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局变量
_characters_by_id: dict[str, dict[str, Any]] = {}
_ips_by_id: dict[str, dict[str, Any]] = {}
_character_lookup: dict[str, str] = {}
_vote_tracker: Optional[VoteTracker] = None  # 缓存VoteTracker实例
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
CHARACTERS_DATA_PATH = os.path.join(PROJECT_ROOT, 'frontend', 'src', 'config', 'characters-data.json')
IPS_DATA_PATH = os.path.join(PROJECT_ROOT, 'frontend', 'src', 'config', 'ip-data.json')
CHARACTER_LOOKUP_PATH = os.path.join(PROJECT_ROOT, 'frontend', 'src', 'config', 'character-lookup.json')
RANKINGS_DATA_PATH = os.path.join(BASE_DIR, 'data', 'rankings.json')

def load_characters_data():
    """加载角色数据到内存"""
    global _characters_by_id, _ips_by_id, _character_lookup
    try:
        with open(CHARACTERS_DATA_PATH, 'r', encoding='utf-8') as f:
            _characters_by_id = json.load(f)
        with open(IPS_DATA_PATH, 'r', encoding='utf-8') as f:
            _ips_by_id = json.load(f)
        with open(CHARACTER_LOOKUP_PATH, 'r', encoding='utf-8') as f:
            _character_lookup = json.load(f)
    except Exception as e:
        logger.error(f"加载角色数据失败: {str(e)}")
        _characters_by_id = {}
        _ips_by_id = {}
        _character_lookup = {}

# 启动时加载数据
load_characters_data()

# 数据文件目录
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
LATEST_FILE_PATH = os.path.join(DATA_DIR, '.latest')

def get_vote_tracker() -> Optional[VoteTracker]:
    """获取当前的 VoteTracker 实例"""
    global _vote_tracker
    
    try:
        # 如果已经有缓存的实例，直接返回
        if _vote_tracker is not None:
            return _vote_tracker
            
        # 如果 .latest 文件存在，从中读取最新的 CSV 文件路径
        if os.path.exists(LATEST_FILE_PATH):
            with open(LATEST_FILE_PATH, 'r') as f:
                csv_path = f.read().strip()
                # 将相对路径转换为绝对路径
                if not os.path.isabs(csv_path):
                    csv_path = os.path.abspath(csv_path)
                if os.path.exists(csv_path):
                    _vote_tracker = VoteTracker(csv_path)
                    return _vote_tracker
                else:
                    logger.error(f"CSV 文件不存在: {csv_path}")
        else:
            logger.error("未找到 .latest 文件")
        return None
    except Exception as e:
        logger.error(f"获取 VoteTracker 失败: {str(e)}")
        return None

def save_latest_file_path(file_path: str):
    """保存最新的文件路径"""
    global _vote_tracker
    
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(LATEST_FILE_PATH, 'w') as f:
            f.write(file_path)
        # 清除缓存的VoteTracker实例，这样下次get_vote_tracker会重新创建
        _vote_tracker = None
    except Exception as e:
        logger.error(f"保存最新文件路径失败: {str(e)}")

def calculate_file_hash(file_path: str) -> str:
    """计算文件的 MD5 哈希值"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

@app.post(f"{settings.API_V1_STR}/upload-data")
async def upload_data(
    file: UploadFile = File(...), 
    original_path: str = Form(...)
) -> dict[str, Any]:
    """
    处理文件上传
    
    :param file: 上传的文件
    :param original_path: 原始文件路径
    :return: 上传结果信息
    """
    try:
        # 创建数据目录（如果不存在）
        os.makedirs(DATA_DIR, exist_ok=True)
        
        # 使用原始文件名
        filename = file.filename or os.path.basename(original_path)
        target_path = os.path.join(DATA_DIR, filename)
        
        # 如果上传的就是目标文件，直接使用它
        if os.path.abspath(original_path) == os.path.abspath(target_path):
            logger.info(f"直接使用文件: {filename}")
            vote_tracker = VoteTracker(target_path)
            total_characters = len(vote_tracker.data.index) if vote_tracker.data is not None else 0
            save_latest_file_path(target_path)
            return {
                "message": "直接使用上传的文件",
                "filename": filename,
                "project_path": target_path,
                "total_characters": total_characters,
                "vote_rounds": vote_tracker.vote_columns
            }
        
        # 先将上传的文件保存到临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
        
        try:
            # 检查文件是否有效
            vote_tracker_temp = VoteTracker(temp_path, filename)
            
            # 如果目标文件已存在，比较文件内容
            if os.path.exists(target_path):
                old_hash = calculate_file_hash(target_path)
                new_hash = calculate_file_hash(temp_path)
                
                if old_hash == new_hash:
                    # 文件内容相同，使用已有文件
                    os.unlink(temp_path)
                    logger.info(f"文件内容未变化: {filename}")
                    save_latest_file_path(target_path)
                    total_characters = len(vote_tracker_temp.data.index) if vote_tracker_temp.data is not None else 0
                    return {
                        "message": "文件内容未变化，继续使用已有文件",
                        "filename": filename,
                        "project_path": target_path,
                        "total_characters": total_characters,
                        "vote_rounds": vote_tracker_temp.vote_columns
                    }
                else:
                    # 文件内容不同，覆盖旧文件
                    logger.info(f"更新文件: {filename}")
                    shutil.move(temp_path, target_path)
            else:
                # 目标文件不存在，直接移动临时文件
                logger.info(f"新增文件: {filename}")
                shutil.move(temp_path, target_path)
            
            # 保存最新文件路径
            save_latest_file_path(target_path)
            
            # 使用新文件创建 VoteTracker
            vote_tracker = VoteTracker(target_path)
            total_characters = len(vote_tracker.data.index) if vote_tracker.data is not None else 0
            
            return {
                "message": "文件上传成功",
                "filename": filename,
                "project_path": target_path,
                "total_characters": total_characters,
                "vote_rounds": vote_tracker.vote_columns,
                "file_hash": calculate_file_hash(target_path)
            }
            
        except Exception as e:
            # 清理临时文件
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            raise e
            
    except Exception as e:
        logger.error(f"文件上传失败: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post(f"{settings.API_V1_STR}/upload")
async def upload_legacy_data(
    file: UploadFile = File(...), 
    original_path: str = Form(...)
):
    """
    处理文件上传
    
    :param file: 上传的文件
    :param original_path: 原始文件路径
    :return: 上传结果信息
    """
    try:
        # 创建临时文件
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name

        # 计算上传文件的哈希值
        new_hash = calculate_file_hash(temp_path)
        
        # 检查文件是否已经上传过
        latest_file = os.path.join(DATA_DIR, 'latest.csv')
        if os.path.exists(latest_file):
            old_hash = calculate_file_hash(latest_file)
            if new_hash == old_hash:
                os.unlink(temp_path)  # 删除临时文件
                return JSONResponse(
                    status_code=200,
                    content={
                        "message": "文件内容未变化，无需重新上传",
                        "status": "unchanged"
                    }
                )

        # 确保数据目录存在
        os.makedirs(DATA_DIR, exist_ok=True)

        # 移动文件到数据目录
        shutil.move(temp_path, latest_file)
        
        # 保存最新文件路径
        save_latest_file_path(latest_file)

        return JSONResponse(
            status_code=200,
            content={
                "message": "文件上传成功",
                "status": "success",
                "file_path": latest_file
            }
        )

    except Exception as e:
        # 确保清理临时文件
        if 'temp_path' in locals():
            try:
                os.unlink(temp_path)
            except OSError:
                pass
        
        logger.error(f"文件上传失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        file.file.close()

class VoteRoundsRequest(BaseModel):
    excluded_columns: list[str] = Field(default_factory=list)
    exclude_wildcard: bool = False
    exclude_ranking: bool = False

@app.get(f"{settings.API_V1_STR}/votes-by-rounds")
@app.post(f"{settings.API_V1_STR}/votes-by-rounds")
def get_votes_by_rounds(
    request: Optional[VoteRoundsRequest] = None,
    excluded_columns: list[str] = Query([]),  
    exclude_wildcard: bool = Query(False),
    exclude_ranking: bool = Query(False)
):
    """获取每轮投票数据"""
    try:
        # 如果是 POST 请求，使用请求体中的参数
        if request:
            excluded_columns = request.excluded_columns
            exclude_wildcard = request.exclude_wildcard
            exclude_ranking = request.exclude_ranking

        vote_tracker = get_vote_tracker()
        if vote_tracker is None:
            raise HTTPException(status_code=400, detail="请先上传数据文件")
            
        result = vote_tracker.get_votes_by_rounds(
            excluded_columns=excluded_columns,
            exclude_wildcard=exclude_wildcard,
            exclude_ranking=exclude_ranking
        )

        # 处理数据：去掉作品名并补充角色 ID
        processed_data = []
        for char_data in result['votes_data']:
            character = char_data["character"]
            series = char_data["series"]
            lookup_key = f"{character}@{series}"
            character_id = _character_lookup.get(lookup_key)

            if " (" in character:
                character = character.split(" (")[0]
                lookup_key = f"{character}@{series}"
                character_id = _character_lookup.get(lookup_key, character_id)
                
            # 将votes列表转换为rounds字典
            rounds_data = {}
            for i, vote in enumerate(char_data["votes"]):
                if i < len(result['vote_rounds']):
                    round_name = result['vote_rounds'][i]
                    rounds_data[round_name] = vote

            processed_data.append({
                "id": character_id,
                "character": character,
                "ip": series,
                "rounds": rounds_data
            })

        # 使用已处理好的轮次列表
        vote_rounds = result['vote_rounds']

        # 使用已计算好的参与人数
        participating_counts = result['participating_counts']

        return {
            "votes_data": processed_data,
            "vote_rounds": vote_rounds,
            "participating_counts": participating_counts
        }

    except Exception as e:
        logger.error(f"获取投票数据失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"获取投票数据失败: {str(e)}"
        )

@app.get(f"{settings.API_V1_STR}/vote-rounds")
def get_vote_rounds():
    """获取投票轮次列表"""
    try:
        vote_tracker = get_vote_tracker()
        if vote_tracker is None:
            raise HTTPException(status_code=400, detail="请先上传数据文件")
            
        return vote_tracker.get_vote_rounds()

    except Exception as e:
        logger.error(f"获取投票轮次失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"获取投票轮次失败: {str(e)}"
        )

@app.get(f"{settings.API_V1_STR}/current-season")
def get_current_season():
    """获取当前赛季"""
    try:
        vote_tracker = get_vote_tracker()
        if not vote_tracker:
            raise HTTPException(status_code=500, detail="数据未初始化")
            
        return vote_tracker.season

    except Exception as e:
        logger.error(f"获取当前赛季失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get(f"{settings.API_V1_STR}/characters-info")
def get_characters_info():
    """获取角色信息"""
    try:
        vote_tracker = get_vote_tracker()
        if not vote_tracker:
            raise HTTPException(status_code=500, detail="数据未初始化")

        # 获取角色基本信息
        characters_info = vote_tracker.get_characters_info()
        if not characters_info:
            raise HTTPException(status_code=404, detail="未找到角色信息")

        # 读取排名数据
        try:
            with open(RANKINGS_DATA_PATH, 'r', encoding='utf-8') as f:
                rankings_data = json.load(f)
                rankings = rankings_data['rankings']
        except Exception as e:
            logger.error(f"读取排名数据失败: {str(e)}")
            rankings = {}

        # 将排名和头像信息添加到角色信息中
        for char_info in characters_info:
            char_name = char_info['character']
            char_ip = char_info['ip']
            lookup_key = f"{char_name}@{char_ip}"
            character_id = _character_lookup.get(lookup_key)

            char_info['id'] = character_id
            char_info['rank'] = rankings.get(character_id) if character_id else None

            character_meta = _characters_by_id.get(character_id) if character_id else None
            ip_meta = _ips_by_id.get(character_meta['ip_id']) if character_meta else None

            if character_meta:
                char_info['avatar'] = character_meta.get('avatar') or char_info.get('avatar', '')
                char_info['name_en'] = character_meta.get('name_en', '')
                char_info['cv'] = character_meta.get('cv', '')

            if ip_meta:
                char_info['ip_id'] = ip_meta.get('id')
                char_info['ip_year'] = ip_meta.get('year')
                char_info['ip_season'] = ip_meta.get('season')

        return characters_info

    except Exception as e:
        logger.error(f"获取角色信息失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
