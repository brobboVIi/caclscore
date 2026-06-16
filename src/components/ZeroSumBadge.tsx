import { CheckCircle2, AlertTriangle } from 'lucide-react'
import type { PlayerRoundData } from '../types'
import { verifyZeroSum } from '../utils/scoring'

interface ZeroSumBadgeProps {
  players: PlayerRoundData[]
}

export default function ZeroSumBadge({ players }: ZeroSumBadgeProps) {
  const ok = verifyZeroSum(players)

  if (ok) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-primary-400">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        <span>零和校验通过</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400">
      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
      <span>奖金分总和不为零</span>
    </span>
  )
}
