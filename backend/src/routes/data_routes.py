from typing import NoReturn, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from config import settings

from ..logger import logger
from ..services.character_metadata import (
    build_characters_info_response,
    build_votes_response,
)
from ..services.file_storage import handle_upload_data
from ..services.vote_tracker_store import get_vote_tracker

router = APIRouter()


class ApiError(HTTPException):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(status_code=status_code, detail={
            'code': code,
            'message': message,
        })


def _rethrow_http_error(error: HTTPException) -> NoReturn:
    detail = error.detail
    if isinstance(detail, dict) and 'code' in detail and 'message' in detail:
        raise error

    message = detail if isinstance(detail, str) else '请求失败'
    raise ApiError(error.status_code, 'REQUEST_FAILED', message) from error


def _get_initialized_vote_tracker(context_id: Optional[str] = None):
    vote_tracker = get_vote_tracker(context_id)
    if vote_tracker is None:
        raise ApiError(400, 'DATA_NOT_INITIALIZED', '请先上传数据文件')
    return vote_tracker


class VoteRoundsRequest(BaseModel):
    context_id: str
    excluded_columns: list[str] = Field(default_factory=list)
    exclude_wildcard: bool = False
    exclude_ranking: bool = False


class CumulativeVotesPageRequest(VoteRoundsRequest):
    pass


def _require_context_id(context_id: Optional[str]) -> str:
    if not context_id:
        raise ApiError(400, 'CONTEXT_ID_REQUIRED', '缺少数据上下文，请重新上传文件')
    return context_id


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
    except HTTPException as error:
        _rethrow_http_error(error)
    except Exception as error:
        logger.error(f"文件上传失败: {str(error)}")
        raise ApiError(400, 'UPLOAD_FAILED', str(error)) from error


@router.post(f"{settings.API_V1_STR}/votes-by-rounds")
def get_votes_by_rounds(request: VoteRoundsRequest) -> dict[str, object]:
    """获取每轮投票数据"""
    try:
        context_id = _require_context_id(request.context_id)
        vote_tracker = _get_initialized_vote_tracker(context_id)

        result = vote_tracker.get_votes_by_rounds(
            excluded_columns=request.excluded_columns,
            exclude_wildcard=request.exclude_wildcard,
            exclude_ranking=request.exclude_ranking
        )

        return build_votes_response(result)

    except HTTPException as error:
        _rethrow_http_error(error)
    except Exception as error:
        logger.error(f"获取投票数据失败: {str(error)}")
        raise ApiError(500, 'GET_VOTES_FAILED', '获取投票数据失败') from error


@router.get(f"{settings.API_V1_STR}/vote-rounds")
def get_vote_rounds(context_id: Optional[str] = None) -> dict[str, list[str]]:
    """获取投票轮次列表"""
    try:
        required_context_id = _require_context_id(context_id)
        vote_tracker = _get_initialized_vote_tracker(required_context_id)

        return {
            'vote_rounds': vote_tracker.get_vote_rounds()
        }

    except HTTPException as error:
        _rethrow_http_error(error)
    except Exception as error:
        logger.error(f"获取投票轮次失败: {str(error)}")
        raise ApiError(500, 'GET_VOTE_ROUNDS_FAILED', '获取投票轮次失败') from error


@router.get(f"{settings.API_V1_STR}/season-config")
def get_season_config(context_id: Optional[str] = None) -> dict[str, object]:
    """获取当前赛季配置契约"""
    try:
        required_context_id = _require_context_id(context_id)
        vote_tracker = _get_initialized_vote_tracker(required_context_id)
        if not vote_tracker.season:
            raise ApiError(400, 'DATA_NOT_INITIALIZED', '请先上传数据文件')

        return {
            'season': vote_tracker.season,
            'vote_rounds': vote_tracker.get_vote_rounds(),
            'wildcard_rounds': vote_tracker.wildcard_rounds,
        }

    except HTTPException as error:
        _rethrow_http_error(error)
    except Exception as error:
        logger.error(f"获取赛季配置失败: {str(error)}")
        raise ApiError(500, 'GET_SEASON_CONFIG_FAILED', '获取赛季配置失败') from error


@router.get(f"{settings.API_V1_STR}/current-season")
def get_current_season(context_id: Optional[str] = None) -> dict[str, str]:
    """获取当前赛季"""
    try:
        required_context_id = _require_context_id(context_id)
        vote_tracker = _get_initialized_vote_tracker(required_context_id)
        if not vote_tracker.season:
            raise ApiError(400, 'DATA_NOT_INITIALIZED', '请先上传数据文件')

        return {
            'season': vote_tracker.season
        }

    except HTTPException as error:
        _rethrow_http_error(error)
    except Exception as error:
        logger.error(f"获取当前赛季失败: {str(error)}")
        raise ApiError(500, 'GET_CURRENT_SEASON_FAILED', '获取当前赛季失败') from error


@router.get(f"{settings.API_V1_STR}/characters-info")
def get_characters_info(context_id: Optional[str] = None) -> list[dict[str, object]]:
    """获取角色信息"""
    try:
        required_context_id = _require_context_id(context_id)
        vote_tracker = _get_initialized_vote_tracker(required_context_id)

        characters_info = vote_tracker.get_characters_info()
        if not characters_info:
            raise ApiError(404, 'CHARACTERS_INFO_NOT_FOUND', '未找到角色信息')

        return build_characters_info_response(characters_info)

    except HTTPException as error:
        _rethrow_http_error(error)
    except Exception as error:
        logger.error(f"获取角色信息失败: {str(error)}")
        raise ApiError(500, 'GET_CHARACTERS_INFO_FAILED', '获取角色信息失败') from error


@router.post(f"{settings.API_V1_STR}/pages/cumulative-votes")
def get_cumulative_votes_page_data(request: CumulativeVotesPageRequest) -> dict[str, object]:
    """获取累计票数页面初始化数据"""
    try:
        context_id = _require_context_id(request.context_id)
        vote_tracker = _get_initialized_vote_tracker(context_id)

        votes_result = vote_tracker.get_votes_by_rounds(
            excluded_columns=request.excluded_columns,
            exclude_wildcard=request.exclude_wildcard,
            exclude_ranking=request.exclude_ranking
        )
        votes_response = build_votes_response(votes_result)

        if not vote_tracker.season:
            raise ApiError(400, 'DATA_NOT_INITIALIZED', '请先上传数据文件')

        characters_info = vote_tracker.get_characters_info()
        if not characters_info:
            raise ApiError(404, 'CHARACTERS_INFO_NOT_FOUND', '未找到角色信息')

        characters_response = build_characters_info_response(characters_info)
        final_ranks = {
            character['id']: character['rank']
            for character in characters_response
            if character.get('id') and character.get('rank') is not None
        }

        return {
            'season': vote_tracker.season,
            'season_config': {
                'season': vote_tracker.season,
                'vote_rounds': vote_tracker.get_vote_rounds(),
                'wildcard_rounds': vote_tracker.wildcard_rounds,
            },
            'characters_info': characters_response,
            'votes_by_rounds': votes_response,
            'final_ranks': final_ranks,
        }

    except HTTPException as error:
        _rethrow_http_error(error)
    except Exception as error:
        logger.error(f"获取累计票数页面初始化数据失败: {str(error)}")
        raise ApiError(500, 'GET_CUMULATIVE_VOTES_PAGE_FAILED', '获取累计票数页面初始化数据失败') from error

