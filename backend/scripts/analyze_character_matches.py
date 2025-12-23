import os
import sys
import pandas as pd
from collections import defaultdict

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.seasons_rounds import SEASONS_CONFIG

def get_all_eliminated_characters(season):
    """从配置文件中获取所有被淘汰的角色"""
    eliminated_chars = set()
    season_config = SEASONS_CONFIG.get(season, {})
    eliminated_dict = season_config.get('eliminated_characters', {})
    
    for round_chars in eliminated_dict.values():
        for char in round_chars:
            eliminated_chars.add((char['character'], char['series']))
    
    return eliminated_chars

def analyze_character_matches(csv_path, season):
    """分析CSV文件和配置文件中角色的匹配情况"""
    # 从CSV文件读取角色
    df = pd.read_csv(csv_path)
    csv_chars = set()
    for _, row in df.iterrows():
        csv_chars.add((row['角色'], row['作品']))
    
    # 从配置文件获取被淘汰的角色
    config_chars = get_all_eliminated_characters(season)
    
    # 分析匹配情况
    exact_matches = csv_chars & config_chars
    
    # 找出只有角色名匹配但作品名不匹配的情况
    partial_matches = []
    csv_char_dict = {char: series for char, series in csv_chars}
    config_char_dict = {char: series for char, series in config_chars}
    
    for char in csv_char_dict:
        if char in config_char_dict and csv_char_dict[char] != config_char_dict[char]:
            partial_matches.append({
                'character': char,
                'csv_series': csv_char_dict[char],
                'config_series': config_char_dict[char]
            })
    
    # 找出在配置文件中但不在CSV中的角色
    only_in_config = config_chars - csv_chars
    
    # 找出在CSV中但不在配置文件中的角色
    only_in_csv = csv_chars - config_chars
    
    # 打印结果
    print(f"\n=== 角色匹配分析 ===")
    print(f"CSV文件中的角色总数: {len(csv_chars)}")
    print(f"配置文件中的角色总数: {len(config_chars)}")
    print(f"\n完全匹配的角色数: {len(exact_matches)}")
    
    if partial_matches:
        print("\n部分匹配（角色名相同但作品名不同）:")
        for match in partial_matches:
            print(f"- {match['character']}:")
            print(f"  CSV中的作品名: {match['csv_series']}")
            print(f"  配置中的作品名: {match['config_series']}")
    
    if only_in_config:
        print("\n仅在配置文件中出现的角色:")
        for char, series in sorted(only_in_config):
            print(f"- {char} ({series})")
    
    if only_in_csv:
        print("\n仅在CSV文件中出现的角色:")
        for char, series in sorted(only_in_csv):
            print(f"- {char} ({series})")

if __name__ == '__main__':
    # 使用相对路径
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                           'data', '2023_season.csv')
    analyze_character_matches(csv_path, '2023')
