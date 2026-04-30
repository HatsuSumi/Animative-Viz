import argparse
from pathlib import Path
import json
import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
DEFAULT_RANKINGS_PATH = BACKEND_ROOT / 'src' / 'data' / 'rankings.json'
DEFAULT_CHARACTERS_DATA_PATH = PROJECT_ROOT / 'frontend' / 'src' / 'config' / 'characters-data.json'


def _load_rankings_by_season(rankings_path: Path) -> dict[str, dict[str, int]]:
    """加载多赛季排名数据。"""
    with open(rankings_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    seasons = data.get('seasons')
    if not isinstance(seasons, dict):
        raise ValueError('rankings.json 格式无效，必须包含 seasons 对象')

    return seasons


def _load_character_names_by_id(characters_data_path: Path) -> dict[str, str]:
    with open(characters_data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    return {
        character_id: character_data['name']
        for character_id, character_data in data.items()
        if isinstance(character_data, dict) and isinstance(character_data.get('name'), str)
    }


def load_top16(rankings_path: Path, season: str, characters_data_path: Path = DEFAULT_CHARACTERS_DATA_PATH):
    """加载指定赛季的16强角色名集合"""
    rankings_by_season = _load_rankings_by_season(rankings_path)
    season_rankings = rankings_by_season.get(season)
    if not season_rankings:
        raise ValueError(f'未找到赛季 {season} 的排名数据')

    character_names_by_id = _load_character_names_by_id(characters_data_path)
    top16_names: set[str] = set()

    for character_id, rank in season_rankings.items():
        if rank > 16:
            continue

        character_name = character_names_by_id.get(character_id)
        if character_name is None:
            raise ValueError(f'characters-data.json 中缺少角色 {character_id} 的名称映射')

        top16_names.add(character_name)

    return top16_names

def calculate_losses(
    phase_files: dict[str, Path],
    rankings_path: Path = DEFAULT_RANKINGS_PATH,
    season: str = '',
    characters_data_path: Path = DEFAULT_CHARACTERS_DATA_PATH,
):
    """计算16强选手在三个阶段的败场数"""
    if not season:
        raise ValueError('必须指定 season')

    top16 = load_top16(rankings_path, season, characters_data_path)
    
    losses = {name: {"第一阶段": 0, "第二阶段": 0, "第三阶段": 0, "总计": 0} for name in top16}
    
    for phase, file_path in phase_files.items():
        df = pd.read_csv(file_path)
        
        for _, row in df.iterrows():
            name = row['姓名']
            if name in top16:
                phase_losses = int(row['负'])
                losses[name][phase] = phase_losses
                losses[name]["总计"] += phase_losses
    
    sorted_losses = sorted(losses.items(), key=lambda x: x[1]["总计"], reverse=True)
    
    for name, stats in sorted_losses:
        print(f"{name}在第一阶段{stats['第一阶段']}败，"
              f"第二阶段{stats['第二阶段']}败，"
              f"第三阶段{stats['第三阶段']}败，"
              f"累计败场数为{stats['总计']}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='统计16强选手各阶段败场数')
    parser.add_argument('--rankings-path', type=Path, default=DEFAULT_RANKINGS_PATH, help='rankings.json 路径')
    parser.add_argument('--characters-data-path', type=Path, default=DEFAULT_CHARACTERS_DATA_PATH, help='characters-data.json 路径')
    parser.add_argument('--season', type=str, required=True, help='要使用的赛季，例如 2023')
    parser.add_argument('--first-phase', type=Path, required=True, help='第一阶段排名 CSV 路径')
    parser.add_argument('--second-phase', type=Path, required=True, help='第二阶段排名 CSV 路径')
    parser.add_argument('--third-phase', type=Path, required=True, help='第三阶段排名 CSV 路径')
    args = parser.parse_args()

    calculate_losses(
        {
            '第一阶段': args.first_phase,
            '第二阶段': args.second_phase,
            '第三阶段': args.third_phase,
        },
        rankings_path=args.rankings_path,
        season=args.season,
        characters_data_path=args.characters_data_path,
    )
