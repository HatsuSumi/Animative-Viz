"""
存储每个赛季的投票轮次配置
"""

SEASONS_CONFIG = {
    "2023": {
        "vote_columns": [
            "预选赛第一轮", "预选赛第二轮", 
            "第一阶段第一轮", "第一阶段第二轮", "第一阶段第三轮", "第一阶段第四轮",
            "第二阶段第一轮", "第二阶段第二轮", "第二阶段第三轮", "第二阶段第四轮",
            "第三阶段第一轮", "第三阶段第二轮", "第三阶段第三轮", "第三阶段第四轮",
            "淘汰赛第一轮", "淘汰赛第二轮", "淘汰赛第三轮", "淘汰赛第四轮"
        ],
        "eliminated_characters": {
            "预选赛第二轮": [
                {"character": "艾莉丝·伯雷亚斯·格雷拉特", "series": "无职转生"},
                {"character": "长门有希", "series": "凉宫春日的忧郁"},
                {"character": "泉此方", "series": "幸运☆星"},
                {"character": "阿库娅", "series": "为美好的世界献上祝福！"},
                {"character": "一色伊吕波", "series": "我的青春恋爱物语果然有问题。"},
                {"character": "夜刀神十香", "series": "约会大作战"},
                {"character": "灶门祢豆子", "series": "鬼灭之刃"},
                {"character": "珂朵莉·诺塔·瑟尼欧里斯", "series": "末日时在做什么？有没有空？可以来拯救吗？"},
                {"character": "轻井泽惠", "series": "欢迎来到实力至上主义的教室"},
                {"character": "栗山未来", "series": "境界的彼方"},
                {"character": "胡桃", "series": "莉可丽丝"},
                {"character": "桐崎千棘", "series": "伪恋"}
            ],
            "第一阶段第四轮": [
                {"character": "凉宫春日", "series": "凉宫春日的忧郁"},
                {"character": "早坂爱", "series": "辉夜大小姐想让我告白～天才们的恋爱头脑战～"},
                {"character": "三笠·阿克曼", "series": "进击的巨人"},
                {"character": "高木", "series": "擅长捉弄的高木同学"},
                {"character": "铠冢霙", "series": "吹响！上低音号"},
                {"character": "晓美焰", "series": "魔法少女小圆"},
                {"character": "四糸乃", "series": "约会大作战"},
                {"character": "鹿目圆", "series": "魔法少女小圆"},
                {"character": "伞木希美", "series": "吹响！上低音号"},
                {"character": "鸢一折纸", "series": "约会大作战"},
                {"character": "喜多川海梦", "series": "更衣人偶坠入爱河"},
                {"character": "楪祈", "series": "罪恶王冠"},
                {"character": "五河琴里", "series": "约会大作战"},
                {"character": "惣流·明日香·兰格雷", "series": "新世纪福音战士"},
                {"character": "东海帝王", "series": "赛马娘 Pretty Derby"},
                {"character": "绫波丽", "series": "新世纪福音战士"},
                {"character": "由崎司", "series": "总之就是非常可爱"},
                {"character": "灰原哀", "series": "名侦探柯南"},
                {"character": "逢坂大河", "series": "龙与虎"},
                {"character": "堀北铃音", "series": "欢迎来到实力至上主义的教室"}
            ],
            "第二阶段第四轮": [
                {"character": "琴吹䌷", "series": "轻音少女"},
                {"character": "四宫辉夜", "series": "辉夜大小姐想让我告白～天才们的恋爱头脑战～"},
                {"character": "宫水三叶", "series": "你的名字。"},
                {"character": "惠惠", "series": "为美好的世界献上祝福！"},
                {"character": "白井黑子", "series": "魔法禁书目录"},
                {"character": "古河渚", "series": "CLANNAD"},
                {"character": "立华奏", "series": "Angel Beats!"},
                {"character": "锦木千束", "series": "莉可丽丝"},
                {"character": "西宫硝子", "series": "声之形"},
                {"character": "中野二乃", "series": "五等分的新娘"},
                {"character": "宫园薰", "series": "四月是你的谎言"},
                {"character": "由比滨结衣", "series": "我的青春恋爱物语果然有问题。"},
                {"character": "春日野穹", "series": "缘之空"},
                {"character": "井之上泷奈", "series": "莉可丽丝"},
                {"character": "牧濑红莉栖", "series": "命运石之门"},
                {"character": "洛琪希·米格路迪亚", "series": "无职转生"}
            ],
            "第三阶段第四轮": [
                {"character": "阿尔托莉雅·潘德拉贡", "series": "Fate系列"},
                {"character": "和泉纱雾", "series": "埃罗芒阿老师"},
                {"character": "时崎狂三", "series": "约会大作战"},
                {"character": "艾拉", "series": "可塑性记忆"},
                {"character": "伊地知虹夏", "series": "孤独摇滚！"},
                {"character": "远坂凛", "series": "Fate系列"},
                {"character": "山田凉", "series": "孤独摇滚！"},
                {"character": "田井中律", "series": "轻音少女"}
            ],
            "淘汰赛第一轮": [
                {"character": "小鸟游六花", "series": "中二病也要谈恋爱！"},
                {"character": "北白川玉子", "series": "玉子市场"},
                {"character": "芙拉蒂蕾娜·米利杰", "series": "86 -不存在的战区-"},
                {"character": "爱蜜莉雅", "series": "Re:从零开始的异世界生活"},
                {"character": "中野三玖", "series": "五等分的新娘"},
                {"character": "秋山澪", "series": "轻音少女"},
                {"character": "喜多郁代", "series": "孤独摇滚！"},
                {"character": "椎名真白", "series": "樱花庄的宠物女孩"}
            ],
            "淘汰赛第二轮": [
                {"character": "白", "series": "NO GAME NO LIFE 游戏人生"},
                {"character": "樱岛麻衣", "series": "青春猪头少年"},
                {"character": "平泽唯", "series": "轻音少女"},
                {"character": "友利奈绪", "series": "Charlotte"}
            ],
            "淘汰赛第三轮": [
                {"character": "中野梓", "series": "轻音少女"},
                {"character": "结城明日奈", "series": "刀剑神域"}
            ],
            "淘汰赛第四轮": [
                {"character": "后藤一里", "series": "孤独摇滚！"}
            ]
        },
        # 外卡赛轮次（正赛阶段的第四轮）
        "wildcard_rounds": [
            "第一阶段第四轮",
            "第二阶段第四轮",
            "第三阶段第四轮"
        ]
    }
}

# 非投票列名（基础信息列）
NON_VOTE_COLUMNS = {
    "序号",
    "角色",
    "作品",
    "CV",
    "累计得票数"
}

def get_season_rounds(season: str) -> list:
    """
    获取指定赛季的投票轮次
    
    :param season: 赛季，如 "2023"
    :return: 投票轮次列表
    :raises: KeyError 如果赛季不存在
    """
    if season not in SEASONS_CONFIG:
        raise KeyError(f"赛季配置不存在: {season}")
    return SEASONS_CONFIG[season]["vote_columns"]

def get_eliminated_characters(season: str, round_name: str) -> list:
    """
    获取指定轮次淘汰的角色列表
    
    :param season: 赛季，如 "2023"
    :param round_name: 轮次名称
    :return: 淘汰角色列表，每个角色包含 character 和 series
    """
    if season not in SEASONS_CONFIG:
        raise KeyError(f"赛季配置不存在: {season}")
    return SEASONS_CONFIG[season].get("eliminated_characters", {}).get(round_name, [])

def get_wildcard_rounds(season: str) -> list:
    """
    获取指定赛季的外卡赛轮次
    
    :param season: 赛季，如 "2023"
    :return: 外卡赛轮次列表
    :raises: KeyError 如果赛季不存在
    """
    if season not in SEASONS_CONFIG:
        raise KeyError(f"赛季配置不存在: {season}")
    return SEASONS_CONFIG[season].get("wildcard_rounds", [])
