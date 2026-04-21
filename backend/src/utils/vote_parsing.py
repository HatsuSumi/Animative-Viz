import math
from typing import Optional

import pandas as pd


def safe_float_convert(value) -> Optional[float]:
    """
    安全地转换浮点数，处理空值、无穷大和非数字值

    :param value: 输入值
    :return: 浮点数或None（如果是空值）
    """
    if value is None or pd.isna(value) or (isinstance(value, str) and value.strip() == ''):
        return None

    if isinstance(value, str) and '/' in value:
        parts = value.split('/')
        results = [safe_float_convert(part) for part in parts]

        if any(result is None for result in results):
            raise ValueError(f"票数字段包含无效分段值: {value}")

        return round(sum(results), 2)

    if isinstance(value, str):
        value = value.lower().strip()
        if value in ('inf', '-inf', 'infinity', '-infinity', 'nan'):
            raise ValueError(f"票数字段包含非法浮点值: {value}")

    float_value = float(value)
    if math.isinf(float_value) or math.isnan(float_value):
        raise ValueError(f"票数字段包含非法数值: {value}")

    return round(float_value, 2)

