import { cn } from '../utils/cn'

interface ScoreDisplayProps {
  label: string
  value: number
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreValue({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const colorClass =
    value > 0
      ? 'text-score-positive'
      : value < 0
        ? 'text-score-negative'
        : 'text-score-zero'

  const sign = value > 0 ? '+' : ''

  return (
    <span className={cn('font-semibold tabular-nums', sizeClasses[size], colorClass)}>
      {sign}{value}
    </span>
  )
}

export default function ScoreDisplay({ label, value, size = 'md' }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <ScoreValue value={value} size={size} />
    </div>
  )
}
