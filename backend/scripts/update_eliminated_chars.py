"""
从淘汰赛数据中提取淘汰角色信息并更新配置
"""
import os
import sys
import pandas as pd
import re

def process_knockout_round(csv_path):
    """
    处理一轮淘汰赛的数据
    返回：(轮次名称, 被淘汰角色列表)
    """
    df = pd.read_csv(csv_path)
    
    # 只处理恒星女子组的数据
    df = df[df['赛事名称'].str.contains('恒星女子组')]
    if len(df) == 0:
        print(f"警告：在{csv_path}中没有找到恒星女子组的数据")
        return None, []
    
    # 获取轮次名称（取第一行的赛事名称，只保留"淘汰赛第X轮"部分）
    full_round_name = df.iloc[0]['赛事名称']
    round_name = full_round_name.split('-')[0]  # 只取第一部分，如"淘汰赛第一轮"
    
    # 用于存储被淘汰的角色
    eliminated_chars = []
    
    # 按对手配对处理
    for i in range(0, len(df), 2):
        if i + 1 >= len(df):
            continue
            
        char1 = df.iloc[i]
        char2 = df.iloc[i + 1]
        
        # 确保这两个角色确实是一对
        if char1['对手'] != char2['角色'] or char2['对手'] != char1['角色']:
            print(f"警告：角色配对可能有误：{char1['角色']} vs {char2['角色']}")
            continue
        
        # 比较得票数，记录被淘汰的角色
        if char1['得票数'] < char2['得票数']:
            eliminated = char1
        else:
            eliminated = char2
            
        eliminated_chars.append({
            "character": eliminated['角色'],
            "series": eliminated['作品']
        })
    
    print(f"\n在{round_name}中被淘汰的角色（{len(eliminated_chars)}个）：")
    for char in eliminated_chars:
        print(f"  - {char['character']}（{char['series']}）")
    
    return round_name, eliminated_chars

def update_eliminated_chars():
    """
    处理所有淘汰赛轮次并更新配置
    """
    # 淘汰赛文件按顺序处理
    knockout_files = [
        r"F:\ISML\ISML2023\122-11.17-Stella.csv",
        r"F:\ISML\ISML2023\129-11.21-Stella.csv",
        r"F:\ISML\ISML2023\137-11.25-all.csv",
        r"F:\ISML\ISML2023\145-11.30-all.csv"
    ]
    
    # 收集所有轮次的数据
    rounds_data = {}
    for csv_file in knockout_files:
        round_name, eliminated = process_knockout_round(csv_file)
        if round_name:  # 只有当找到恒星女子组的数据时才添加
            rounds_data[round_name] = eliminated
    
    # 更新配置文件
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    config_path = os.path.join(project_root, "backend", "config", "seasons_rounds.py")
    
    # 读取现有配置
    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.readlines()
    
    # 找到eliminated_characters字典的开始和结束位置
    start_line = -1
    end_line = -1
    brace_count = 0
    for i, line in enumerate(content):
        if '"eliminated_characters": {' in line:
            start_line = i
            brace_count = 1
        elif start_line != -1:
            brace_count += line.count('{') - line.count('}')
            if brace_count == 0:
                end_line = i + 1
                break
    
    if start_line == -1:
        print("错误：找不到eliminated_characters配置")
        return
    
    # 读取现有配置内容
    eliminated_chars_config = {}
    current_round = None
    current_chars = []
    
    # 更精确的轮次匹配模式
    round_pattern = re.compile(r'\s*"([^"]+)":\s*\[')
    char_pattern = re.compile(r'\s*{\s*"character":\s*"([^"]+)",\s*"series":\s*"([^"]+)"\s*}')
    
    for line in content[start_line:end_line]:
        # 检查是否是轮次行
        round_match = round_pattern.match(line)
        if round_match:
            if current_round and current_chars:
                eliminated_chars_config[current_round] = current_chars
            current_round = round_match.group(1)
            current_chars = []
            continue
        
        # 检查是否是角色数据行
        char_match = char_pattern.match(line.strip().rstrip(','))
        if char_match:
            char_data = {
                "character": char_match.group(1),
                "series": char_match.group(2)
            }
            current_chars.append(char_data)
    
    # 添加最后一轮的数据
    if current_round and current_chars:
        eliminated_chars_config[current_round] = current_chars
    
    # 添加新的轮次数据
    eliminated_chars_config.update(rounds_data)
    
    # 生成新的配置内容
    new_config = [
        '        "eliminated_characters": {\n'
    ]
    
    for round_name, chars in eliminated_chars_config.items():
        new_config.append(f'            "{round_name}": [\n')
        for i, char in enumerate(chars):
            line = f'                {{"character": "{char["character"]}", "series": "{char["series"]}"}}'
            if i < len(chars) - 1:
                line += ','
            new_config.append(line + '\n')
        new_config.append('            ]')
        if round_name != list(eliminated_chars_config.keys())[-1]:
            new_config.append(',')
        new_config.append('\n')
    
    new_config.append('        },\n')
    
    # 更新配置文件
    content[start_line:end_line] = new_config
    
    # 写回文件
    with open(config_path, 'w', encoding='utf-8') as f:
        f.writelines(content)
    
    print("\n配置文件已更新！")

if __name__ == "__main__":
    update_eliminated_chars()
