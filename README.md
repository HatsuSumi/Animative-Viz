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
├── src/
│   ├── components/          # React组件
│   │   ├── CumulativeVotesChart.js    # 核心图表组件
│   │   ├── MilestonesOverlay.js       # 里程碑显示组件
│   │   ├── ColumnExclusionModal.js    # 列排除设置
│   │   ├── ExcludeSpecialRoundsModal.js # 特殊轮次排除设置
│   │   ├── FileUploader.js           # 文件上传组件
│   │   ├── ConfirmationModal.js      # 轮次排除确认对话框
│   │   ├── RecordVideoModal.js       # 视频录制对话框（UI预留）
│   │   └── ErrorBoundary.js         # 错误边界处理组件
│   ├── pages/              # 页面组件
│   │   ├── HomePage.js     # 主页（文件上传和设置）
│   │   └── CumulativeVotesPage.js # 投票展示页面
│   ├── config/             # 配置文件
│   │   ├── animationConfig.js      # 动画配置
│   │   ├── globalChartConfig.json  # 图表配置
│   │   ├── seasonsConfig.json      # 赛季配置
│   │   └── characters-data.json    # 角色基础数据
│   ├── services/           # API服务
│   │   └── api.js         # 后端接口调用
│   ├── styles/            # 样式文件
│   │   ├── cumulative-votes-chart.css # 图表样式
│   │   ├── milestones-overlay.css     # 里程碑样式
│   │   ├── columnexclusionmodal.css   # 列排除模态框样式
│   │   ├── specialroundsmodal.css     # 特殊轮次模态框样式
│   │   ├── confirmationmodal.css      # 确认对话框样式
│   │   ├── recordvideomodal.css       # 视频录制对话框样式
│   │   ├── fileuploader.css           # 文件上传组件样式
│   │   └── global.css                 # 全局样式
│   └── utils/             # 工具函数
│       └── fileUtils.js   # 文件处理工具
├── public/
│   └── index.html         # 应用 HTML 模板
├── node_modules/          # NPM 依赖包
├── package.json           # 项目依赖配置
├── package-lock.json      # 依赖版本锁定文件
└── App.js                 # React 应用入口
└── index.js               # 应用程序入口点
```

### 后端 (`/backend`)
```
backend/
├── src/
│   ├── main.py           # FastAPI 服务入口
│   ├── vote_tracker.py   # 投票数据处理核心
│   ├── logger.py         # 日志系统
│   ├── __init__.py       # 包初始化文件
│   └── data/
│       └── rankings.json # 赛季排名数据
├── config/               # 配置文件目录
│   ├── settings.py       # 全局配置
│   └── seasons_rounds.py # 赛季轮次配置
├── scripts/              # 辅助脚本目录
│   ├── analyze_character_matches.py  # 角色对战分析
│   ├── analyze_matches.py            # 比赛数据分析
│   ├── calculate_losses.py           # 败场计算
│   └── update_eliminated_chars.py    # 更新淘汰角色
├── data/                 # 数据存储目录
│   ├── .latest          # 最新数据记录
│   ├── global_state.json # 全局状态文件
│   └── 2023_season.csv  # 2023赛季数据
├── logs/                 # 日志目录
│   ├── animative_viz.log # 应用日志
│   └── app.log          # 详细日志
├── animative_viz.log    # 根目录日志
├── backend_debug.log    # 调试日志
├── vote_tracker.log     # 投票追踪日志
├── vote_tracker_debug.log # 投票追踪调试日志
├── vote_tracker_info.log  # 投票追踪信息日志
├── requirements.txt     # Python 依赖
├── start.py            # 服务启动脚本
└── venv/               # Python 虚拟环境
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
    - `original_path`: 原始文件路径
  - 返回：
    - 文件信息
    - 总角色数
    - 投票轮次列表

- `POST /api/v1/upload`
  - 功能：上传并保存为最新数据文件
  - 参数：
    - `file`: 上传的 CSV 文件
    - `original_path`: 原始文件路径
  - 返回：
    - 上传状态
    - 文件路径（如果上传成功）
    - 提示信息

### 数据获取
- `GET|POST /api/v1/votes-by-rounds`
  - 功能：获取每轮投票数据
  - 参数：
    - `excluded_columns`: 要排除的列
    - `exclude_wildcard`: 是否排除外卡赛
    - `exclude_ranking`: 是否排除排位赛
  - 返回：
    - 处理后的投票数据（已去除作品名）
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

#### 组件 (`/frontend/src/components/`)

**CumulativeVotesChart.js**
- 核心图表组件
- 使用 D3.js 绘制动态条形图
- 实现票数和排名的实时更新
- 管理图表动画状态
- 处理数据的累计计算

**MilestonesOverlay.js**
- 里程碑显示组件
- 在特定时刻显示重要事件
- 处理里程碑的动画过渡
- 支持多里程碑同时显示

**ColumnExclusionModal.js**
- 列排除设置模态框
- 允许用户选择要排除的数据列
- 提供列选择的可视化界面
- 管理列排除状态

**ExcludeSpecialRoundsModal.js**
- 特殊轮次排除设置模态框
- 控制外卡赛和排位赛的过滤
- 提供过滤选项的开关界面

**FileUploader.js**
- 文件上传组件
- 支持拖拽上传
- 文件类型验证
- 上传状态管理
- 错误处理和提示
- 上传进度显示

**ConfirmationModal.js**
- 轮次排除确认对话框
- 提示用户是否要排除某些投票轮次
- 使用 Framer Motion 实现动画效果
- 支持点击背景关闭
- 提供确认和取消按钮
- 按钮支持悬停和点击动画

**RecordVideoModal.js**
- 视频录制询问对话框（UI预留接口）
- 询问用户是否需要录制动画过程
- 使用 Framer Motion 实现流畅动画
- 目前仅作为流程控制，实际录制功能待实现

**ErrorBoundary.js**
- 错误边界处理组件
- 捕获和处理组件树中的错误
- 提供错误信息和重载按钮
- 支持自定义错误界面

#### 页面 (`/frontend/src/pages/`)

**HomePage.js**
- 应用程序主页
- 处理文件上传功能
- 管理过滤设置状态
- 协调各个模态框的显示

**CumulativeVotesPage.js**
- 投票数据展示页面
- 整合图表和里程碑组件
- 管理动画进度
- 处理数据的加载和更新

#### 配置 (`/frontend/src/config/`)

**animationConfig.js**
- 定义动画相关配置
- 设置动画时长
- 配置缓动函数
- 设置动画延迟

**globalChartConfig.json**
- 图表全局配置
- 设置图表尺寸和边距
- 定义颜色方案
- 配置字体样式

**seasonsConfig.json**
- 赛季相关配置
- 定义轮次信息和开赛时间
- 配置里程碑事件和角色记录
- 设置外卡赛信息
- 定义颜色方案和布局配置
- 配置统计信息展示模板

**characters-data.json**
- 角色基础数据库
- 存储角色名称、作品、CV等信息
- 包含角色头像链接
- 记录作品首播年份和季度
- 为前端提供角色详细信息

#### 服务 (`/frontend/src/services/`)

**api.js**
- 封装后端 API 调用
- 处理文件上传请求
- 获取投票数据
- 错误处理

#### 样式 (`/frontend/src/styles/`)

**cumulative-votes-chart.css**
- 图表组件样式
- 定义条形图样式
- 设置动画效果

**milestones-overlay.css**
- 里程碑组件样式
- 定义过渡动画
- 设置显示效果

**columnexclusionmodal.css**
- 列排除模态框样式
- 定义选择器样式

**specialroundsmodal.css**
- 特殊轮次模态框样式
- 定义开关按钮样式

**confirmationmodal.css**
- 确认对话框样式
- 按钮动画效果

**recordvideomodal.css**
- 视频录制对话框样式
- 动画过渡效果

**fileuploader.css**
- 文件上传组件样式
- 拖拽区域样式

**global.css**
- 全局样式定义
- 页面整体布局

#### 工具 (`/frontend/src/utils/`)

**fileUtils.js**
- 文件处理工具
- 文件类型验证
- 文件大小检查
- 文件名处理

#### 公共资源 (`/frontend/public/`)

**index.html**
- 应用 HTML 模板
- 配置页面元数据
- 加载外部资源
- 定义根元素

#### 根目录文件 (`/frontend/`)

**package.json**
- 项目依赖配置
- 定义项目脚本
- 指定项目版本
- 管理项目依赖项

**package-lock.json**
- 依赖版本锁定文件
- 确保团队使用相同版本依赖
- 记录完整的依赖树
- 加速依赖安装过程
- 提供依赖安全审计信息

**App.js**
- React 应用入口
- 配置路由系统
- 管理全局状态
- 处理页面导航

**index.js**
- 应用程序入口点
- 渲染 React 根组件
- 配置全局样式
- 初始化应用

### 后端文件

#### 核心文件 (`/backend/src/`)

**main.py**
- FastAPI 服务入口
- 定义 API 路由
- 处理文件上传和哈希校验
- 返回处理后的数据
- 管理全局数据缓存

**vote_tracker.py**
- 投票数据处理核心
- 实现数据过滤逻辑（外卡赛、排位赛）
- 计算累计票数和排名
- 处理特殊轮次和淘汰角色
- 安全的数值转换和处理

**logger.py**
- 日志系统
- 记录数据处理过程
- 记录错误和警告
- 跟踪过滤操作

**src/data/rankings.json**
- 赛季最终排名数据
- 存储角色的最终名次
- 用于角色信息API返回
- 当前包含2023赛季排名

#### 配置文件 (`/backend/config/`)

**settings.py**
- 全局配置管理
- 环境变量配置
- 数据库连接设置
- 日志级别控制

**seasons_rounds.py**
- 赛季轮次定义
- 外卡赛配置
- 排位赛规则和淘汰角色列表
- 轮次顺序管理
- 非投票列定义
- 提供赛季配置查询接口

#### 数据目录 (`/backend/data/`)

**.latest**
- 记录最新上传的数据文件路径
- 用于应用启动时自动加载最新数据

**global_state.json**
- 存储应用全局状态
- 保存运行时配置

**2023_season.csv**
- 2023赛季的完整投票数据
- 包含所有轮次的票数记录

#### 日志目录 (`/backend/logs/`)

**animative_viz.log**
- 应用主日志
- 记录关键操作

**app.log**
- 详细应用日志
- 完整操作记录

#### 根目录日志文件

**animative_viz.log**
- 根目录应用日志

**backend_debug.log**
- 后端调试日志

**vote_tracker.log**
- 投票数据追踪日志
- 记录投票处理过程

**vote_tracker_debug.log**
- 投票追踪调试信息
- 详细处理步骤记录

**vote_tracker_info.log**
- 投票追踪信息日志
- 一般信息记录

#### 根目录文件 (`/backend/`)

**requirements.txt**
- Python 依赖列表
- 指定依赖版本
- 环境依赖管理
- 快速环境搭建

#### 脚本目录 (`/backend/scripts/`)

**analyze_character_matches.py**
- 分析角色对战数据
- 统计对战记录和胜率

**analyze_matches.py**
- 比赛数据综合分析
- 生成统计报告

**calculate_losses.py**
- 计算角色败场数据
- 分析失利情况

**update_eliminated_chars.py**
- 更新淘汰角色列表
- 维护赛季配置数据

**start.py**
- 服务启动入口
- 配置加载
- 服务初始化
- 错误处理

**__init__.py**
- 包初始化文件
- 导出接口
- 版本信息
- 包级设置

#### 日志文件 (`/backend/`)

**vote_tracker.log**
- 主日志文件
- 记录关键操作
- 追踪错误信息
- 保存处理结果

**vote_tracker_debug.log**
- 调试日志文件
- 记录详细信息
- 帮助问题诊断
- 跟踪数据流

**vote_tracker_info.log**
- 信息日志文件
- 记录一般操作
- 保存状态变化
- 追踪用户行为

### 工具文件（根目录）

**excel_to_csv.py**
- Excel 转 CSV 独立工具脚本
- 使用 pandas 和 openpyxl 处理文件格式转换
- 清理数据格式
- 支持命令行使用
- 注意：需要单独安装 openpyxl 依赖

## 安装与运行

### 前端安装
```bash
cd frontend
npm install
npm start
```
前端将运行在 `http://localhost:3000`

### 后端安装
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python start.py
```
后端将运行在 `http://localhost:8000`

### Excel 转换工具使用
```bash
# 使用命令行参数
python excel_to_csv.py <Excel文件路径> [可选:CSV输出路径]

# 或使用默认路径（Female-datas.xlsx）
python excel_to_csv.py
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

假设要添加一个全新的2024赛季，且赛制与2023完全不同：

#### 步骤1：配置后端赛季信息

编辑 `backend/config/seasons_rounds.py`，在 `SEASONS_CONFIG` 中添加：

```python
SEASONS_CONFIG = {
    "2023": { ... },  # 已有配置
    "2024": {
        # 【必需】定义投票轮次（名称和数量完全自定义）
        "vote_columns": [
            "海选赛",
            "小组赛A组",
            "小组赛B组",
            "淘汰赛16强",
            "淘汰赛8强",
            "半决赛",
            "决赛"
        ],
        
        # 【可选】如果有外卡赛/复活赛
        "wildcard_rounds": [
            "复活赛"
        ],
        
        # 【可选】如果有排位赛/淘汰规则
        "eliminated_characters": {
            "小组赛B组": [
                {"character": "角色名", "series": "作品名"},
                # 在这个轮次被淘汰的角色
            ],
            "淘汰赛16强": [
                {"character": "角色名", "series": "作品名"},
            ]
        }
    }
}
```

**最简配置示例**（如果没有任何特殊规则）：
```python
"2024": {
    "vote_columns": [
        "第一轮",
        "第二轮",
        "决赛"
    ]
    # 仅此而已！不需要其他任何配置
}
```

#### 步骤2：配置前端展示信息

编辑 `frontend/src/config/seasonsConfig.json`，在 `seasons` 对象中添加：

```json
{
  "seasons": {
    "2023": { ... },
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
      ],
      
      "layout": {
        "text": {
          "baseY": 500,
          "baseX": {"text": 520, "icon": 570},
          "lineHeight": 30
        }
      }
    }
  }
}
```

**最简配置示例**（使用默认样式）：
```json
"2024": {
  "id": "2024",
  "name": "2024赛季",
  "rounds": [
    {"name": "第一轮", "startTime": "2024-01-01T20:00:00"}
  ]
}
```

#### 步骤3：准备数据文件

创建 `2024_season.csv` 文件，列名必须包含：

```csv
序号,角色,作品,CV,海选赛,小组赛A组,小组赛B组,淘汰赛16强,半决赛,决赛
1,角色A,作品A,声优A,100,200,300,400,500,600
2,角色B,作品B,声优B,150,250,350,450,550,650
```

**关键要求**：
- ✅ 文件名必须是 `YYYY_season.csv` 格式
- ✅ 列名必须与后端配置的 `vote_columns` 完全一致
- ✅ 必须包含基础列：`序号`、`角色`、`作品`、`CV`

#### 步骤4：上传使用

1. 启动后端服务
2. 在前端上传 `2024_season.csv`
3. 系统会自动识别赛季并应用对应配置
4. 享受你的全新赛制！

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

系统通过以下机制实现灵活性：

1. **动态赛季识别**：从文件名 `YYYY_season.csv` 中提取赛季年份
2. **配置驱动**：所有赛制规则由配置文件定义，无需修改代码
3. **安全回退**：可选配置项使用 `.get()` 方法，缺失时返回默认值
4. **独立处理**：每个赛季的数据和规则完全独立，互不干扰

## 配置说明

### 赛季配置
在 `frontend/src/config/seasonsConfig.json` 中配置：
- 赛季轮次信息
- 外卡赛轮次
- 里程碑事件

### 图表配置
在 `frontend/src/config/globalChartConfig.json` 中配置：
- 图表尺寸
- 边距设置
- 颜色方案

### 动画配置
在 `frontend/src/config/animationConfig.js` 中配置：
- 动画时长
- 缓动函数
- 延迟设置
