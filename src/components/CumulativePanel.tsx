import { useState, useRef, useEffect, useCallback } from 'react'
import type { CumulativeScore } from '../types'
import { cn } from '../utils/cn'

interface CumulativePanelProps {
  playerIds: string[]
  scores: Map<string, CumulativeScore>
  playerNames: Map<string, string>
  onNameChange: (playerId: string, name: string) => void
}

const PLAYER_COLORS = ['text-blue-300', 'text-amber-300', 'text-emerald-300', 'text-rose-300']
const PLAYER_BORDERS = ['border-blue-400/20', 'border-amber-400/20', 'border-emerald-400/20', 'border-rose-400/20']

export default function CumulativePanel({ playerIds, scores, playerNames, onNameChange }: CumulativePanelProps) {
  return (
    <section aria-label="累计积分">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {playerIds.map((id, idx) => {
          const s = scores.get(id) ?? { bonusEarned: 0, bonusLost: 0, outcomeNet: 0, wins: 0, losses: 0, grandTotal: 0 }
          const name = playerNames.get(id) || id
          const hasData = s.bonusEarned !== 0 || s.bonusLost !== 0 || s.wins !== 0 || s.losses !== 0
          return (
            <div
              key={id}
              className={cn(
                'flex flex-col items-center rounded-xl border bg-surface-alt/40 px-2.5 py-2.5 gap-2',
                hasData ? PLAYER_BORDERS[idx] : 'border-border'
              )}
            >
              {/* Editable player name */}
              <EditableName
                playerId={id}
                name={name}
                colorClass={PLAYER_COLORS[idx]}
                onSave={(newName) => onNameChange(id, newName)}
              />

              {/* Hero total */}
              <span
                className={cn(
                  'text-2xl sm:text-3xl font-bold tabular-nums leading-none tracking-tight',
                  s.grandTotal > 0
                    ? 'text-score-positive'
                    : s.grandTotal < 0
                      ? 'text-score-negative'
                      : 'text-score-zero'
                )}
              >
                {fmtSigned(s.grandTotal)}
              </span>

              {/* Breakdown row */}
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-500">
                  收<span className={cn('tabular-nums ml-0.5', s.bonusEarned > 0 ? 'text-score-positive' : s.bonusEarned < 0 ? 'text-score-negative' : 'text-slate-400')}>{fmtSigned(s.bonusEarned)}</span>
                </span>
                <span className="text-slate-500">
                  支<span className={cn('tabular-nums ml-0.5', s.bonusLost < 0 ? 'text-score-negative' : s.bonusLost > 0 ? 'text-score-positive' : 'text-slate-400')}>{fmtSigned(s.bonusLost)}</span>
                </span>
                <span className="text-slate-500">
                  胜<span className="tabular-nums ml-0.5 text-primary-400">{s.wins}</span>
                </span>
                <span className="text-slate-500">
                  负<span className="tabular-nums ml-0.5 text-red-400">{s.losses}</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function EditableName({
  playerId: _playerId,
  name,
  colorClass,
  onSave,
}: {
  playerId: string
  name: string
  colorClass: string
  onSave: (name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commit = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== name) {
      onSave(trimmed)
    } else {
      setDraft(name)
    }
    setEditing(false)
  }, [draft, name, onSave])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        commit()
      } else if (e.key === 'Escape') {
        setDraft(name)
        setEditing(false)
      }
    },
    [commit, name]
  )

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        maxLength={12}
        className="w-full text-center text-xs font-semibold tracking-wide bg-surface border border-primary-500/40 rounded-lg px-2 py-1
          text-white outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-500/30"
      />
    )
  }

  return (
    <span
      className={cn(
        'text-xs font-semibold tracking-wide cursor-pointer select-none',
        'px-2 py-1 rounded-md hover:bg-white/5 transition-colors',
        colorClass
      )}
      onDoubleClick={() => {
        setDraft(name)
        setEditing(true)
      }}
      title="双击修改玩家名称"
    >
      {name}
    </span>
  )
}

/** Format signed number: +N / −N / 0 */
function fmtSigned(n: number): string {
  if (n > 0) return `+${n}`
  if (n < 0) return `−${Math.abs(n)}`
  return '0'
}
