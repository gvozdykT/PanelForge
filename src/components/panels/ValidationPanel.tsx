import type { ValidationIssue } from '../../types'
import { useI18n } from '../../i18n'

interface Props {
  issues: ValidationIssue[]
  onSelectModule?: (moduleId: string) => void
}

const ICONS: Record<ValidationIssue['severity'], string> = {
  error: '⛔',
  warning: '⚠️',
  info: 'ℹ️',
}

export function ValidationPanel({ issues, onSelectModule }: Props) {
  const { t } = useI18n()
  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')
  const infos = issues.filter((i) => i.severity === 'info')

  return (
    <section className="panel-section validation">
      <h3>
        {t('validation.title')}
        {errors.length > 0 && <span className="badge error">{errors.length}</span>}
        {warnings.length > 0 && <span className="badge warning">{warnings.length}</span>}
      </h3>
      {issues.length === 0 ? (
        <p className="ok-msg">{t('validation.ok')}</p>
      ) : (
        <ul className="issue-list">
          {[...errors, ...warnings, ...infos].map((issue) => (
            <li
              key={issue.id}
              className={`issue issue-${issue.severity}`}
              onClick={() => issue.moduleId && onSelectModule?.(issue.moduleId)}
            >
              <span>{ICONS[issue.severity]}</span>
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
