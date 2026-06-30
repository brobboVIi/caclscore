## Why

用户在确认一局后无法修改历史数据。如果奖金数记错了、胜负标错了、或者大小胜模式选错了，只能全局重置后重新输入所有局数。需要支持对历史单局的编辑和删除操作。

## What Changes

- 历史记录每条新增编辑和删除按钮
- 编辑操作将历史数据加载到当前输入区，复用现有 PlayerCard 等组件进行修改，保存后替换原记录
- 删除操作移除该局记录，后续局数编号自动重排
- 累计分数（cumulative）改为从 roundHistory 全量派生计算，编辑/删除后自动重算
- 回合编号（round）改为从 roundHistory.length 派生，不再独立维护

## Capabilities

### New Capabilities

- `edit-round-history`: 对已确认的历史局进行编辑（奖金数、胜负标记、大小胜模式）和删除操作，编辑时复用现有输入区 UI

### Modified Capabilities

<!-- 无现有 specs，不修改已有能力 -->

## Impact

- `src/utils/scoring.ts` — 新增 `recomputeCumulativeFromHistory()` 函数
- `src/App.tsx` — 新增 `editingRound` 状态，round 改为派生值，改 `handleConfirm`，新增编辑/删除 handler
- `src/components/RoundHistory.tsx` — 每条历史条目新增编辑和删除按钮，暴露 `onEdit`/`onDelete` 回调
- `src/utils/persist.ts` — 首次加载时 cumulative 从 history 重建，自动修复不一致数据
