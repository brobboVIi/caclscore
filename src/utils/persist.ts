import type { OutcomeMode, RoundHistoryEntry, CumulativeScore, RoundBreakdown } from '../types'

const STORAGE_KEY = 'caclscore-state'

interface SerializedEntry {
  roundNumber: number
  outcomeMode: OutcomeMode
  players: RoundHistoryEntry['players']
  breakdowns: [string, RoundBreakdown][]
}

interface PersistedState {
  cumulative: [string, CumulativeScore][]
  playerNames: [string, string][]
  roundHistory: SerializedEntry[]
}

function serializeHistory(entries: RoundHistoryEntry[]): SerializedEntry[] {
  return entries.map((e) => ({
    roundNumber: e.roundNumber,
    outcomeMode: e.outcomeMode,
    players: e.players,
    breakdowns: [...e.breakdowns],
  }))
}

function deserializeHistory(entries: SerializedEntry[]): RoundHistoryEntry[] {
  return entries.map((e) => ({
    ...e,
    breakdowns: Array.isArray(e.breakdowns) ? new Map(e.breakdowns) : new Map(),
  }))
}

export function saveState(
  cumulative: Map<string, CumulativeScore>,
  playerNames: Map<string, string>,
  roundHistory: RoundHistoryEntry[],
): void {
  const data: PersistedState = {
    cumulative: [...cumulative],
    playerNames: [...playerNames],
    roundHistory: serializeHistory(roundHistory),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as PersistedState
    if (!Array.isArray(data.cumulative) || !Array.isArray(data.roundHistory)) {
      return null
    }
    // Convert serialized history back with real Maps
    ;(data as any).roundHistory = deserializeHistory(data.roundHistory)
    return data
  } catch {
    return null
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // silently ignore
  }
}
