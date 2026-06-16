import { Minus, Plus, Crown, Skull } from 'lucide-react'
import type { PlayerRoundData, OutcomeMode, RoundBreakdown } from '../types'
import { calcRoundBreakdown } from '../utils/scoring'
import { cn } from '../utils/cn'
import { ScoreValue } from './ScoreDisplay'

interface PlayerCardProps {
  player: PlayerRoundData
  allPlayers: PlayerRoundData[]
  outcomeMode: OutcomeMode
  winnerCount: number
  playerName: string
  onBonusChange: (delta: number) => void
  onToggleWin: () => void
}

const PLAYER_COLORS = [
  'border-t-blue-400',
  'border-t-amber-400',
  'border-t-emerald-400',
  'border-t-rose-400',
]

const PLAYER_ACCENTS = [
  'bg-blue-500/10 text-blue-300',
  'bg-amber-500/10 text-amber-300',
  'bg-emerald-500/10 text-emerald-300',
  'bg-rose-500/10 text-rose-300',
]

export default function PlayerCard({
  player,
  allPlayers,
  outcomeMode,
  winnerCount,
  playerName,
  onBonusChange,
  onToggleWin,
}: PlayerCardProps) {
  const idx = allPlayers.findIndex((p) => p.id === player.id)
  const isWinner = player.isWinner
  const isConfirmedLoser = winnerCount === 2 && !isWinner
  const breakdown: RoundBreakdown = calcRoundBreakdown(player, allPlayers, outcomeMode, winnerCount === 2)

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-surface-alt/60 overflow-hidden transition-all duration-300',
        'border-t-[3px] border-x-border border-b-border',
        PLAYER_COLORS[idx],
        isWinner && 'ring-1 ring-primary-500/30 shadow-[0_0_24px_rgba(16,185,129,0.08)]'
      )}
    >
      {/* Player Header */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className={cn('text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded truncate max-w-[80px]', PLAYER_ACCENTS[idx])}>
          {playerName}
        </span>
        <WinLossBadge
          isWinner={isWinner}
          isConfirmedLoser={isConfirmedLoser}
          onToggle={onToggleWin}
        />
      </div>

      {/* Bonus Counter */}
      <div className="px-2 pb-1.5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onBonusChange(-1)}
            disabled={player.bonusCount <= 0}
            aria-label={`减少${playerName}奖金`}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-lg border transition-all duration-150',
              'active:scale-95 touch-manipulation',
              player.bonusCount > 0
                ? 'border-slate-600 bg-surface text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white'
                : 'border-border bg-transparent text-slate-700 cursor-not-allowed'
            )}
          >
            <Minus className="w-3 h-3" aria-hidden="true" />
          </button>

          <span className={cn(
            'text-lg font-bold tabular-nums min-w-[2ch] text-center select-none',
            player.bonusCount > 0 ? 'text-white' : 'text-slate-600'
          )}>
            {player.bonusCount}
          </span>

          <button
            type="button"
            onClick={() => onBonusChange(1)}
            aria-label={`增加${playerName}奖金`}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-lg border border-slate-600 transition-all duration-150',
              'bg-surface text-slate-300 hover:border-accent-500 hover:bg-accent-500/10 hover:text-accent-300',
              'active:scale-95 touch-manipulation'
            )}
          >
            <Plus className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="border-t border-border px-2 py-1.5 space-y-0.5 bg-black/20">
        <BreakdownRow label="收入" value={breakdown.bonusSelf} />
        <BreakdownRow label="扣分" value={breakdown.bonusFromOthers} />
        <BreakdownRow
          label={outcomeMode === 'big_win' ? '大胜' : '小胜'}
          value={breakdown.outcomeScore}
        />
        <div className="border-t border-border/50 pt-0.5 mt-0.5">
          <BreakdownRow label="合计" value={breakdown.roundTotal} size="lg" />
        </div>
      </div>
    </div>
  )
}

function BreakdownRow({
  label,
  value,
  size = 'sm',
}: {
  label: string
  value: number
  size?: 'sm' | 'lg'
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] text-slate-500">{label}</span>
      <ScoreValue value={value} size={size === 'lg' ? 'md' : 'sm'} />
    </div>
  )
}

function WinLossBadge({
  isWinner,
  isConfirmedLoser,
  onToggle,
}: {
  isWinner: boolean
  isConfirmedLoser: boolean
  onToggle: () => void
}) {
  if (isWinner) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="取消标记为胜方"
        aria-pressed={true}
        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-all duration-200
          bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-primary-500/30 touch-manipulation active:scale-95"
      >
        <Crown className="w-2.5 h-2.5" aria-hidden="true" />
        胜
      </button>
    )
  }

  if (isConfirmedLoser) {
    return (
      <span
        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold
          bg-red-500/10 text-red-400 border border-red-500/20"
      >
        <Skull className="w-2.5 h-2.5" aria-hidden="true" />
        负
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="标记为胜方"
      aria-pressed={false}
      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-all duration-200
        bg-surface text-slate-500 border border-slate-700/50 hover:border-primary-500/40 hover:text-primary-300 hover:bg-primary-500/10
        touch-manipulation active:scale-95"
    >
      待选
    </button>
  )
}
