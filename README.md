# Animative-Viz

这是我为自己开发的一个**定制化**动态投票数据可视化工具。

## ⚠️ 项目定位

**这是一个专门为角色投票比赛（如萌战）定制的工具，不是通用的CSV可视化工具。**

### 适用场景

✅ **适合的情况：**
- 展示角色投票比赛（萌战、人气投票等）的数据
- 处理多轮次投票数据的累计和排名变化
- 展示外卡赛、排位赛、淘汰规则等特殊赛制
- 记录和展示里程碑事件、历史记录
- 动态演示投票过程和结果

❌ **不适合的情况：**
- 通用的CSV数据可视化工具
- 上传任意结构的数据文件
- 非投票类的数据分析
- 不想配置赛季信息就直接使用

### 核心约束

本工具对数据有明确要求：

1. **固定的CSV结构**
   - 必须包含：`序号`、`角色`、`作品`、`CV` 等基础列
   - 投票轮次列必须与配置文件中的 `vote_columns` 完全匹配
   - 文件命名必须遵循 `YYYY_season.csv` 格式

2. **业务领域专一**
   - 专为角色投票比赛设计
   - 内置外卡赛、排位赛、淘汰规则等萌战概念
   - 支持项链赛、里程碑等专业术语

3. **需要配置**
   - 每个赛季需要在配置文件中定义轮次信息
   - 特殊规则（外卡赛、淘汰角色等）需要手动配置
   - 不支持"上传即用"，需要提前准备配置

### 为什么选择定制开发？

✨ **定制的优势：**
- 完美适配投票比赛的业务逻辑
- 提供专业的数据过滤功能（排除外卡赛、排除已淘汰角色等）
- 支持复杂的赛制规则和里程碑展示
- 针对性优化，功能精准高效

### 📺 实际案例展示

本工具的实际应用案例：

**[世萌2023赛季角色累计票数统计之黄前久美子夺冠纪录片](https://www.bilibili.com/video/BV1KLPLeXEwN/)**

这个视频完全使用本工具制作，展示了2023赛季从预选赛到决赛的完整投票过程，包括：
- 多轮投票的动态票数变化
- 实时排名更新动画
- 里程碑事件展示
- 最终黄前久美子夺冠的完整历程

## 项目简介

专门用于展示角色投票比赛的过程，支持多轮投票数据的动态展示和细粒度的数据过滤。

## 功能特点

> 💡 注意：以下功能都是针对角色投票比赛场景设计的

1. **超级灵活的赛制支持** ⭐
   - 支持多赛季并存（2023、2024、2025...）
   - 每个赛季可以有完全不同的赛制
   - 轮次数量任意（3轮、10轮、20轮...）
   - 特殊规则可选（外卡赛、排位赛、里程碑等）
   - 配置化设计，无需修改代码（但需要配置）

2. **数据处理**
   - 支持排除外卡赛数据
   - 支持排除已淘汰角色的排位赛数据
   - 支持自定义列的排除
   - 智能数据验证和错误处理

3. **数据展示**
   - 动态展示票数变化
   - 实时更新排名
   - 显示关键里程碑
   - 展示投票进度
   - 流畅的D3.js动画效果

4. **定制功能**
   - 专门针对角色投票比赛场景
   - 支持多轮次数据处理
   - 灵活的数据过滤机制
   - 直观的数据可视化
   - 完整的角色信息管理

## 项目结构

### 前端 (`/frontend`)
```
frontend/
├── public/
│   └── index.html                     # 应用 HTML 模板
├── src/
│   ├── components/
│   │   ├── CumulativeVotesChart.js    # 图表容器组件
│   │   ├── CumulativeVotesChart/      # 图表渲染与动画拆分模块
│   │   │   ├── chartData.js
│   │   │   ├── chartRenderer.js
│   │   │   ├── chartUtils.js
│   │   │   ├── createRoundAnimationController.js
│   │   │   └── useCumulativeVotesConfig.js
│   │   ├── ColumnExclusionModal.js    # 列排除设置
│   │   ├── ConfirmationModal.js       # 确认对话框
│   │   ├── ErrorBoundary.js           # 错误边界
│   │   ├── ExcludeSpecialRoundsModal.js # 特殊轮次过滤设置
│   │   ├── FileUploader.js            # 文件上传组件
│   │   ├── MilestonesOverlay.js       # 里程碑展示层
│   │   └── RecordVideoModal.js        # 录制流程占位 UI
│   ├── config/
│   │   ├── animationConfig.js         # 动画配置
│   │   ├── character-lookup.json      # 角色名到角色 ID 的映射
│   │   ├── characters-data.json       # 角色元数据
│   │   ├── globalChartConfig.json     # 图表全局配置
│   │   ├── ip-data.json               # 作品元数据
│   │   └── seasonsConfig.json         # 前端赛季展示配置
│   ├── pages/
│   │   ├── hooks/
│   │   │   ├── useCumulativeVotesPageData.js # 页面数据获取与整理
│   │   │   └── useRoundProgress.js    # 播放进度状态
│   │   ├── CumulativeVotesPage.js     # 投票展示页面
│   │   └── HomePage.js                # 首页与上传入口
│   ├── services/
│   │   └── api.js                     # 后端接口封装
│   ├── styles/
│   │   ├── columnexclusionmodal.css
│   │   ├── confirmationmodal.css
│   │   ├── cumulative-votes-chart.css
│   │   ├── fileuploader.css
│   │   ├── global.css
│   │   ├── milestones-overlay.css
│   │   ├── recordvideomodal.css
│   │   └── specialroundsmodal.css
│   ├── utils/
│   │   └── fileUtils.js               # 文件校验与处理工具
│   ├── App.css
│   ├── App.js                         # 路由入口
│   ├── index.css
│   └── index.js                       # 应用入口
├── package-lock.json
└── package.json
```

### 后端 (`/backend`)
```
backend/
├── config/
│   ├── seasons/
│   │   ├── __init__.py                # 聚合各赛季配置
│   │   ├── season_2023.py             # 2023 赛季独立配置
│   │   └── shared.py                  # 非投票列等共享常量
│   ├── __init__.py                    # 配置导出入口
│   ├── seasons_rounds.py              # 赛季配置访问层与类型定义
│   └── settings.py                    # 全局配置
├── data/
│   ├── contexts/                      # context_id 到数据文件路径的持久化映射
│   ├── 2023_season.csv
│   ├── 2023_season.xlsx
│   └── 2024_season.csv
├── logs/
│   ├── animative_viz.log
│   └── app.log
├── scripts/
│   ├── analyze_character_matches.py
│   ├── analyze_matches.py
│   ├── calculate_losses.py
│   └── update_eliminated_chars.py
├── src/
│   ├── data/
│   │   └── rankings.json              # 排名数据
│   ├── routes/
│   │   ├── __init__.py
│   │   └── data_routes.py             # API 路由定义
│   ├── services/
│   │   ├── __init__.py
│   │   ├── character_metadata.py      # 角色信息与响应组装
│   │   ├── file_storage.py            # 上传存储与文件落盘
│   │   ├── vote_season_config.py      # 赛季识别与投票轮次契约装配
│   │   └── vote_tracker_store.py      # context_id 到 VoteTracker 的上下文存储
│   ├── utils/
│   │   ├── __init__.py
│   │   └── vote_parsing.py            # 投票值解析与安全转换
│   ├── __init__.py
│   ├── logger.py                      # 日志系统
│   ├── main.py                        # FastAPI 应用入口
│   ├── types.py                       # 后端共享类型契约
│   └── vote_tracker.py                # 投票数据处理核心
├── venv/
├── animative_viz.log
├── backend_debug.log
├── requirements.txt
├── start.py                           # 本地启动脚本
├── vote_tracker_debug.log
├── vote_tracker_info.log
└── vote_tracker.log
```

## 技术栈

### 前端
- **React** (v18.2.0): UI框架
- **React Router DOM** (v7.1.5): 路由管理
- **D3.js** (v7.9.0): 数据可视化核心库
- **Ant Design** (v5.24.1): UI组件库
- **Framer Motion** (v11.18.2): 动画库
- **Axios** (v1.6.7): HTTP客户端
- **Chart.js** (v4.4.7) + React-ChartJS-2 (v5.3.0): 备用图表库
- **Recharts** (v2.15.1): 备用图表库
- **React Transition Group** (v4.4.5): 过渡动画组件

### 后端
- **Python** (3.11+): 主要开发语言
- **FastAPI** (v0.109.0): Web框架
- **Uvicorn** (v0.24.0): ASGI服务器
- **Pandas** (v2.2.1): 数据处理
- **Pydantic** (v2.6.1): 数据验证
- **Python Multipart** (v0.0.9): 文件上传处理
- **Openpyxl** (v3.1.5): Excel文件处理

## 数据处理流程

### 前提条件
- 数据必须符合指定的CSV结构
- 必须提前配置好赛季信息
- 文件命名必须遵循 `YYYY_season.csv` 格式

### 处理步骤

1. **数据输入**
   - 上传符合格式要求的CSV文件
   - 系统从文件名自动识别赛季（如 `2023_season.csv` → 2023赛季）
   - 验证列名是否与配置的 `vote_columns` 匹配

2. **数据验证**
   - 检查必需列是否存在（序号、角色、作品、CV）
   - 验证投票轮次列是否与赛季配置一致
   - 检查赛季配置是否存在

3. **数据过滤**（根据用户选择）
   - 轮次级别过滤（外卡赛）
   - 单元格级别过滤（排位赛中已淘汰角色）
   - 自定义列排除

4. **数据处理**
   - 计算累计票数
   - 计算实时排名变化
   - 匹配里程碑事件

5. **数据展示**
   - 动态条形图展示票数变化
   - 实时排名更新动画
   - 里程碑弹窗显示
   - 统计信息展示

## API 路由

### 数据上传
- `POST /api/v1/upload-data`
  - 功能：上传投票数据文件
  - 参数：
    - `file`: 上传的 CSV 文件
    - `original_path`: 原始文件名或来源路径标识
  - 返回：
    - 文件信息
    - 总角色数
    - 投票轮次列表

### 数据获取
- `GET|POST /api/v1/votes-by-rounds`
  - 功能：获取每轮投票数据
  - 参数：
    - `excluded_columns`: 要排除的列
    - `exclude_wildcard`: 是否排除外卡赛
    - `exclude_ranking`: 是否排除排位赛
  - 返回：
    - 处理后的投票数据
    - 投票轮次列表
    - 每轮参与人数

- `GET /api/v1/vote-rounds`
  - 功能：获取投票轮次列表
  - 返回：所有投票轮次的列表

- `GET /api/v1/current-season`
  - 功能：获取当前赛季信息
  - 返回：当前赛季号

- `GET /api/v1/characters-info`
  - 功能：获取角色详细信息
  - 返回：
    - 角色基本信息
    - 角色排名
    - 角色头像

## 文件说明

### 前端文件

#### 组件与页面

**`frontend/src/components/CumulativeVotesChart.js`**
- 图表容器组件
- 负责组织图表渲染、动画控制和外部配置注入
- 具体绘制逻辑已拆到 `frontend/src/components/CumulativeVotesChart/`

**`frontend/src/components/CumulativeVotesChart/`**
- `chartData.js`：整理轮次数据、排名数据和绘图输入
- `chartRenderer.js`：负责 D3 绘制与更新
- `chartUtils.js`：图表辅助计算
- `createRoundAnimationController.js`：轮次播放控制器
- `useCumulativeVotesConfig.js`：图表配置读取与整理

**`frontend/src/components/MilestonesOverlay.js`**
- 里程碑展示层
- 在动画过程中显示赛季记录、项链赛记录等信息

**`frontend/src/components/ColumnExclusionModal.js`**
- 列排除设置弹窗
- 允许用户手动排除指定轮次

**`frontend/src/components/ExcludeSpecialRoundsModal.js`**
- 特殊轮次过滤弹窗
- 控制外卡赛过滤与排位赛淘汰角色过滤

**`frontend/src/components/FileUploader.js`**
- 文件上传组件
- 负责选择文件、发起上传与展示上传状态

**`frontend/src/components/ConfirmationModal.js`**
- 确认操作弹窗
- 用于进入展示前的流程确认

**`frontend/src/components/RecordVideoModal.js`**
- 录制流程占位 UI
- 当前仍是预留入口，不包含真正的视频录制实现

**`frontend/src/components/ErrorBoundary.js`**
- React 错误边界
- 捕获页面渲染异常并给出兜底界面

**`frontend/src/pages/HomePage.js`**
- 首页与上传入口
- 管理上传、过滤设置和进入展示页前的交互流程

**`frontend/src/pages/CumulativeVotesPage.js`**
- 投票展示页
- 组合图表、里程碑与进度逻辑

**`frontend/src/pages/hooks/useCumulativeVotesPageData.js`**
- 展示页数据获取与整理
- 负责调用接口并转换为页面可用状态

**`frontend/src/pages/hooks/useRoundProgress.js`**
- 动画播放进度管理
- 负责轮次推进相关状态

#### 配置与服务

**`frontend/src/config/seasonsConfig.json`**
- 前端赛季展示配置
- 定义赛季名称、轮次时间、里程碑、统计模板、布局与配色

**`frontend/src/config/characters-data.json`**
- 角色元数据
- 提供角色头像、英文名、CV 等前端展示信息

**`frontend/src/config/ip-data.json`**
- 作品元数据
- 提供作品年份、季度等信息

**`frontend/src/config/character-lookup.json`**
- 角色名与作品名到角色 ID 的映射
- 供前后端拼接角色详情时使用

**`frontend/src/config/globalChartConfig.json`**
- 图表全局展示配置

**`frontend/src/config/animationConfig.js`**
- 动画参数配置

**`frontend/src/services/api.js`**
- 后端接口封装
- 负责上传文件、获取轮次数据、获取角色信息等请求

**`frontend/src/utils/fileUtils.js`**
- 文件校验与处理工具

### 后端文件

#### 核心处理链路

**`backend/start.py`**
- 本地启动脚本
- 统一启动 `src.main:app`

**`backend/src/main.py`**
- FastAPI 应用入口
- 负责创建应用、挂载中间件并注册路由

**`backend/src/routes/data_routes.py`**
- 数据相关 API 路由
- 包含上传、获取轮次、获取角色信息、获取当前赛季等接口

**`backend/src/vote_tracker.py`**
- 投票数据处理核心
- 负责读取 CSV、校验列、过滤轮次、处理淘汰角色、输出投票数据结构

**`backend/src/services/file_storage.py`**
- 上传文件存储服务
- 负责文件落盘、重复文件判断、记录最新文件路径

**`backend/src/services/vote_tracker_store.py`**
- VoteTracker 实例管理
- 根据 `backend/data/.latest` 懒加载当前数据文件

**`backend/src/services/character_metadata.py`**
- 角色元数据补充与响应组装
- 将后端票数结果和前端角色库、作品库、排名数据拼接成接口返回值

**`backend/src/utils/vote_parsing.py`**
- 投票值解析工具
- 负责安全数值转换与特殊值处理

**`backend/src/logger.py`**
- 日志系统
- 输出后端运行日志与数据处理日志

#### 配置与数据

**`backend/config/seasons/__init__.py`**
- 聚合所有赛季模块
- 统一构建 `SEASONS_CONFIG`

**`backend/config/seasons/season_2023.py`**
- 单个赛季配置模块
- 当前 2023 赛季的轮次、外卡赛、淘汰角色都定义在这里

**`backend/config/seasons/shared.py`**
- 共享配置
- 当前主要保存 `NON_VOTE_COLUMNS`

**`backend/config/seasons_rounds.py`**
- 赛季配置访问层
- 对外提供 `get_season_rounds`、`get_wildcard_rounds`、`get_eliminated_characters`
- 同时承载赛季配置相关类型定义

**`backend/config/settings.py`**
- 全局配置
- 管理 API 前缀、CORS 等后端基础设置

**`backend/data/.latest`**
- 当前最新数据文件路径
- 服务重启后会据此恢复当前赛季数据

**`backend/src/data/rankings.json`**
- 排名数据
- 用于角色详情接口中的名次补充

#### 脚本与依赖

**`backend/scripts/update_eliminated_chars.py`**
- 维护淘汰角色配置的辅助脚本

**`backend/scripts/analyze_character_matches.py`**
**`backend/scripts/analyze_matches.py`**
**`backend/scripts/calculate_losses.py`**
- 数据分析类脚本
- 用于离线统计与辅助维护

**`backend/requirements.txt`**
- Python 依赖列表

## 安装与运行

### 前端安装
```bash
cd frontend
npm install
npm start
```
前端将运行在 `http://localhost:3000`

### 后端安装
```powershell
cd backend
python -m venv venv
.\venv\Scripts\pip.exe install -r requirements.txt
.\venv\Scripts\python.exe start.py
```
后端将运行在 `http://localhost:8000`

说明：当前 README 以 Windows PowerShell 环境为准。

### Excel 转换工具使用
```powershell
# 自动生成同名 CSV
.\backend\venv\Scripts\python.exe excel_to_csv.py "backend\data\2023_season.xlsx"

# 指定 CSV 输出路径
.\backend\venv\Scripts\python.exe excel_to_csv.py "backend\data\2023_season.xlsx" "backend\data\2023_season.csv"
```

## 多赛季与赛制灵活性 ⭐

### 核心优势

本工具采用高度灵活的配置化设计，支持：
- ✅ **多赛季并存**：可以同时配置2023、2024、2025等多个赛季
- ✅ **赛制完全自定义**：每个赛季可以有完全不同的赛制
- ✅ **轮次数量任意**：3轮、10轮、20轮都可以
- ✅ **特殊规则可选**：外卡赛、排位赛、里程碑等都是可选的

### 赛制支持对比

| 赛制特性 | 是否必需 | 说明 |
|---------|---------|------|
| 投票轮次（vote_columns） | ✅ **必需** | 定义赛季的所有投票轮次 |
| 外卡赛（wildcard_rounds） | ❌ 可选 | 用于排除外卡赛数据功能 |
| 排位赛/淘汰规则（eliminated_characters） | ❌ 可选 | 用于排除已淘汰角色功能 |
| 里程碑事件（milestones） | ❌ 可选 | 用于显示重要事件和记录 |
| 颜色方案（colors） | ❌ 可选 | 自定义赛季配色，不配置则使用默认 |

### 添加新赛季完整指南

当前后端赛季配置已经拆分，不再直接在 `backend/config/seasons_rounds.py` 里手写整份赛季数据。正确做法是新增独立赛季模块，再让聚合入口导出。

假设要添加一个全新的 2024 赛季：

#### 步骤1：新增后端赛季模块

在 `backend/config/seasons/` 下新建 `season_2024.py`：

```python
SEASON_ID = '2024'

SEASON_CONFIG = {
    'vote_columns': [
        '海选赛',
        '小组赛A组',
        '小组赛B组',
        '淘汰赛16强',
        '半决赛',
        '决赛'
    ],
    'wildcard_rounds': [
        '复活赛'
    ],
    'eliminated_characters': {
        '小组赛B组': [
            {'character': '角色名', 'series': '作品名'}
        ]
    }
}
```

最简版本只需要：

```python
SEASON_ID = '2024'

SEASON_CONFIG = {
    'vote_columns': [
        '第一轮',
        '第二轮',
        '决赛'
    ]
}
```

#### 步骤2：把新赛季接入聚合入口

编辑 `backend/config/seasons/__init__.py`，把新模块导入并加入 `SEASONS_CONFIG`：

```python
from .season_2023 import SEASON_CONFIG as SEASON_2023_CONFIG, SEASON_ID as SEASON_2023_ID
from .season_2024 import SEASON_CONFIG as SEASON_2024_CONFIG, SEASON_ID as SEASON_2024_ID
from .shared import NON_VOTE_COLUMNS

SEASONS_CONFIG = {
    SEASON_2023_ID: SEASON_2023_CONFIG,
    SEASON_2024_ID: SEASON_2024_CONFIG,
}
```

这里不需要改 `backend/config/seasons_rounds.py` 的查询函数，新增赛季后它会自动通过 `SEASONS_CONFIG` 生效。

#### 步骤3：配置前端赛季展示信息

编辑 `frontend/src/config/seasonsConfig.json`，在 `seasons` 对象中添加新赛季，例如：

```json
{
  "seasons": {
    "2023": { "...": "..." },
    "2024": {
      "id": "2024",
      "name": "2024赛季",
      "rounds": [
        {
          "name": "海选赛",
          "startTime": "2024-01-01T20:00:00",
          "totalVoters": 3500
        },
        {
          "name": "决赛",
          "startTime": "2024-02-01T20:00:00",
          "totalVoters": 8000
        }
      ],
      "colors": {
        "safe": [
          {"light": "#FF6B6B", "dark": "#C23616"}
        ],
        "default": "#333"
      },
      "milestones": {
        "决赛": [
          {
            "character": "冠军",
            "text": "恭喜获得2024赛季冠军！"
          }
        ]
      },
      "stats": [
        {
          "id": "total",
          "type": "total",
          "template": "该轮次总选票数：{totalVotes}"
        }
      ]
    }
  }
}
```

最简版本至少要保证：

```json
"2024": {
  "id": "2024",
  "name": "2024赛季",
  "rounds": [
    { "name": "第一轮", "startTime": "2024-01-01T20:00:00" },
    { "name": "第二轮", "startTime": "2024-01-08T20:00:00" },
    { "name": "决赛", "startTime": "2024-01-15T20:00:00" }
  ]
}
```

这里的 `rounds[].name` 必须和后端 `vote_columns` 一一对应，否则前端展示会对不上轮次。

#### 步骤4：准备数据文件

将数据文件放到后端可读取位置，文件名必须满足 `YYYY_season.csv`，例如 `2024_season.csv`。

CSV 至少要包含这些基础列：

```csv
序号,角色,作品,CV,海选赛,小组赛A组,小组赛B组,淘汰赛16强,半决赛,决赛
1,角色A,作品A,声优A,100,200,300,400,500,600
2,角色B,作品B,声优B,150,250,350,450,550,650
```

关键约束：

1. 文件名必须是 `YYYY_season.csv`
2. 基础列必须包含 `序号`、`角色`、`作品`、`CV`
3. CSV 中的投票列必须和后端 `vote_columns` 完全一致
4. 前端 `seasonsConfig.json` 中的 `rounds[].name` 也必须与后端轮次一致

#### 步骤5：上传并验证

1. 启动后端服务
2. 在前端上传 `2024_season.csv`
3. 后端会根据文件名自动识别赛季
4. 前端会根据赛季号读取对应展示配置
5. 检查轮次、里程碑、角色信息是否都能正常显示

#### 步骤6：静态检查与回归验证

新增赛季配置后，建议至少做两类检查：

1. 运行 Python 静态分析，确认配置改动没有破坏类型约束
2. 实际上传新赛季 CSV，确认轮次匹配、接口返回和页面展示都正常

建议命令如下：

```powershell
cd backend
.\venv\Scripts\mypy.exe src config --pretty
```

本地启动后端：

```powershell
cd backend
.\venv\Scripts\python.exe start.py
```

前端启动后，在页面上传 `2024_season.csv` 做实际回归验证。

### 配置灵活性示例

**示例1：简单三轮赛制**
```python
"2025": {
    "vote_columns": ["初赛", "复赛", "决赛"]
}
```

**示例2：复杂多阶段赛制**
```python
"2026": {
    "vote_columns": [
        "资格赛第一轮", "资格赛第二轮",
        "正赛A组第一场", "正赛A组第二场", "正赛A组第三场",
        "正赛B组第一场", "正赛B组第二场", "正赛B组第三场",
        "季后赛第一轮", "季后赛第二轮", "季后赛第三轮",
        "总决赛"
    ],
    "wildcard_rounds": ["复活赛"],
    "eliminated_characters": { ... }
}
```

**示例3：单轮投票（最简单）**
```python
"2027": {
    "vote_columns": ["总决选"]
}
```

### 技术实现原理

项目采用“文件名识别赛季 + 配置驱动渲染”的方式工作：

1. 后端从 `YYYY_season.csv` 文件名识别赛季
2. 后端从 `backend/config/seasons/` 读取对应赛季规则
3. 前端从 `frontend/src/config/seasonsConfig.json` 读取对应展示配置
4. CSV 列名、后端轮次配置、前端轮次配置三者对齐后，整套展示流程即可工作

