import math
from typing import Optional

import pandas as pd

from ..logger import logger


def safe_float_convert(value) -> Optional[float]:
    """
    安全地转换浮点数，处理空值、无穷大和非数字值

    :param value: 输入值
    :return: 浮点数或None（如果是空值或无效值）
    """
    try:
        if value is None or pd.isna(value) or (isinstance(value, str) and value.strip() == ''):
            return None

        if isinstance(value, str) and '/' in value:
            try:
                parts = value.split('/')
                results = [safe_float_convert(part) for part in parts]
                valid_results = [result for result in results if result is not None]
                return sum(valid_results) if valid_results else None
            except Exception as error:
                logger.warning(f"处理带斜线的值 '{value}' 失败: {str(error)}")
                return None

        if isinstance(value, str):
            value = value.lower().strip()
            if value in ('inf', '-inf', 'infinity', '-infinity', 'nan'):
                return None

        float_value = float(value)
        if math.isinf(float_value) or math.isnan(float_value):
            return None

        return round(float_value, 2)
    except (ValueError, TypeError) as error:
        logger.warning(f"转换值 '{value}' 失败: {str(error)}")
        return None

