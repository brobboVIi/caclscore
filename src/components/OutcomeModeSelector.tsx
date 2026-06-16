import { Check } from 'lucide-react'
import type { OutcomeMode } from '../types'

interface OutcomeModeSelectorProps {
  value: OutcomeMode
  onChange: (mode: OutcomeMode) => void
}

const modes: { key: OutcomeMode; label: string; desc: string; score: string }[] = [
  { key: 'big_win', label: '大胜', desc: '胜方+2 / 负方−2', score: '±2' },
  { key: 'small_win', label: '小胜', desc: '胜方+1 / 负方−1', score: '±1' },
]

export default function OutcomeModeSelector({ value, onChange }: OutcomeModeSelectorProps) {
  return (
    <fieldset className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {modes.map((mode) => {
          const isActive = value === mode.key
          return (
            <button
              key={mode.key}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(mode.key)}
              className={`
                relative flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200
                ${isActive
                  ? 'border-primary-500/60 bg-primary-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'border-border bg-surface-alt/50 hover:border-slate-600 hover:bg-surface-alt'
                }
              `}
            >
              {isActive && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-primary-500">
                  <Check className="w-2.5 h-2.5 text-white" aria-hidden="true" />
                </span>
              )}
              <span className="text-sm font-semibold">{mode.label}</span>
              <span className="text-[10px] text-slate-400">{mode.desc}</span>
              <span className={`
                text-sm font-bold tabular-nums ml-auto
                ${isActive ? 'text-primary-300' : 'text-slate-500'}
              `}>
                {mode.score}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
