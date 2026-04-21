import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routes import router
from .services.character_metadata import load_characters_data

# 添加项目根目录到 Python 路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

# 创建 FastAPI 实例
app = FastAPI(title="动态数据可视化工具")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 启动时加载数据
load_characters_data()


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    detail = exc.detail

    if isinstance(detail, dict):
        code = detail.get('code') or 'REQUEST_FAILED'
        message = detail.get('message') or '请求失败'
    elif isinstance(detail, str):
        code = 'REQUEST_FAILED'
        message = detail
    else:
        code = 'REQUEST_FAILED'
        message = '请求失败'

    return JSONResponse(
        status_code=exc.status_code,
        content={
            'code': code,
            'message': message,
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    first_error = exc.errors()[0] if exc.errors() else None
    message = first_error.get('msg') if first_error else '请求参数不合法'

    return JSONResponse(
        status_code=422,
        content={
            'code': 'REQUEST_VALIDATION_FAILED',
            'message': message,
        }
    )

app.include_router(router)
