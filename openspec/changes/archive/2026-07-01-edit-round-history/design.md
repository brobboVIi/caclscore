## Context

CaclScore 是四人计分应用，所有状态管理在 `App.tsx` 中。当前 `cumulative`（累计分数）和 `roundHistory`（历史记录）是独立维护的两条数据链。`handleConfirm` 追加历史条目的同时增量更新累计分数，没有从历史重建累计的能力。`RoundHistory` 组件纯展示，无可交互编辑入口。

## Goals / Non-Goals

**Goals:**
- 支持编辑任意历史局的奖金数、胜负标记、大小胜模式
- 支持删除任意历史局，后续局数编号自动重排
- 编辑时复用现有输入区 UI（PlayerCard、OutcomeModeSelector 等）
- `cumulative` 始终从 `roundHistory` 全量派生，确保数据一致性

**Non-Goals:**
- 不新增独立的编辑弹窗/表单组件
- 不支持插入新局到历史中间（仅编辑/删除已有局）
- 不改变 localStorage 存储结构

## Decisions

### 1. 「重新开局」模式而非行内编辑或弹窗编辑

**选 C 理由**：完全复用现有 `PlayerCard`、`OutcomeModeSelector` 等组件，零新增编辑 UI。行内编辑需要在紧凑的历史卡片中塞入 +/- 按钮和胜负切换，弹窗编辑需要构建新的 Modal 表单。复用输入区是最经济且移动端体验最好的方案。

### 2. round 从独立状态改为派生值

当前 `round` 是一个独立的 `useState<number>`，每确认一局 +1。改为 `const round = roundHistory.length + 1` 后，round 始终反映实际局数。删除历史局后 round 自动递减，无需手动维护。

### 3. cumulative 全量派生而非增量 + 修正

新增 `recomputeCumulativeFromHistory()` 函数，遍历 history 中所有条目累加。`handleConfirm`、`handleEditHistory`、`handleDeleteHistory` 三个操作路径都调用此函数重算累计值。避免增量/修正两条路径带来的数据不一致风险。

**备选方案考虑**：保留 `updateCumulative` 用于 confirm（性能优化），仅 edit/delete 用全量重算。放弃原因：4 人对战几十局的规模性能差异可忽略，统一用全量重算更安全。

### 4. editingRound 状态控制 UI 模式切换

```typescript
const [editingRound, setEditingRound] = useState<number | null>(null)
```

- `null`：正常新局模式，Header 显示当前局号，确认按钮文字为「确认本局」
- `非 null`：编辑模式，Header 显示「编辑第 N 局」，确认按钮文字变为「保存修改」，同时出现「取消编辑」按钮

编辑模式下 `players` 和 `outcomeMode` 由历史数据填充，用户修改后保存时替换 history 中对应条目。

### 5. 删除后局数重排

删除第 N 局后，所有 >N 的局数编号 -1。实现方式：从数组中移除该条目后，遍历后续条目更新 `roundNumber` 字段。

### 6. 编辑前有未保存数据的处理

若当前输入区有未确认数据（bonusCount 非全零或已有 winner 标记），点击历史编辑按钮时弹出 `ConfirmDialog` 确认是否放弃。

检查函数：`hasUnconfirmedData(players)` — 判断是否有非默认值的输入。

## Risks / Trade-offs

- **编辑过程中刷新页面会丢失编辑状态** → 编辑是在当前输入区进行，loading 状态映射到同一份 state，刷新后恢复为正常新局模式。接受此限制，编辑操作本身是低频操作。
- **老版本 localStorage 数据可能 cumulative 与 history 不一致** → 首次加载时用 `recomputeCumulativeFromHistory` 重建，自动修复。
- **roundHistory 数组中条目顺序与 roundNumber 解耦** → 确保所有变更后保持 `roundHistory[i].roundNumber === i + 1`。
