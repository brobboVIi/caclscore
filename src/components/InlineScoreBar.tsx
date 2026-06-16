import type { CumulativeScore } from '../types'
import { cn } from '../utils/cn'

interface InlineScoreBarProps {
  playerIds: string[]
  scores: Map<string, CumulativeScore>
  playerNames: Map<string, string>
  onNameChange: (playerId: string, name: string) => void
}

const PLAYER_COLORS = ['text-blue-300', 'text-amber-300', 'text-emerald-300', 'text-rose-300']

export default function InlineScoreBar({ playerIds, scores, playerNames, onNameChange }: InlineScoreBarProps) {
  return (
    <div className="flex items-stretch divide-x divide-border/30">
      {playerIds.map((id, idx) => {
        const s = scores.get(id) ?? { bonusEarned: 0, bonusLost: 0, outcomeNet: 0, wins: 0, losses: 0, grandTotal: 0 }
        const name = playerNames.get(id) || id
        return (
          <div key={id} className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 min-w-0">
            {/* Name — double-click to edit */}
            <span
              className={cn('text-[11px] font-semibold truncate max-w-full cursor-pointer select-none hover:bg-white/5 rounded px-1', PLAYER_COLORS[idx])}
              onDoubleClick={() => {
                const newName = prompt('修改玩家名称', name)
                if (newName && newName.trim()) {
                  onNameChange(id, newName.trim())
                }
              }}
              title="双击修改名称"
            >
              {name}
            </span>
            {/* Total */}
            <span
              className={cn(
                'text-xl font-bold tabular-nums leading-none',
                s.grandTotal > 0
                  ? 'text-score-positive'
                  : s.grandTotal < 0
                    ? 'text-score-negative'
                    : 'text-score-zero'
              )}
            >
              {s.grandTotal > 0 ? '+' : s.grandTotal < 0 ? '−' : ''}{Math.abs(s.grandTotal)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
