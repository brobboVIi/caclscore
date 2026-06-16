export type OutcomeMode = 'big_win' | 'small_win'

export interface PlayerRoundData {
  id: string
  /** 本局奖金数量（≥ 0，无上限） */
  bonusCount: number
  /** 本局胜负 */
  isWinner: boolean
}

export interface GameRound {
  players: PlayerRoundData[]
  outcomeMode: OutcomeMode
}

/** 本局计算 */
export interface RoundBreakdown {
  bonusSelf: number // bonusCount × 3
  bonusFromOthers: number // -(其他三人 bonusCount 之和)
  outcomeScore: number // 满足胜负条件后的 ±2 或 ±1
  roundTotal: number // 三者之和
}

/** 一局确认后的快照，用于历史记录展示 */
export interface RoundHistoryEntry {
  roundNumber: number
  outcomeMode: OutcomeMode
  players: PlayerRoundData[]
  breakdowns: Map<string, RoundBreakdown>
}

/** 累计 */
export interface CumulativeScore {
  bonusEarned: number // 累计奖金收入（∑bonusCount × 3）
  bonusLost: number // 累计被他人扣分（∑他人奖金）
  outcomeNet: number // 累计胜负净得分
  wins: number // 累计胜场数
  losses: number // 累计负场数
  grandTotal: number // 三项代数和
}
