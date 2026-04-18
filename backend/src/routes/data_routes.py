from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from config import settings

from ..logger import logger
from ..services import (
    build_characters_info_response,
    build_votes_response,
    get_vote_tracker,
    handle_legacy_upload,
    handle_upload_data,
)

router = APIRouter()


class VoteRoundsRequest(BaseModel):
    excluded_columns: list[str] = Field(default_factory=list)
    exclude_wildcard: bool = False
    exclude_ranking: bool = False


@router.post(f"{settings.API_V1_STR}/upload-data")
async def upload_data(
    file: UploadFile = File(...),
    original_path: str = Form(...)
) -> dict[str, object]:
    """
    处理文件上传

    :param file: 上传的文件
    :param original_path: 原始文件路径
    :return: 上传结果信息
    """
    try:
        return handle_upload_data(file, original_path)
    except Exception as error:
        logger.error(f"文件上传失败: {str(error)}")
        raise HTTPException(status_code=400, detail=str(error))


@router.post(f"{settings.API_V1_STR}/upload")
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
        return handle_legacy_upload(file)
    except Exception as error:
        logger.error(f"文件上传失败: {str(error)}")
        raise HTTPException(status_code=500, detail=str(error))


@router.get(f"{settings.API_V1_STR}/votes-by-rounds")
@router.post(f"{settings.API_V1_STR}/votes-by-rounds")
def get_votes_by_rounds(
    request: Optional[VoteRoundsRequest] = None,
    excluded_columns: list[str] = Query([]),
    exclude_wildcard: bool = Query(False),
    exclude_ranking: bool = Query(False)
):
    """获取每轮投票数据"""
    try:
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

        return build_votes_response(result)

    except Exception as error:
        logger.error(f"获取投票数据失败: {str(error)}")
        raise HTTPException(
            status_code=500,
            detail=f"获取投票数据失败: {str(error)}"
        )


@router.get(f"{settings.API_V1_STR}/vote-rounds")
def get_vote_rounds():
    """获取投票轮次列表"""
    try:
        vote_tracker = get_vote_tracker()
        if vote_tracker is None:
            raise HTTPException(status_code=400, detail="请先上传数据文件")

        return vote_tracker.get_vote_rounds()

    except Exception as error:
        logger.error(f"获取投票轮次失败: {str(error)}")
        raise HTTPException(
            status_code=500,
            detail=f"获取投票轮次失败: {str(error)}"
        )


@router.get(f"{settings.API_V1_STR}/current-season")
def get_current_season():
    """获取当前赛季"""
    try:
        vote_tracker = get_vote_tracker()
        if not vote_tracker:
            raise HTTPException(status_code=500, detail="数据未初始化")

        return vote_tracker.season

    except Exception as error:
        logger.error(f"获取当前赛季失败: {str(error)}")
        raise HTTPException(status_code=500, detail=str(error))


@router.get(f"{settings.API_V1_STR}/characters-info")
def get_characters_info():
    """获取角色信息"""
    try:
        vote_tracker = get_vote_tracker()
        if not vote_tracker:
            raise HTTPException(status_code=500, detail="数据未初始化")

        characters_info = vote_tracker.get_characters_info()
        if not characters_info:
            raise HTTPException(status_code=404, detail="未找到角色信息")

        return build_characters_info_response(characters_info)

    except Exception as error:
        logger.error(f"获取角色信息失败: {str(error)}")
        raise HTTPException(status_code=500, detail=str(error))

