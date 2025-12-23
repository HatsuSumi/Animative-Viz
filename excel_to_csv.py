import pandas as pd
import sys
import os

def excel_to_csv(excel_path, csv_path=None):
    """
    将Excel文件转换为CSV文件
    
    参数:
    - excel_path: Excel文件路径
    - csv_path: 可选，指定CSV保存路径。如果不指定，默认在Excel同目录生成同名CSV
    """
    try:
        # 检查文件是否存在
        if not os.path.exists(excel_path):
            print(f"错误：文件不存在 - {excel_path}")
            return None
        
        # 读取Excel文件的所有sheet
        print(f"正在读取 Excel 文件: {excel_path}")
        df = pd.read_excel(excel_path, engine='openpyxl')
        
        # 如果没有指定csv路径，自动生成
        if csv_path is None:
            csv_path = excel_path.rsplit('.', 1)[0] + '.csv'
        
        # 保存为CSV
        df.to_csv(csv_path, index=False, encoding='utf-8-sig')
        
        print(f"\n✓ 成功将 {excel_path} 转换为 {csv_path}")
        print(f"\n数据预览 (前5行):\n{df.head()}")
        print(f"\n总共 {len(df)} 行, {len(df.columns)} 列")
        
        return df
    
    except Exception as e:
        print(f"转换出错: {e}")
        return None

# 使用示例
if __name__ == "__main__":
    # 支持命令行参数
    if len(sys.argv) > 1:
        excel_path = sys.argv[1]
        csv_path = sys.argv[2] if len(sys.argv) > 2 else None
    else:
        # 默认使用当前目录下的 Female-datas.xlsx
        excel_path = os.path.join(os.path.dirname(__file__), 'Female-datas.xlsx')
    
    print("=" * 60)
    print("Excel 转 CSV 工具")
    print("=" * 60)
    excel_to_csv(excel_path, csv_path if 'csv_path' in locals() else None)
