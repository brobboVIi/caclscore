## ADDED Requirements

### Requirement: 编辑历史局

系统 SHALL 允许用户对任意已确认的历史局进行编辑，包括修改每位玩家的奖金数、胜负标记以及本局的大小胜模式。

#### Scenario: 从历史记录进入编辑模式

- **WHEN** 用户点击历史记录中某局的编辑按钮
- **AND** 当前输入区无未确认数据（所有 bonusCount 为 0 且无 winner 标记）
- **THEN** 系统将该局数据（players、outcomeMode）加载到当前输入区
- **AND** Header 显示「编辑第 N 局」
- **AND** 确认按钮文字变为「保存修改」
- **AND** 出现「取消编辑」按钮
- **AND** 该局在历史列表中被高亮标记为「编辑中」

#### Scenario: 编辑时有未确认数据

- **WHEN** 用户点击历史编辑按钮
- **AND** 当前输入区存在未确认数据
- **THEN** 系统弹出确认对话框，提示「当前有未保存的数据，是否放弃并编辑第 N 局？」
- **AND** 用户确认后加载历史数据，未确认数据被丢弃
- **AND** 用户取消后保持当前状态不变

#### Scenario: 保存编辑

- **WHEN** 用户在编辑模式下点击「保存修改」
- **AND** 恰好有 2 名玩家被标记为胜方
- **THEN** 系统重新计算本局 breakdowns
- **AND** 替换 roundHistory 中对应条目
- **AND** 从完整 roundHistory 重新计算 cumulative
- **AND** 清空输入区，退出编辑模式

#### Scenario: 取消编辑

- **WHEN** 用户在编辑模式下点击「取消编辑」
- **THEN** 系统清空输入区，退出编辑模式
- **AND** roundHistory 和 cumulative 保持不变

### Requirement: 删除历史局

系统 SHALL 允许用户删除任意已确认的历史局，删除后后续局数编号自动重排。

#### Scenario: 删除历史局

- **WHEN** 用户点击历史记录中某局的删除按钮
- **THEN** 系统弹出确认对话框，提示「删除第 N 局？此操作不可撤销」
- **AND** 用户确认后从 roundHistory 中移除该条目
- **AND** 所有后续条目的 roundNumber 减 1
- **AND** 从完整 roundHistory 重新计算 cumulative

#### Scenario: 编辑中删除同一局

- **WHEN** 用户正处于第 N 局的编辑模式
- **AND** 用户点击第 N 局的删除按钮
- **THEN** 系统先退出编辑模式（清空输入区）
- **AND** 再执行删除流程

### Requirement: 累计分数从历史派生

系统 SHALL 在每次历史记录变更（新增、编辑、删除）后从完整 roundHistory 重建 cumulative，确保累计分数与历史记录始终一致。

#### Scenario: 确认新局后累计更新

- **WHEN** 用户确认新一局
- **THEN** 系统将新条目追加到 roundHistory
- **AND** 调用 recomputeCumulativeFromHistory 重建 cumulative

#### Scenario: 编辑历史后累计更新

- **WHEN** 用户保存对历史局的编辑
- **THEN** 系统从更新后的 roundHistory 重建 cumulative

#### Scenario: 删除历史后累计更新

- **WHEN** 用户确认删除历史局
- **THEN** 系统从更新后的 roundHistory 重建 cumulative

#### Scenario: 从 localStorage 加载时自动修复

- **WHEN** 应用从 localStorage 加载状态
- **THEN** 系统从加载的 roundHistory 重建 cumulative
- **AND** 忽略 localStorage 中存储的旧 cumulative 值
