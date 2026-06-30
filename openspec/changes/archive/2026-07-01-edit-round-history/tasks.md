## 1. 工具函数

- [x] 1.1 在 `src/utils/scoring.ts` 新增 `recomputeCumulativeFromHistory(entries: RoundHistoryEntry[], playerIds: string[]): Map<string, CumulativeScore>` 函数，遍历所有历史条目累加每位玩家的 bonusEarned/bonusLost/outcomeNet/wins/losses/grandTotal

## 2. App 状态与派生值

- [x] 2.1 新增 `editingRound` 状态（`useState<number | null>(null)`）
- [x] 2.2 将 `round` 从独立 state 改为派生值 `const round = roundHistory.length + 1`
- [x] 2.3 将 `cumulative` 初始值改为从 `roundHistory` 计算，新增 `useEffect` 在 `roundHistory` 变化时调用 `recomputeCumulativeFromHistory` 重算

## 3. 编辑与删除 Handler

- [x] 3.1 新增 `handleEditHistory(roundNumber: number)` — 检查当前是否有未确认数据，如有则弹 ConfirmDialog，确认后将历史数据加载到 `players`/`outcomeMode`，设置 `editingRound`
- [x] 3.2 新增 `handleDeleteHistory(roundNumber: number)` — 弹出 ConfirmDialog 确认后移除条目并重排后续局数编号，重算 cumulative
- [x] 3.3 新增 `handleCancelEdit()` — 清空输入区，重置 `editingRound` 为 null
- [x] 3.4 改造 `handleConfirm` — 编辑模式下替换 history 对应条目（非追加），新增和编辑都统一触发 cumulative 重算
- [x] 3.5 新增 `hasUnconfirmedData()` 辅助函数 — 判断 players 是否有非默认值

## 4. RoundHistory 组件

- [x] 4.1 每条历史条目右上角新增编辑按钮（Pencil 图标）和删除按钮（Trash2 图标）
- [x] 4.2 新增 `onEdit` 和 `onDelete` props，分别在点击时调用
- [x] 4.3 编辑中的条目（`editingRound === entry.roundNumber`）添加高亮样式标记

## 5. 持久化兼容

- [x] 5.1 修改 `loadState` 逻辑：加载后从 `roundHistory` 重建 `cumulative`，忽略 localStorage 中存储的旧 cumulative 值
- [x] 5.2 保存时不再单独持久化 `round`（改为派生值），移除 saveState 中的 round 参数

## 6. UI 联动

- [x] 6.1 Header 组件支持编辑模式文案（「编辑第 N 局」）和取消编辑按钮
- [x] 6.2 确认按钮在编辑模式下文字变为「保存修改」，新增「取消编辑」按钮
- [x] 6.3 编辑模式下的 ConfirmDialog 文案适配（放弃未保存数据提示）

## 7. 验证

- [x] 7.1 `npm run build` 无类型错误
- [x] 7.2 手动测试：正常新增一局 → 编辑奖金数 → 保存 → 累计分数正确
- [x] 7.3 手动测试：编辑胜负标记 → 保存 → 累计胜/负场数正确
- [x] 7.4 手动测试：删除中间某一局 → 编号重排 → 累计分数重算正确
- [x] 7.5 手动测试：有未确认数据时编辑历史 → 弹出确认对话框
- [x] 7.6 手动测试：编辑模式下取消编辑 → 恢复为新局模式
