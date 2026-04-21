# 性能问题记录

本文档记录当前项目中已经确认的性能与机制层面问题，重点关注后端数据处理链路、前端图表计算链路、D3 渲染机制与动画调度机制。

## 一 后端性能评估

### 1. VoteTracker 读取和缓存机制，不算最优，但方向是对的

已核对文件：

1. `backend/src/services/vote_tracker_store.py`
2. `backend/src/services/file_storage.py`
3. `backend/src/vote_tracker.py`

当前已经具备这些机制：

1. `context_id -> VoteTracker` 的内存缓存
2. 同一路径二次读取时可以复用缓存实例
3. 导入文件时会比较 MD5，文件内容不变就复用已有文件
4. 上下文文件持久化到磁盘，进程重启后还能恢复路径

这说明当前实现已经不是“每次请求都从头读 CSV”的初级状态。

结论：

1. 方向正确
2. 机制合格
3. 但还不是最优

### 2. P0：`VoteTracker.get_vote_data()` 是明显热点，逐行 `iterrows()` 加内层轮次循环

这里是后端最重的热点之一。

当前实现是：

1. 外层遍历每一行角色
2. 内层遍历每一轮投票列
3. 每个单元格都单独调用 `safe_float_convert`
4. 排位赛过滤时还会再做一轮淘汰轮次查找

这意味着复杂度大致是：

\[
O(角色数 \times 轮次数 \times 若干字符串处理)
\]

在当前数据量不大时问题不明显，但从机制性能看，不够优雅。

具体问题：

1. `pandas` 已经把 CSV 读成 `DataFrame`，后续又退回 Python 级双层循环
2. `iterrows()` 本身就是 `pandas` 里偏慢的一种行遍历方式
3. `safe_float_convert()` 被按单元格高频调用
4. `exclude_ranking` 时每个角色都要再扫轮次找淘汰点

如果后续赛季变大、轮次增多、角色增多，这里会成为主要 CPU 热点。

结论：

1. 不是最优

机制上更优的方向：

1. 列级批量转换
2. `DataFrame` 向量化处理
3. 预构建角色淘汰轮次映射
4. 避免 `iterrows()`

### 3. P1：`_find_eliminated_round()` 的重复扫描不是最优

当前逻辑是：

1. 每个角色
2. 扫所有轮次
3. 每轮再取淘汰角色列表
4. 再逐个比 `(character, series)`

这本质上是重复查配置。

虽然数据量现在不一定爆炸，但机制上明显有更好的写法：

1. 在 `VoteTracker` 初始化后
2. 直接预构建一个 `{(character, series): eliminated_round}` 的映射
3. 后续 O(1) 查询

结论：

1. 可运行
2. 但不是最优机制

### 4. `get_participating_counts()` 比前面好一些，但还可以继续收口

这里已经有一个正向点：

1. 做了 `eliminated_cache`
2. 避免同一轮反复重复读取淘汰角色配置

这说明当前实现已经具备一定缓存意识。

但仍然不是最优，因为它每次调用依然会：

1. 对每轮做前序轮次累积
2. 逐轮 `update` 集合
3. 从 `votes_data` 现算总角色集合

如果 `vote_rounds` 和赛季配置是固定的，其实参与人数这种东西完全可以：

1. 在 `VoteTracker` 层按过滤参数做一次缓存
2. 相同参数下直接复用

当前没有这层结果缓存。

结论：

1. 不差
2. 但没到最优

### 5. P1：`build_characters_info_response()` 每次都重新读 `rankings.json`

这个点很明确。

当前实际情况：

1. 启动时 `load_characters_data()` 会把角色元数据读进内存
2. 排名数据没有进入长期缓存
3. `build_characters_info_response()` 每次调用都会 `_load_rankings()`
4. `_load_rankings()` 每次都会重新打开 `rankings.json`

这在接口量低时影响不大，但从机制上看是不优雅的：

1. 排名数据是本地小 JSON
2. 读取频率可能高
3. 内容也不是每次请求都会变
4. 应该和角色元数据一样进入内存缓存

结论：

1. 这是个真实的重复 IO 点

### 6. `file_storage.py` 的导入链路整体可以接受

这一块不建议过度优化。

原因：

1. 导入本身是低频操作
2. 当前已经做了临时文件写入
3. 已经做了哈希比较
4. 内容不变时不会重复覆盖
5. 只有导入时才发生这些 IO

结论：

1. 这里不是热点
2. 不建议过度优化

## 二 前端性能评估

### 1. P0：`processChartData()` 和 `buildRoundData()` 存在明显重复全量计算

这是前端最大的机制问题之一。

#### `processChartData()`

每次 `data` 或 `voteRounds` 变动时，会：

1. 全量构造 `processedData`
2. 再按每轮遍历所有角色
3. 生成 `roundVotes`
4. 生成 `cumulativeVotes`
5. 最后整体排序

#### `buildRoundData()`

每次进入下一轮动画时，又会：

1. 重新从 `processedData` 全量 map 出 `allRoundData`
2. 再整体排序
3. 再计算 top 榜
4. 再计算上一轮排名映射
5. 再切 `displayData`
6. 再算总票数、中位数、平均数

也就是说：

1. 页面初始化做一次全量加工
2. 每一轮动画推进，再做一次全量加工

如果轮次很多、角色很多，这个链路会不断重复全量计算。

结论：

1. 这不是最优机制

更优方向：

1. 预计算每一轮的 round snapshot
2. 每轮直接按索引取结果
3. 避免动画过程中重复全量 `map` 和 `sort`

### 2. P0：D3 每轮都整张 SVG 重建，机制上不够优

在 `createRoundAnimationController.js` 里，一开始就：

1. `d3.select(svgRef.current).selectAll('*').remove()`
2. 整个 SVG 清空
3. 重新 append 根 `g`
4. 然后每轮 `renderRoundFrame()` 再把整帧重渲染一遍

从小规模图表效果看这样很直接，但从机制性能看不够优雅：

1. 清空整棵 SVG 树
2. 重建节点
3. 再重新绑定数据
4. 再做 transition

比起“保留稳定结构，只更新必要节点”，这明显更粗暴。

结论：

1. 当前实现是“开发简单优先”
2. 不是“机制最优”

### 3. P1：`chartRenderer.js` 中 axis 的前值读取逻辑基本无效，还造成多余操作

这里有一个典型的机制问题。

在 `renderAxes()` 里先：

1. `svg.selectAll('.x-axis').remove()`
2. 然后 `const xAxis = svg.append('g')`
3. 再尝试 `svg.select('.x-axis')` 去读上一次 tick

但因为前面已经删掉了旧 axis，后面选到的就是新节点，所以这段“取上一次刻度最大值”的逻辑基本失去意义。

这会带来：

1. 多余 DOM 操作
2. 多余选择器查询
3. 多余插值逻辑
4. 实际收益很小甚至无效

结论：

1. 这是前端图表层一个不优雅的小热点

### 4. P1：`createRoundAnimationController.start()` 里异常被 catch 后只打日志

这一条主要不是 Fail Fast 问题，而是性能和机制角度的问题。

当前逻辑大致是：

```javascript
try {
  // 动画调度逻辑
} catch (error) {
  console.error('动画执行时发生错误:', error);
}
```

这会导致：

1. 动画逻辑内部坏了
2. 但调度链没有明确中断信号上抛
3. 页面可能进入半死不活状态
4. 还会继续保留一些 timeout 生命周期

从机制角度，这种“吞错误继续留现场”的调度逻辑不够干净，也会影响性能分析和资源释放。

### 5. P1：`useRoundProgress()` 用 `requestAnimationFrame` 做 120fps 进度条更新，略重

这里是个真实的小性能点。

当前逻辑：

1. 倒计时用 `requestAnimationFrame`
2. `countdownAnimation.fps = 120`
3. 每帧算一次剩余时间
4. 再 `setNextRoundProgress`

对一个只是控制顶部进度条宽度的 UI 来说，120fps 偏高。

尤其当前页面本身还有 D3 transition 和 milestone overlay 时，这属于不必要的刷新密度。

结论：

1. 不是大问题
2. 但机制上不最优

更合理的方向：

1. 60fps 足够
2. 甚至 30fps 视觉上都未必有差异

### 6. `useCumulativeVotesConfig()` 的 memo 化做得不错

这里值得正向评价。

它对这些东西做了 memo：

1. `seasonMilestones`
2. `currentSeasonConfig`
3. `roundConfigsByName`
4. `animationConfig`
5. `characterColors`

这说明当前实现已经具备明确的“配置和派生值缓存”意识。

结论：

1. 这部分机制是对的
2. 不建议乱动

### 7. `CumulativeVotesChart` 组件本身的 state 结构不算差

这里目前状态不多：

1. `processedData`
2. `animationKey`
3. `currentMilestone`

`useEffect` 依赖也还算合理，整体没有出现 React 层面大量无意义重复 state 派生。

所以 React 组件结构本身不是主要瓶颈，主要瓶颈仍然是：

1. 图表全量计算
2. D3 全量重建
3. 动画调度粒度

## 三 总结

### P0

1. `VoteTracker.get_vote_data()` 的逐行 `iterrows()` 与单元格级转换
2. `processChartData()` 和 `buildRoundData()` 的重复全量计算
3. D3 每轮整张 SVG 重建

### P1

1. `_find_eliminated_round()` 的重复扫描
2. `get_participating_counts()` 没有基于参数的结果缓存
3. `build_characters_info_response()` 每次重读 `rankings.json`
4. `chartRenderer.js` 中 axis 前值读取逻辑无效
5. `createRoundAnimationController.start()` 异常只打日志
6. `useRoundProgress()` 以 120fps 更新进度条

### 不建议为了性能乱动的部分

1. `file_storage.py` 的导入链路
2. `useCumulativeVotesConfig()` 的 memo 化结构
3. `CumulativeVotesChart` 组件当前的基础 state 结构

