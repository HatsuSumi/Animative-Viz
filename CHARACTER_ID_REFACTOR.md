# 角色稳定 ID 重构说明

## 1. 重构目标

将当前项目中的角色主标识从 `角色名@作品名` 迁移为稳定的 `char_id`，解决以下问题：

1. 角色名或作品名变更会导致主键变化
2. 排名、头像、角色资料依赖展示文本进行关联，结构脆弱
3. 后续收藏、引用、角色关系等功能无法基于稳定实体扩展

本次重构的目标是：

1. 角色使用稳定 `char_id` 作为唯一主键
2. 作品使用稳定 `ip_id` 作为唯一主键
3. 保留 `lookup` 映射层，将 `角色名@作品名` 映射到 `char_id`
4. 保持 CSV 输入结构不变，避免改动现有赛季数据文件
5. 后端接口开始显式返回角色 `id`
6. 前端逐步改为基于 `id` 做关联和状态标识

---

## 2. 当前代码现状核对结果

以下内容均已按当前代码实际核对。

### 2.1 角色库当前结构

当前 `frontend/src/config/characters-data.json` 使用复合展示字符串作为 key：

```1:8:frontend/src/config/characters-data.json
{
    "辛耶·诺赞@86 -不存在的战区-": {
        "name": "辛耶·诺赞",
        "ip": "86 -不存在的战区-",
        "name_en": "Shinei Nouzen",
        "cv": "千叶翔也",
        "avatar": "",
```

这意味着当前主键是展示文本，不是稳定 ID。

### 2.2 后端当前如何关联角色资料与排名

`backend/src/main.py` 当前通过 `character + ip` 拼接出复合 key，然后去查排名和头像：

```392:405:backend/src/main.py
        for char_info in characters_info:
            char_name = char_info['character']
            char_ip = char_info['ip']
            char_key = f"{char_name}@{char_ip}"
            
            # 从排名数据中获取排名
            char_info['rank'] = rankings.get(char_key)
            
            # 从全局角色数据中获取头像
            if _characters_data and char_key in _characters_data:
                char_info['avatar'] = _characters_data[char_key].get('avatar')
```

这说明复合展示 key 已经进入后端主链路。

### 2.3 排名当前也依赖复合 key

`backend/src/data/rankings.json` 当前也是以 `角色名@作品名` 作为 key：

```1:10:backend/src/data/rankings.json
{
    "season": "2023",
    "rankings": {
        "黄前久美子@吹响！上低音号": 1,
        "后藤一里@孤独摇滚！": 2,
        "中野梓@轻音少女": 3,
        "结城明日奈@刀剑神域": 4,
        "平泽唯@轻音少女": 5,
        "樱岛麻衣@青春猪头少年": 6,
```

### 2.4 投票数据入口当前没有角色 ID

`backend/src/vote_tracker.py` 当前从 CSV 中读取的是 `角色` 和 `作品`，不是 `char_id`：

```221:242:backend/src/vote_tracker.py
            character_name = row['角色']
            series_name = row['作品']
            # ... more code ...
            votes_data.append({
                'character': character_name,
                'series': series_name,  
                'votes': votes
            })
```

这意味着当前系统天然输入是展示字段，不能直接去掉映射层。

### 2.5 前端当前如何消费角色信息

`frontend/src/pages/CumulativeVotesPage.js` 会获取 `/characters-info`，并从返回值里提取 `character` 和 `rank`：

```103:122:frontend/src/pages/CumulativeVotesPage.js
        const [season, charactersResponse] = await Promise.all([
          getCurrentSeason(),
          getCharactersInfo()
        ]);

        // 从角色信息中提取排名
        const finalRanks = {};
        charactersResponse.forEach(({ character, rank }) => {
          if (rank) {
            finalRanks[character] = rank;
          }
        });
```

`frontend/src/components/CumulativeVotesChart.js` 当前按 `character` 去 `charactersInfo` 中找头像：

```356:370:frontend/src/components/CumulativeVotesChart.js
                ...topVotedChars.map((item, idx) => {
                  const characterInfo = charactersInfo.find(info => info.character === item.character);
                  const avatar = characterInfo?.avatar || '';
                  return {
                    id: `top5-${idx}`,
                    type: 'top5-item',
                    text: `${item.character}：${formatNumber(item.currentRoundActualVote)}`,
                    avatar,
                    round: this.currentRoundIndex
                  };
                })
```

所以前端当前也依赖展示字段进行关联。

---

## 3. 重构后的目标模型

### 3.1 角色数据

文件建议：`frontend/src/config/characters-data.json`

目标结构：

```json
{
  "char_000001": {
    "id": "char_000001",
    "name": "辛耶·诺赞",
    "name_en": "Shinei Nouzen",
    "ip_id": "ip_000001",
    "cv": "千叶翔也",
    "avatar": ""
  }
}
```

说明：

1. `id` 为角色稳定主键
2. `name` 为显示名
3. `ip_id` 指向作品实体
4. 不再长期冗余 `ip_year`、`ip_season`

### 3.2 作品数据

文件建议：`frontend/src/config/ip-data.json`

目标结构：

```json
{
  "ip_000001": {
    "id": "ip_000001",
    "name": "86 -不存在的战区-",
    "name_short": "86",
    "year": 2021,
    "season": 4
  }
}
```

说明：

1. 作品级属性统一归到 `ip` 实体
2. 后续排序、筛选、聚合都可基于作品实体完成

### 3.3 角色映射层

文件建议：`frontend/src/config/character-lookup.json`

目标结构：

```json
{
  "辛耶·诺赞@86 -不存在的战区-": "char_000001",
  "可蕾娜·库克米拉@86 -不存在的战区-": "char_000002"
}
```

说明：

1. `lookup` 只承担映射职责，不再作为主键
2. 它用于承接当前 CSV 输入结构
3. 它用于后端在 `character + ip` 与 `char_id` 之间建立桥接

### 3.4 排名数据

文件：`backend/src/data/rankings.json`

目标结构：

```json
{
  "season": "2023",
  "rankings": {
    "char_000123": 1,
    "char_000456": 2
  }
}
```

说明：

1. 排名应当挂在稳定角色实体上
2. 不再使用 `角色名@作品名` 作为 key

---

## 4. 重构原则

本次重构遵循以下原则：

1. 不写长期并存的双轨主键逻辑
2. 不保留 `角色名@作品名` 作为真实主键
3. CSV 结构先不动，继续保留 `角色` 与 `作品`
4. 使用 `lookup` 承接现有 CSV 输入
5. 尽量局部替换，避免整文件重写逻辑代码
6. 先改数据模型，再改后端装配，再改前端消费

---

## 5. 文件级改造范围

### 5.1 必改文件

1. `frontend/src/config/characters-data.json`
2. `frontend/src/config/ip-data.json`
3. `frontend/src/config/character-lookup.json`
4. `backend/src/data/rankings.json`
5. `backend/src/main.py`

### 5.2 需要联动核查的前端文件

1. `frontend/src/pages/CumulativeVotesPage.js`
2. `frontend/src/components/CumulativeVotesChart.js`
3. `frontend/src/services/api.js`

### 5.3 暂不优先改动的文件

1. `backend/src/vote_tracker.py`
2. 赛季 CSV 文件
3. `backend/config/seasons_rounds.py`

原因：

1. `vote_tracker.py` 当前职责是投票数据处理，不应先混入角色主数据职责
2. CSV 仍然适合作为人类可读输入，不必先引入 `char_id` 列
3. 赛季配置当前围绕展示数据工作，暂不需要先动

---

## 6. 后端重构方案

### 6.1 当前问题

当前 `/characters-info` 路由依赖：

1. `character`
2. `ip`
3. `character@ip`

来查：

1. 排名
2. 头像

这导致展示文本同时承担输入、关联、主键三种职责。

### 6.2 重构目标

后端应改为：

1. 先用 `character + ip` 生成 lookup key
2. 从 `character-lookup.json` 查出 `char_id`
3. 再用 `char_id` 查询角色资料与排名
4. 返回结果时显式带上 `id`

目标返回结构示意：

```json
{
  "id": "char_000001",
  "character": "辛耶·诺赞",
  "ip": "86 -不存在的战区-",
  "avatar": "...",
  "rank": 15
}
```

### 6.3 后端需要新增的内存结构

建议在 `backend/src/main.py` 中加载：

1. `characters_by_id`
2. `ips_by_id`
3. `character_lookup`

避免继续把所有职责都压在一个 JSON key 上。

---

## 7. 前端重构方案

### 7.1 当前问题

前端当前主要按 `character` 名称进行关联：

1. 提取最终排名时用 `character` 作为 key
2. 在图表中查头像时用 `character` 比较

这种方式在重名、改名、译名调整场景下都不稳定。

### 7.2 重构目标

前端应逐步改为：

1. 使用 `id` 作为角色实体标识
2. 列表渲染与本地状态统一使用 `id`
3. 头像、排名等附加信息通过 `id` 关联
4. 展示时继续使用 `character`、`ip`

### 7.3 第一阶段前端最小修改点

1. `/characters-info` 返回 `id` 后，前端先接收该字段
2. `finalRanks` 的索引方式由 `character` 改为 `id`
3. `CumulativeVotesChart` 中 `charactersInfo.find(...)` 由名字匹配改为 ID 匹配
4. 图表数据中逐步补充 `id`

---

## 8. 推荐迁移顺序

### 第一步：定新数据结构

1. 生成新的 `characters-data.json`
2. 拆出 `ip-data.json`
3. 生成 `character-lookup.json`
4. 将 `rankings.json` 改成 `char_id -> rank`

### 第二步：改后端装配逻辑

1. 加载新角色数据结构
2. 用 `lookup` 将 `character + ip` 转为 `char_id`
3. `/characters-info` 返回 `id`
4. 头像与排名统一按 `char_id` 关联

### 第三步：改前端消费逻辑

1. 接收角色 `id`
2. 改为按 `id` 关联排名与头像
3. 改列表渲染和状态标识

### 第四步：再评估是否要下沉到 `vote_tracker`

当前阶段不建议先改 `vote_tracker.py`。
只有在未来更多后端处理链条都需要直接使用 `char_id` 时，再评估是否把 ID 解析下沉到更底层。

---

## 9. 本次重构的边界

### 本次要解决

1. 角色主键不稳定问题
2. 排名与头像依赖展示文本关联的问题
3. 为后续角色引用型功能建立稳定实体基础

### 本次不解决

1. CSV 文件格式升级
2. 赛季配置里的角色命名治理
3. 角色别名体系
4. 自动编号生成脚本
5. 全量数据迁移工具脚本

这些内容可以作为后续任务，但不应和本次主重构混在一起。

---

## 10. 最终结论

本次角色重构的正式方向确定为：

1. 角色主键使用稳定 `char_id`
2. 作品主键使用稳定 `ip_id`
3. `lookup` 保留，但降级为映射层
4. `rankings` 改为按 `char_id` 组织
5. API 返回角色时显式带 `id`
6. 前端逐步改为基于 `id` 做关联
7. CSV 输入结构暂时保持不变

这是当前项目最符合架构、同时又能落地的重构方案。

