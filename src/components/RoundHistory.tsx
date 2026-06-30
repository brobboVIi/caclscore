import { useState } from 'react'
import { ChevronDown, ChevronUp, Crown, Skull, Pencil, Trash2 } from 'lucide-react'
import type { RoundHistoryEntry } from '../types'
import { cn } from '../utils/cn'

interface RoundHistoryProps {
  entries: RoundHistoryEntry[]
  playerNames: Map<string, string>
  editingRound?: number | null
  onEdit?: (roundNumber: number) => void
  onDelete?: (roundNumber: number) => void
}

const PLAYER_COLORS = ['text-blue-400', 'text-amber-400', 'text-emerald-400', 'text-rose-400']

export default function RoundHistory({ entries, playerNames, editingRound, onEdit, onDelete }: RoundHistoryProps) {
  const [open, setOpen] = useState(false)

  if (entries.length === 0) {
    return (
      <div className="text-center py-2">
        <span className="text-[11px] text-slate-600">暂无历史记录</span>
      </div>
    )
  }

  return (
    <section aria-label="历史记录" className="space-y-3">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-1 py-2 w-full touch-manipulation group"
        aria-expanded={open}
      >
        <span className="text-xs uppercase tracking-widest text-slate-500">
          历史记录 ({entries.length} 局)
        </span>
        <span className="h-px flex-1 bg-border" />
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" aria-hidden="true" />
        )}
      </button>

      {/* Entry list — newest first */}
      {open && (
        <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
          {[...entries].reverse().map((entry) => (
            <div
              key={entry.roundNumber}
              className={cn(
                'rounded-xl border overflow-hidden',
                editingRound === entry.roundNumber
                  ? 'border-accent-400/50 bg-accent-500/5 ring-1 ring-accent-400/20'
                  : 'border-border bg-surface-alt/30'
              )}
            >
              {/* Header: round number + mode badge + actions */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    第 {entry.roundNumber} 局
                  </span>
                  {editingRound === entry.roundNumber && (
                    <span className="text-[10px] text-accent-400 font-semibold">编辑中</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                      entry.outcomeMode === 'big_win'
                        ? 'bg-primary-500/15 text-primary-300 border border-primary-500/25'
                        : 'bg-accent-500/10 text-accent-300 border border-accent-500/25'
                    )}
                  >
                    {entry.outcomeMode === 'big_win' ? '大胜 ±2' : '小胜 ±1'}
                  </span>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(entry.roundNumber)
                      }}
                      aria-label={`编辑第 ${entry.roundNumber} 局`}
                      className="ml-1 flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-primary-400 hover:bg-slate-800 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(entry.roundNumber)
                      }}
                      aria-label={`删除第 ${entry.roundNumber} 局`}
                      className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {/* Player grid: 4 columns */}
              <div className="grid grid-cols-4 divide-x divide-border/30">
                {entry.players.map((player, idx) => {
                  const bd = entry.breakdowns.get(player.id)
                  const name = playerNames.get(player.id) || player.id
                  return (
                    <div key={player.id} className="flex flex-col items-center px-1.5 py-3 gap-1.5">
                      {/* Win/Loss icon */}
                      <span
                        className={cn(
                          'flex items-center justify-center w-6 h-6 rounded-full',
                          player.isWinner
                            ? 'bg-primary-500/15 text-primary-300'
                            : 'bg-red-500/10 text-red-400'
                        )}
                        aria-label={player.isWinner ? '胜方' : '负方'}
                      >
                        {player.isWinner ? (
                          <Crown className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <Skull className="w-3 h-3" aria-hidden="true" />
                        )}
                      </span>

                      {/* Name */}
                      <span className={cn('text-[11px] font-semibold truncate max-w-full', PLAYER_COLORS[idx])}>
                        {name}
                      </span>

                      {/* Bonus count */}
                      <span className="text-[10px] text-slate-500">
                        奖金 {player.bonusCount}
                      </span>

                      {/* Score breakdown */}
                      {bd && (
                        <div className="text-center leading-tight">
                          <div className="text-[10px] text-slate-500">
                            {fmtMini(bd.bonusSelf)} {fmtMini(bd.bonusFromOthers)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {fmtMini(bd.outcomeScore)}
                          </div>
                          <div
                            className={cn(
                              'text-xs font-bold tabular-nums mt-0.5',
                              bd.roundTotal > 0
                                ? 'text-score-positive'
                                : bd.roundTotal < 0
                                  ? 'text-score-negative'
                                  : 'text-score-zero'
                            )}
                          >
                            {bd.roundTotal > 0 ? '+' : bd.roundTotal < 0 ? '−' : ''}{Math.abs(bd.roundTotal)}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function fmtMini(n: number): string {
  if (n > 0) return `+${n}`
  if (n < 0) return `−${Math.abs(n)}`
  return '0'
}
