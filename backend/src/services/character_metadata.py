import json
import os
from typing import Any, cast

from ..logger import logger
from ..vote_tracker import CharacterInfo, VotesByRoundsResult

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.dirname(BASE_DIR)
BACKEND_DIR = os.path.dirname(SRC_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
CHARACTERS_DATA_PATH = os.path.join(PROJECT_ROOT, 'frontend', 'src', 'config', 'characters-data.json')
IPS_DATA_PATH = os.path.join(PROJECT_ROOT, 'frontend', 'src', 'config', 'ip-data.json')
CHARACTER_LOOKUP_PATH = os.path.join(PROJECT_ROOT, 'frontend', 'src', 'config', 'character-lookup.json')
RANKINGS_DATA_PATH = os.path.join(SRC_DIR, 'data', 'rankings.json')

_characters_by_id: dict[str, dict[str, Any]] = {}
_ips_by_id: dict[str, dict[str, Any]] = {}
_character_lookup: dict[str, str] = {}


def load_characters_data() -> None:
    """加载角色数据到内存"""
    global _characters_by_id, _ips_by_id, _character_lookup

    try:
        with open(CHARACTERS_DATA_PATH, 'r', encoding='utf-8') as file_obj:
            _characters_by_id = json.load(file_obj)
        with open(IPS_DATA_PATH, 'r', encoding='utf-8') as file_obj:
            _ips_by_id = json.load(file_obj)
        with open(CHARACTER_LOOKUP_PATH, 'r', encoding='utf-8') as file_obj:
            _character_lookup = json.load(file_obj)
    except Exception as error:
        logger.error(f'加载角色数据失败: {str(error)}')
        _characters_by_id = {}
        _ips_by_id = {}
        _character_lookup = {}


def build_votes_response(result: VotesByRoundsResult) -> dict[str, Any]:
    """组装投票轮次接口响应"""
    processed_data = []

    for char_data in result['votes_data']:
        character = char_data['character']
        series = char_data['series']
        lookup_key = f'{character}@{series}'
        character_id = _character_lookup.get(lookup_key)

        if ' (' in character:
            character = character.split(' (')[0]
            lookup_key = f'{character}@{series}'
            character_id = _character_lookup.get(lookup_key, character_id)

        rounds_data = {}
        for index, vote in enumerate(char_data['votes']):
            if index < len(result['vote_rounds']):
                round_name = result['vote_rounds'][index]
                rounds_data[round_name] = vote

        processed_data.append({
            'id': character_id,
            'character': character,
            'ip': series,
            'rounds': rounds_data
        })

    return {
        'votes_data': processed_data,
        'vote_rounds': result['vote_rounds'],
        'participating_counts': result['participating_counts']
    }


def build_characters_info_response(characters_info: list[CharacterInfo]) -> list[dict[str, Any]]:
    """组装角色信息接口响应"""
    try:
        with open(RANKINGS_DATA_PATH, 'r', encoding='utf-8') as file_obj:
            rankings_data = json.load(file_obj)
            rankings = rankings_data['rankings']
    except Exception as error:
        logger.error(f'读取排名数据失败: {str(error)}')
        rankings = {}

    for char_info in characters_info:
        char_name = char_info['character']
        char_ip = char_info['ip']
        lookup_key = f'{char_name}@{char_ip}'
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

    return cast(list[dict[str, Any]], characters_info)

