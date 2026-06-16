import { Trophy } from 'lucide-react'

interface HeaderProps {
  round: number
}

export default function Header({ round }: HeaderProps) {
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
        <span className="text-xs uppercase tracking-widest text-slate-500">第</span>
        <span className="text-2xl font-bold tabular-nums text-white">{round}</span>
        <span className="text-xs uppercase tracking-widest text-slate-500">局</span>
      </div>
    </header>
  )
}
