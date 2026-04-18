from .seasons import NON_VOTE_COLUMNS, SEASONS_CONFIG


def get_season_rounds(season: str) -> list[str]:
    """
    获取指定赛季的投票轮次

    :param season: 赛季，如 "2023"
    :return: 投票轮次列表
    :raises: KeyError 如果赛季不存在
    """
    if season not in SEASONS_CONFIG:
        raise KeyError(f"赛季配置不存在: {season}")
    return SEASONS_CONFIG[season]["vote_columns"]


def get_eliminated_characters(season: str, round_name: str) -> list[dict[str, str]]:
    """
    获取指定轮次淘汰的角色列表

    :param season: 赛季，如 "2023"
    :param round_name: 轮次名称
    :return: 淘汰角色列表，每个角色包含 character 和 series
    """
    if season not in SEASONS_CONFIG:
        raise KeyError(f"赛季配置不存在: {season}")
    return SEASONS_CONFIG[season].get("eliminated_characters", {}).get(round_name, [])


def get_wildcard_rounds(season: str) -> list[str]:
    """
    获取指定赛季的外卡赛轮次

    :param season: 赛季，如 "2023"
    :return: 外卡赛轮次列表
    :raises: KeyError 如果赛季不存在
    """
    if season not in SEASONS_CONFIG:
        raise KeyError(f"赛季配置不存在: {season}")
    return SEASONS_CONFIG[season].get("wildcard_rounds", [])
