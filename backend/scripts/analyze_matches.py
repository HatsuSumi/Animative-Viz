import pandas as pd
from collections import defaultdict

# 读取Excel文件
df = pd.read_excel('F:/ISML/ISML2023/all/match_datas.xlsx')

def print_ranked_results(df, column, n=3, ascending=False, format_func=None):
    """打印排名，相同值获得相同排名，并显示所有并列"""
    sorted_df = df.sort_values(column, ascending=ascending)
    
    # 获取前n个不同的值
    unique_values = sorted_df[column].unique()[:n]
    
    # 获取所有匹配这些值的行
    results = []
    current_rank = 1
    prev_value = None
    
    for value in unique_values:
        # 如果值不同，增加排名
        if value != prev_value:
            current_rank = len(results) + 1
        
        # 获取所有等于当前值的行
        matching_rows = sorted_df[sorted_df[column] == value]
        for row in matching_rows.itertuples():
            results.append((current_rank, row))
        
        prev_value = value
            
    # 使用format_func格式化输出
    if format_func:
        for rank, row in results:
            print(format_func(rank, row))
    return results

# 创建包含所有得票数的Series
all_votes = pd.concat([
    df[['角色A', '得票数', '阶段']].rename(columns={'角色A': '角色', '得票数': '票数'}),
    df[['角色B', '得票数.1', '阶段']].rename(columns={'角色B': '角色', '得票数.1': '票数'})
])

print("\n=== 单场得票极值（Top3）===")
print_ranked_results(
    all_votes, 
    '票数', 
    format_func=lambda rank, row: f"第{rank}名: {row.角色} ({row.票数}票, {row.阶段})"
)

# 计算每场比赛的票差和胜负
df['票差'] = abs(df['得票数'] - df['得票数.1'])
df['胜者'] = df.apply(lambda x: x['角色A'] if x['得票数'] > x['得票数.1'] else x['角色B'], axis=1)
df['败者'] = df.apply(lambda x: x['角色B'] if x['得票数'] > x['得票数.1'] else x['角色A'], axis=1)
df['胜者票数'] = df.apply(lambda x: max(x['得票数'], x['得票数.1']), axis=1)
df['败者票数'] = df.apply(lambda x: min(x['得票数'], x['得票数.1']), axis=1)

print("\n=== 票差极值（Top3）===")
print_ranked_results(
    df, 
    '票差',
    format_func=lambda rank, row: f"第{rank}大票差: {row.胜者} vs {row.败者} (差距: {row.票差}票, {row.阶段})"
)

print("\n最小票差（Top3）:")
print_ranked_results(
    df, 
    '票差',
    ascending=True,
    format_func=lambda rank, row: f"第{rank}小票差: {row.胜者} vs {row.败者} (差距: {row.票差}票, {row.阶段})"
)

# 计算得票率
df['胜者得票率'] = (df['胜者票数'] / df['票仓'] * 100).round(2)
df['败者得票率'] = (df['败者票数'] / df['票仓'] * 100).round(2)

print("\n=== 得票率极值（Top3）===")
print_ranked_results(
    df, 
    '胜者得票率',
    format_func=lambda rank, row: f"第{rank}高得票率: {row.胜者} ({row.胜者得票率}%, vs {row.败者}, {row.阶段})"
)

# 计算弃票率
df['弃票率'] = ((10000 - df['票仓']) / 10000 * 100).round(2)

print("\n=== 弃票率极值（Top3）===")
print_ranked_results(
    df, 
    '弃票率',
    format_func=lambda rank, row: f"第{rank}高弃票率: {row.角色A} vs {row.角色B} ({row.弃票率}%, {row.阶段})"
)

print("\n最低弃票率（Top3）:")
print_ranked_results(
    df, 
    '弃票率',
    ascending=True,
    format_func=lambda rank, row: f"第{rank}低弃票率: {row.角色A} vs {row.角色B} ({row.弃票率}%, {row.阶段})"
)

# 计算几倍杀
df['几倍杀'] = (df['胜者票数'] / df['败者票数']).round(2)

print("\n=== 最大几倍杀（Top3）===")
print_ranked_results(
    df, 
    '几倍杀',
    format_func=lambda rank, row: f"第{rank}大几倍杀: {row.胜者} vs {row.败者} ({row.几倍杀}倍, {row.阶段})"
)

print("\n=== 票仓规模（Top3）===")
print_ranked_results(
    df, 
    '票仓',
    format_func=lambda rank, row: f"第{rank}大票仓: {row.角色A} vs {row.角色B} ({row.票仓}票, {row.阶段})"
)

print("\n最小票仓（Top3）:")
print_ranked_results(
    df, 
    '票仓',
    ascending=True,
    format_func=lambda rank, row: f"第{rank}小票仓: {row.角色A} vs {row.角色B} ({row.票仓}票, {row.阶段})"
)