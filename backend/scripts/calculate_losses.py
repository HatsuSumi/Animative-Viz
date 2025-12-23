import json
import pandas as pd

# 文件路径
RANKINGS_PATH = "F:/animative-viz/backend/src/data/rankings.json"
PHASE_FILES = {
    "第一阶段": "F:/ISML/ISML2023/51-First-Female_ranking.csv",
    "第二阶段": "F:/ISML/ISML2023/87-Second-Female_ranking.csv",
    "第三阶段": "F:/ISML/ISML2023/120-Third-Female_ranking.csv"
}

def load_top16():
    """加载16强名单"""
    with open(RANKINGS_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # 返回排名前16的角色名（不带作品名）
        return {name.split('@')[0] for name in data['rankings'].keys()}

def calculate_losses():
    """计算16强选手在三个阶段的败场数"""
    # 加载16强名单
    top16 = load_top16()
    
    # 用字典存储每个选手的败场数
    losses = {name: {"第一阶段": 0, "第二阶段": 0, "第三阶段": 0, "总计": 0} for name in top16}
    
    # 处理每个阶段的数据
    for phase, file_path in PHASE_FILES.items():
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
    calculate_losses()
