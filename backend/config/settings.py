import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """应用配置"""
    API_V1_STR: str = "/api/v1"
    LOG_LEVEL: str = "INFO"

    class Config:
        case_sensitive = True

    def __init__(self, **data):
        super().__init__(**data)
        # 确保日志目录存在
        os.makedirs(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs'), exist_ok=True)

settings = Settings()
