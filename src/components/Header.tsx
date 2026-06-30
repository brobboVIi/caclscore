import { Trophy, X } from 'lucide-react'

interface HeaderProps {
  round: number
  editingRound?: number | null
  onCancelEdit?: () => void
}

export default function Header({ round, editingRound, onCancelEdit }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/20">
          <Trophy className="w-5 h-5 text-primary-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">CaclScore</h1>
          <p className="text-xs text-slate-400">四人对战积分系统</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {editingRound != null ? (
          <>
            <span className="text-xs text-accent-400">编辑第</span>
            <span className="text-2xl font-bold tabular-nums text-accent-400">{editingRound}</span>
            <span className="text-xs text-accent-400">局</span>
            {onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                aria-label="取消编辑"
                className="ml-1 flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </>
        ) : (
          <>
            <span className="text-xs uppercase tracking-widest text-slate-500">第</span>
            <span className="text-2xl font-bold tabular-nums text-white">{round}</span>
            <span className="text-xs uppercase tracking-widest text-slate-500">局</span>
          </>
        )}
      </div>
    </header>
  )
}
