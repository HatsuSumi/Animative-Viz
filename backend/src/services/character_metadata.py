import json
import os
from typing import Any, Optional, TypedDict, cast

from ..logger import logger
from ..types import CharacterInfo, VotesByRoundsResult

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.dirname(BASE_DIR)
BACKEND_DIR = os.path.dirname(SRC_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
CHARACTERS_DATA_PATH = os.path.join(PROJECT_ROOT, 'frontend', 'src', 'config', 'characters-data.json')
IPS_DATA_PATH = os.path.join(PROJECT_ROOT, 'frontend', 'src', 'config', 'ip-data.json')
CHARACTER_LOOKUP_PATH = os.path.join(PROJECT_ROOT, 'frontend', 'src', 'config', 'character-lookup.json')
RANKINGS_DATA_PATH = os.path.join(SRC_DIR, 'data', 'rankings.json')


class MultiSeasonRankingsData(TypedDict):
    seasons: dict[str, dict[str, int]]


_characters_by_id: dict[str, dict[str, Any]] = {}
_ips_by_id: dict[str, dict[str, Any]] = {}
_character_lookup: dict[str, str] = {}
_rankings_data: Optional[MultiSeasonRankingsData] = None


def _load_json_file(path: str, description: str) -> Any:
    try:
        with open(path, 'r', encoding='utf-8') as file_obj:
            return json.load(file_obj)
    except Exception as error:
        logger.error(f'加载{description}失败: {str(error)}')
        raise RuntimeError(f'加载{description}失败: {path}') from error


def _require_character_lookup() -> dict[str, str]:
    if not _character_lookup:
        raise RuntimeError('角色映射数据未初始化')
    return _character_lookup


def _validate_rankings_map(rankings: Any, description: str) -> dict[str, int]:
    if not isinstance(rankings, dict):
        raise RuntimeError(f'{description}必须是对象')

    normalized_rankings: dict[str, int] = {}
    for character_id, rank in rankings.items():
        if not isinstance(character_id, str):
            raise RuntimeError(f'{description}中的角色 ID 必须是字符串')
        if not isinstance(rank, int):
            raise RuntimeError(f'{description}中的排名必须是整数: {character_id}')
        normalized_rankings[character_id] = rank

    return normalized_rankings


def _normalize_rankings_data(raw_rankings_data: Any) -> MultiSeasonRankingsData:
    seasons = raw_rankings_data.get('seasons')
    if not isinstance(seasons, dict):
        raise RuntimeError('排名数据必须包含 seasons 字段，且其值必须是对象')

    normalized_seasons: dict[str, dict[str, int]] = {}
    for season, rankings in seasons.items():
        if not isinstance(season, str):
            raise RuntimeError('排名数据中的赛季键必须是字符串')
        normalized_seasons[season] = _validate_rankings_map(rankings, f'赛季 {season} 的排名数据')

    return {'seasons': normalized_seasons}


def _load_rankings() -> MultiSeasonRankingsData:
    global _rankings_data

    if _rankings_data is not None:
        return _rankings_data

    raw_rankings_data = _load_json_file(RANKINGS_DATA_PATH, '排名数据')
    _rankings_data = _normalize_rankings_data(raw_rankings_data)
    return _rankings_data


def _get_rankings_for_season(season: Optional[str]) -> dict[str, int]:
    rankings_data = _load_rankings()
    rankings_by_season = rankings_data['seasons']

    if season is None:
        if len(rankings_by_season) == 1:
            return next(iter(rankings_by_season.values()))

        logger.warning('未提供赛季，且存在多个赛季排名数据，已忽略排名')
        return {}

    rankings = rankings_by_season.get(season)
    if rankings is None:
        logger.warning(f'未找到赛季 {season} 的排名数据，已忽略排名')
        return {}

    return rankings


def load_characters_data() -> None:
    """加载角色数据到内存"""
    global _characters_by_id, _ips_by_id, _character_lookup, _rankings_data

    _characters_by_id = _load_json_file(CHARACTERS_DATA_PATH, '角色数据')
    _ips_by_id = _load_json_file(IPS_DATA_PATH, '作品数据')
    _character_lookup = _load_json_file(CHARACTER_LOOKUP_PATH, '角色映射数据')
    _rankings_data = None
    _load_rankings()


def build_votes_response(result: VotesByRoundsResult) -> dict[str, Any]:
    """组装投票轮次接口响应"""
    processed_data = []
    character_lookup = _require_character_lookup()

    for char_data in result['votes_data']:
        character = char_data['character']
        series = char_data['series']
        lookup_key = f'{character}@{series}'
        character_id = character_lookup.get(lookup_key)

        if ' (' in character:
            character = character.split(' (')[0]
            lookup_key = f'{character}@{series}'
            character_id = character_lookup.get(lookup_key, character_id)

        rounds_data = {}
        for index, vote in enumerate(char_data['votes']):
            if index < len(result['vote_rounds']):
                round_name = result['vote_rounds'][index]
                rounds_data[round_name] = vote

        processed_data.append({
            'id': character_id,
            'character': character,
            'ip': series,
            'rounds': rounds_data,
        })

    return {
        'votes_data': processed_data,
        'vote_rounds': result['vote_rounds'],
        'participating_counts': result['participating_counts'],
    }


def _normalize_cv(cv_value: Any) -> list[str]:
    if isinstance(cv_value, list):
        normalized_cv = [str(item).strip() for item in cv_value if str(item).strip()]
        return normalized_cv

    if isinstance(cv_value, str):
        normalized_value = cv_value.strip()
        return [normalized_value] if normalized_value else []

    return []


def build_characters_info_response(
    characters_info: list[CharacterInfo],
    season: Optional[str] = None,
) -> list[dict[str, Any]]:
    """组装角色信息接口响应"""
    character_lookup = _require_character_lookup()
    rankings = _get_rankings_for_season(season)

    for char_info in characters_info:
        char_name = char_info['character']
        char_ip = char_info['ip']
        lookup_key = f'{char_name}@{char_ip}'
        character_id = character_lookup.get(lookup_key)

        char_info['id'] = character_id
        char_info['rank'] = rankings.get(character_id) if character_id else None

        character_meta = _characters_by_id.get(character_id) if character_id else None
        ip_meta = _ips_by_id.get(character_meta['ip_id']) if character_meta else None

        if character_meta:
            char_info['avatar'] = character_meta.get('avatar') or char_info.get('avatar', '')
            char_info['name_en'] = character_meta.get('name_en', '')
            char_info['cv'] = _normalize_cv(character_meta.get('cv'))

        if ip_meta:
            char_info['ip_id'] = ip_meta.get('id')
            char_info['ip_year'] = ip_meta.get('year')
            char_info['ip_season'] = ip_meta.get('season')

    return cast(list[dict[str, Any]], characters_info)
