import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import type { OutcomeMode, PlayerRoundData, CumulativeScore, RoundHistoryEntry } from './types'
import { calcAllBreakdowns, recomputeCumulativeFromHistory, canConfirm } from './utils/scoring'
import { cn } from './utils/cn'
import Header from './components/Header'
import OutcomeModeSelector from './components/OutcomeModeSelector'
import PlayerCard from './components/PlayerCard'
import CumulativePanel from './components/CumulativePanel'
import ZeroSumBadge from './components/ZeroSumBadge'
import ConfirmDialog from './components/ConfirmDialog'
import RoundHistory from './components/RoundHistory'
import InlineScoreBar from './components/InlineScoreBar'
import { loadState, saveState, clearState } from './utils/persist'

const PLAYER_IDS = ['a', 'b', 'c', 'd']
const DEFAULT_NAMES = ['玩家A', '玩家B', '玩家C', '玩家D']

function createFreshPlayers(): PlayerRoundData[] {
  return PLAYER_IDS.map((id) => ({ id, bonusCount: 0, isWinner: false }))
}

function createDefaultNames(): Map<string, string> {
  const m = new Map<string, string>()
  PLAYER_IDS.forEach((id, i) => m.set(id, DEFAULT_NAMES[i]))
  return m
}

function hasUnconfirmedData(players: PlayerRoundData[]): boolean {
  return players.some((p) => p.bonusCount !== 0 || p.isWinner)
}

export default function App() {
  const saved = useRef(loadState())
  const initialHistory = (saved.current?.roundHistory as RoundHistoryEntry[] | undefined) ?? []
  const [roundHistory, setRoundHistory] = useState<RoundHistoryEntry[]>(initialHistory)
  const [editingRound, setEditingRound] = useState<number | null>(null)
  const [outcomeMode, setOutcomeMode] = useState<OutcomeMode>('big_win')
  const [players, setPlayers] = useState<PlayerRoundData[]>(createFreshPlayers)
  const [cumulative, setCumulative] = useState<Map<string, CumulativeScore>>(
    () => recomputeCumulativeFromHistory(initialHistory, PLAYER_IDS)
  )
  const [playerNames, setPlayerNames] = useState<Map<string, string>>(
    () => (saved.current ? new Map(saved.current.playerNames) : createDefaultNames())
  )
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  // round is derived from history length
  const round = roundHistory.length + 1

  // Persist to localStorage whenever durable state changes
  useEffect(() => {
    saveState(cumulative, playerNames, roundHistory)
  }, [cumulative, playerNames, roundHistory])

  const [discardDialogTarget, setDiscardDialogTarget] = useState<number | null>(null)
  const [deleteDialogTarget, setDeleteDialogTarget] = useState<number | null>(null)

  // Derived state
  const winnerCount = useMemo(
    () => players.filter((p) => p.isWinner).length,
    [players]
  )

  const winners = useMemo(
    () => new Set(players.filter((p) => p.isWinner).map((p) => p.id)),
    [players]
  )

  const winnersConfirmed = winnerCount === 2
  const ready = canConfirm(outcomeMode, winners)
  const breakdowns = useMemo(
    () => calcAllBreakdowns(players, outcomeMode, winnersConfirmed),
    [players, outcomeMode, winnersConfirmed]
  )

  // Handlers
  const handleBonusChange = useCallback((playerId: string, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, bonusCount: Math.max(0, p.bonusCount + delta) } : p
      )
    )
  }, [])

  const handleToggleWin = useCallback((playerId: string) => {
    setPlayers((prev) => {
      const player = prev.find((p) => p.id === playerId)
      if (!player) return prev

      // If already winner, unmark
      if (player.isWinner) {
        return prev.map((p) => (p.id === playerId ? { ...p, isWinner: false } : p))
      }

      // Only mark if we have fewer than 2 winners
      const currentWinners = prev.filter((p) => p.isWinner).length
      if (currentWinners >= 2) return prev

      return prev.map((p) => (p.id === playerId ? { ...p, isWinner: true } : p))
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (!ready) return

    const confirmedBreakdowns = calcAllBreakdowns(players, outcomeMode, winnersConfirmed)

    setRoundHistory((prev) => {
      const entry = {
        roundNumber: editingRound ?? prev.length + 1,
        outcomeMode,
        players: players.map((p) => ({ ...p })),
        breakdowns: confirmedBreakdowns,
      }
      const next = editingRound != null
        ? prev.map((e) => (e.roundNumber === editingRound ? entry : e))
        : [...prev, entry]
      setCumulative(recomputeCumulativeFromHistory(next, PLAYER_IDS))
      return next
    })
    setPlayers(createFreshPlayers())
    setEditingRound(null)
  }, [ready, players, outcomeMode, winnersConfirmed, editingRound])

  const handleEditHistory = useCallback((roundNumber: number) => {
    if (hasUnconfirmedData(players)) {
      setDiscardDialogTarget(roundNumber)
      return
    }
    const entry = roundHistory.find((e) => e.roundNumber === roundNumber)
    if (!entry) return
    setPlayers(entry.players.map((p) => ({ ...p })))
    setOutcomeMode(entry.outcomeMode)
    setEditingRound(roundNumber)
  }, [players, roundHistory])

  const handleDeleteHistory = useCallback((roundNumber: number) => {
    setDeleteDialogTarget(roundNumber)
  }, [])

  const doDeleteHistory = useCallback((roundNumber: number) => {
    if (editingRound === roundNumber) {
      setPlayers(createFreshPlayers())
      setEditingRound(null)
    }
    setRoundHistory((prev) => {
      const filtered = prev.filter((e) => e.roundNumber !== roundNumber)
      // Renumber subsequent rounds
      const renumbered = filtered.map((e, i) => ({
        ...e,
        roundNumber: i + 1,
      }))
      setCumulative(recomputeCumulativeFromHistory(renumbered, PLAYER_IDS))
      return renumbered
    })
    setDeleteDialogTarget(null)
  }, [editingRound])

  const handleCancelEdit = useCallback(() => {
    setPlayers(createFreshPlayers())
    setEditingRound(null)
  }, [])

  const doDiscardAndEdit = useCallback(() => {
    if (discardDialogTarget == null) return
    const entry = roundHistory.find((e) => e.roundNumber === discardDialogTarget)
    setDiscardDialogTarget(null)
    if (!entry) return
    setPlayers(entry.players.map((p) => ({ ...p })))
    setOutcomeMode(entry.outcomeMode)
    setEditingRound(discardDialogTarget)
  }, [discardDialogTarget, roundHistory])

  const handleNameChange = useCallback((playerId: string, name: string) => {
    setPlayerNames((prev) => {
      const next = new Map(prev)
      next.set(playerId, name)
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    setPlayers(createFreshPlayers())
    setCumulative(new Map())
    setPlayerNames(createDefaultNames())
    setOutcomeMode('big_win')
    setRoundHistory([])
    setEditingRound(null)
    clearState()
  }, [])

  return (
    <div className="min-h-dvh bg-surface">
      {/* Sticky header: always compact, no layout shift */}
      <div className="sticky top-0 z-20 bg-surface border-b border-border/50">
        <Header round={round} editingRound={editingRound} onCancelEdit={handleCancelEdit} />
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <InlineScoreBar
            playerIds={PLAYER_IDS}
            scores={cumulative}
            playerNames={playerNames}
            onNameChange={handleNameChange}
          />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-4 pb-6 space-y-6">
        {/* Full cumulative panel — only visible before scrolling */}
        <CumulativePanel
          playerIds={PLAYER_IDS}
          scores={cumulative}
          playerNames={playerNames}
          onNameChange={handleNameChange}
        />
        {/* Round History */}
        <RoundHistory
          entries={roundHistory}
          playerNames={playerNames}
          editingRound={editingRound}
          onEdit={handleEditHistory}
          onDelete={handleDeleteHistory}
        />

        {/* Outcome Mode Selector */}
        <OutcomeModeSelector value={outcomeMode} onChange={setOutcomeMode} />

        {/* Player Cards Grid */}
        <section aria-label="玩家面板">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs uppercase tracking-widest text-slate-500">
              奖金 & 胜负
            </span>
            <ZeroSumBadge players={players} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                allPlayers={players}
                outcomeMode={outcomeMode}
                winnerCount={winnerCount}
                playerName={playerNames.get(player.id) || DEFAULT_NAMES[PLAYER_IDS.indexOf(player.id)]}
                onBonusChange={(d) => handleBonusChange(player.id, d)}
                onToggleWin={() => handleToggleWin(player.id)}
              />
            ))}
          </div>
        </section>

        {/* Zero-sum totals row */}
        <ZeroSumTotals players={players} breakdowns={breakdowns} playerNames={playerNames} />

        {/* Confirm Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!ready}
            aria-label={editingRound != null ? '保存修改' : '确认本局，进入下一局'}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-base transition-all duration-300',
              'touch-manipulation active:scale-[0.98]',
              ready
                ? 'bg-primary-600 text-white shadow-[0_0_30px_rgba(5,150,105,0.3)] hover:bg-primary-500 hover:shadow-[0_0_40px_rgba(5,150,105,0.45)]'
                : 'bg-surface-alt text-slate-600 cursor-not-allowed border border-border'
            )}
          >
            <Check className="w-5 h-5" aria-hidden="true" />
            {editingRound != null ? '保存修改' : '确认本局'}
            {editingRound == null && (
              <span className="text-xs opacity-60">
                (进入第 {round + 1} 局)
              </span>
            )}
          </button>

          {editingRound != null ? (
            <button
              type="button"
              onClick={handleCancelEdit}
              aria-label="取消编辑"
              className="flex items-center justify-center px-4 h-14 rounded-2xl border border-border bg-surface-alt text-slate-500 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-all duration-200 touch-manipulation active:scale-95 text-sm font-medium"
            >
              取消编辑
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setResetDialogOpen(true)}
              aria-label="重置所有数据"
              className="flex items-center justify-center w-14 h-14 rounded-2xl border border-border bg-surface-alt text-slate-500 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-all duration-200 touch-manipulation active:scale-95"
            >
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </main>

      <footer className="text-center py-8 text-[11px] text-slate-600">
        CaclScore · 四人对战积分系统
      </footer>

      <ConfirmDialog
        open={resetDialogOpen}
        title="重置所有数据？"
        message="这将清除本局输入和所有累计积分，且不可撤销。"
        confirmLabel="确认重置"
        cancelLabel="取消"
        variant="danger"
        onConfirm={() => {
          handleReset()
          setResetDialogOpen(false)
        }}
        onCancel={() => setResetDialogOpen(false)}
      />

      <ConfirmDialog
        open={discardDialogTarget != null}
        title="放弃当前数据？"
        message={`当前有未保存的输入数据，是否放弃并编辑第 ${discardDialogTarget ?? ''} 局？`}
        confirmLabel="放弃并编辑"
        cancelLabel="取消"
        variant="default"
        onConfirm={doDiscardAndEdit}
        onCancel={() => setDiscardDialogTarget(null)}
      />

      <ConfirmDialog
        open={deleteDialogTarget != null}
        title={`删除第 ${deleteDialogTarget ?? ''} 局？`}
        message="此操作不可撤销，后续局数编号将自动重排。"
        confirmLabel="确认删除"
        cancelLabel="取消"
        variant="danger"
        onConfirm={() => deleteDialogTarget != null && doDeleteHistory(deleteDialogTarget)}
        onCancel={() => setDeleteDialogTarget(null)}
      />
    </div>
  )
}

/** Zero-sum totals row showing the net bonus effect for each player */
function ZeroSumTotals({
  players,
  breakdowns,
  playerNames,
}: {
  players: PlayerRoundData[]
  breakdowns: Map<string, { bonusSelf: number; bonusFromOthers: number; outcomeScore: number; roundTotal: number }>
  playerNames: Map<string, string>
}) {
  const PLAYER_COLORS = ['text-blue-400', 'text-amber-400', 'text-emerald-400', 'text-rose-400']

  return (
    <div className="rounded-xl border border-border bg-surface-alt/30 px-4 py-3 overflow-x-auto">
      <div className="grid grid-cols-4 gap-3 text-center min-w-[300px]">
        {players.map((p, idx) => {
          const bd = breakdowns.get(p.id)
          if (!bd) return null
          const name = playerNames.get(p.id) || p.id
          return (
            <div key={p.id} className="flex flex-col gap-1">
              <span className={cn('text-xs font-semibold truncate', PLAYER_COLORS[idx])}>
                {name}
              </span>
              <span className="text-lg font-bold tabular-nums text-white">
                    {bd.roundTotal > 0 ? '+' : ''}{bd.roundTotal}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight">
                    收{bd.bonusSelf > 0 ? '+' : ''}{bd.bonusSelf} 支{bd.bonusFromOthers} 胜{bd.outcomeScore > 0 ? '+' : ''}{bd.outcomeScore}
                  </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
