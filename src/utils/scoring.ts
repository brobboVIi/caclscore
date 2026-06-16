import type { PlayerRoundData, OutcomeMode, RoundBreakdown, CumulativeScore, GameRound } from '../types'

/** 计算单局每位玩家的得分明细。
 *  @param winnersSet 胜方是否已确定（2人）。未确定时胜负分取 0。 */
export function calcRoundBreakdown(
  player: PlayerRoundData,
  allPlayers: PlayerRoundData[],
  outcomeMode: OutcomeMode,
  winnersConfirmed: boolean = true
): RoundBreakdown {
  const bonusSelf = player.bonusCount * 3

  const otherBonusSum = allPlayers
    .filter((p) => p.id !== player.id)
    .reduce((sum, p) => sum + p.bonusCount, 0)
  const bonusFromOthers = -otherBonusSum

  let outcomeScore = 0
  if (winnersConfirmed) {
    const winScore = outcomeMode === 'big_win' ? 2 : 1
    const loseScore = outcomeMode === 'big_win' ? -2 : -1
    outcomeScore = player.isWinner ? winScore : loseScore
  }

  const roundTotal = bonusSelf + bonusFromOthers + outcomeScore

  return { bonusSelf, bonusFromOthers, outcomeScore, roundTotal }
}

/** 计算一局所有玩家的得分明细 */
export function calcAllBreakdowns(
  players: PlayerRoundData[],
  outcomeMode: OutcomeMode,
  winnersConfirmed: boolean = true
): Map<string, RoundBreakdown> {
  const map = new Map<string, RoundBreakdown>()
  for (const p of players) {
    map.set(p.id, calcRoundBreakdown(p, players, outcomeMode, winnersConfirmed))
  }
  return map
}

const ZERO_CUMULATIVE: CumulativeScore = {
  bonusEarned: 0,
  bonusLost: 0,
  outcomeNet: 0,
  wins: 0,
  losses: 0,
  grandTotal: 0,
}

/** 更新累计分数 */
export function updateCumulative(
  prev: Map<string, CumulativeScore>,
  players: PlayerRoundData[],
  outcomeMode: OutcomeMode
): Map<string, CumulativeScore> {
  const next = new Map(prev)
  const breakdowns = calcAllBreakdowns(players, outcomeMode)

  for (const p of players) {
    const old = prev.get(p.id) ?? ZERO_CUMULATIVE
    const bd = breakdowns.get(p.id)!

    next.set(p.id, {
      bonusEarned: old.bonusEarned + bd.bonusSelf,
      bonusLost: old.bonusLost + bd.bonusFromOthers,
      outcomeNet: old.outcomeNet + bd.outcomeScore,
      wins: old.wins + (p.isWinner ? 1 : 0),
      losses: old.losses + (p.isWinner ? 0 : 1),
      grandTotal: old.grandTotal + bd.roundTotal,
    })
  }

  return next
}

/** 校验本局是否可确认 */
export function canConfirm(
  outcomeMode: OutcomeMode | null,
  winners: Set<string>
): boolean {
  return outcomeMode !== null && winners.size === 2
}

/** 校验奖金分总和归零 */
export function verifyZeroSum(players: PlayerRoundData[]): boolean {
  const total = players.reduce((sum, p) => {
    const bonusSelf = p.bonusCount * 3
    const otherSum = players.filter((o) => o.id !== p.id).reduce((s, o) => s + o.bonusCount, 0)
    return sum + bonusSelf - otherSum
  }, 0)
  return total === 0
}

/** 创建空白的新局 */
export function createEmptyRound(playerIds: string[]): GameRound {
  return {
    players: playerIds.map((id) => ({ id, bonusCount: 0, isWinner: false })),
    outcomeMode: 'big_win',
  }
}
