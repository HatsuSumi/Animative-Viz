import argparse
from pathlib import Path
import json
import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RANKINGS_PATH = BACKEND_ROOT / 'src' / 'data' / 'rankings.json'


def load_top16(rankings_path: Path):
    """加载16强名单"""
    with open(rankings_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # 返回排名前16的角色名（不带作品名）
        return {name.split('@')[0] for name in data['rankings'].keys()}

def calculate_losses(phase_files: dict[str, Path], rankings_path: Path = DEFAULT_RANKINGS_PATH):
    """计算16强选手在三个阶段的败场数"""
    # 加载16强名单
    top16 = load_top16(rankings_path)
    
    # 用字典存储每个选手的败场数
    losses = {name: {"第一阶段": 0, "第二阶段": 0, "第三阶段": 0, "总计": 0} for name in top16}
    
    # 处理每个阶段的数据
    for phase, file_path in phase_files.items():
        # 读取CSV文件
        df = pd.read_csv(file_path)
        
        # 统计每个16强选手的败场数
        for _, row in df.iterrows():
            name = row['姓名']
            if name in top16:
                phase_losses = int(row['负'])  # 转换为整数
                losses[name][phase] = phase_losses
                losses[name]["总计"] += phase_losses
    
    # 按累计败场数从高到低排序
    sorted_losses = sorted(losses.items(), key=lambda x: x[1]["总计"], reverse=True)
    
    # 打印结果
    for name, stats in sorted_losses:
        print(f"{name}在第一阶段{stats['第一阶段']}败，"
              f"第二阶段{stats['第二阶段']}败，"
              f"第三阶段{stats['第三阶段']}败，"
              f"累计败场数为{stats['总计']}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='统计16强选手各阶段败场数')
    parser.add_argument('--rankings-path', type=Path, default=DEFAULT_RANKINGS_PATH, help='rankings.json 路径')
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
    )
