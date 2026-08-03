import { useEffect } from 'react'
import { useI18n } from '../../i18n'

interface Props {
  open: boolean
  title?: string
  wide?: boolean
  onClose: () => void
  children: React.ReactNode
}

export function ModuleSpecModal({ open, title, wide, onClose, children }: Props) {
  const { t } = useI18n()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="spec-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`spec-modal${wide ? ' spec-modal-wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? t('modal.properties')}
      >
        <div className="spec-modal-header">
          {title && <h3 className="spec-modal-title">{title}</h3>}
          <button
            type="button"
            className="spec-modal-close"
            onClick={onClose}
            aria-label={t('modal.close')}
            title={t('modal.closeEsc')}
          >
            ✕
          </button>
        </div>
        <div className="spec-modal-body">{children}</div>
      </div>
    </div>
  )
}
