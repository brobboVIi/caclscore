# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with --host (LAN accessible)
npm run build    # Type-check then production build
npm run preview  # Preview production build
```

## Architecture

CaclScore is a four-player game scoring app — React 19 + TypeScript + Tailwind CSS v4 (Vite). Dark OLED theme (Inter font, green primary #15803D, gold accent #D97706, surface #0F172A). No routing — single-page app.

### Data model (`src/types.ts`)

- **`PlayerRoundData`** — per-player current-round state: `id`, `bonusCount` (≥0), `isWinner`
- **`OutcomeMode`** — `'big_win'` (winners +2, losers −2) or `'small_win'` (+1/−1)
- **`RoundBreakdown`** — computed per-player scores: `bonusSelf` (bonusCount×3), `bonusFromOthers` (−sum of others' bonuses), `outcomeScore`, `roundTotal`
- **`CumulativeScore`** — running totals: `bonusEarned`, `bonusLost`, `outcomeNet`, `wins`, `losses`, `grandTotal`
- **`RoundHistoryEntry`** — snapshot of a confirmed round (players + breakdowns)

### Scoring logic (`src/utils/scoring.ts`)

Core rules: each bonus gives the owner +3 and each other player −1. Always exactly 2 winners and 2 losers per round. The `winnersConfirmed` parameter on `calcRoundBreakdown` / `calcAllBreakdowns` gates whether outcome scores are applied (0 until 2 winners selected). `verifyZeroSum` checks that the four bonus scores sum to zero.

### State (`src/App.tsx`)

All state lives in `App` as `useState` hooks. Key flow:

1. User selects outcome mode, adjusts bonuses via ± buttons, marks 2 winners
2. Scores recompute in real-time via `useMemo` → `calcAllBreakdowns`
3. User clicks confirm → `handleConfirm` saves a `RoundHistoryEntry`, calls `updateCumulative`, increments round, resets players
4. Reset shows a `ConfirmDialog` (destructive action confirmation)

Player names are stored as `Map<string, string>` and editable via double-click in `CumulativePanel`.

### Component tree (top to bottom)

```
Header (round number)
CumulativePanel (large totals, editable names, 收/支/胜/负 breakdown)
RoundHistory (collapsible, newest-first past rounds)
OutcomeModeSelector (big_win / small_win radio)
PlayerCard ×4 (bonus ± buttons, winner/loser toggle, score breakdown)
ZeroSumTotals (compact 4-col round summary)
ConfirmButton + ResetButton
```

### Design tokens (`src/index.css`)

Semantic color tokens defined via Tailwind v4 `@theme`: `--color-primary` (green), `--color-accent` (gold), `--color-surface`, `--color-border`, `--color-destructive`, `--color-score-positive/negative/zero`. Icons from lucide-react (Crown, Skull, Plus, Minus, Check, ChevronDown/Up, etc.).
