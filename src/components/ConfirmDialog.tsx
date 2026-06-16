import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '../utils/cn'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Focus confirm button on open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => confirmRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface-alt p-6 shadow-2xl animate-in">
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="关闭"
          className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-2xl mb-4',
            variant === 'danger'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-accent/10 text-accent-400'
          )}
        >
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>

        {/* Content */}
        <h2 className="text-lg font-semibold text-white mb-1.5">{title}</h2>
        <p className="text-sm text-slate-400 leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors touch-manipulation"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 touch-manipulation',
              variant === 'danger'
                ? 'bg-destructive text-white hover:bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.25)]'
                : 'bg-primary-600 text-white hover:bg-primary-500'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
