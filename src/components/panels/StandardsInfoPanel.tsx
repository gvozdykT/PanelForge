import { useI18n } from '../../i18n'

const CHANGE_KEYS = ['change1', 'change2', 'change3', 'change4', 'change5'] as const
const CHECK_KEYS = ['check1', 'check2', 'check3', 'check4', 'check5', 'check6', 'check7', 'check8'] as const
const REF_KEYS = ['ref1', 'ref2', 'ref3', 'ref4'] as const

export function StandardsInfoPanel() {
  const { t } = useI18n()

  return (
    <article className="standards-info">
      <p className="standards-intro">{t('standardsInfo.intro')}</p>

      <section className="standards-block">
        <h4>{t('standardsInfo.pueTitle')}</h4>
        <dl className="standards-meta">
          <div>
            <dt>{t('standardsInfo.metaOrder')}</dt>
            <dd>{t('standardsInfo.metaOrderValue')}</dd>
          </div>
          <div>
            <dt>{t('standardsInfo.metaReplaces')}</dt>
            <dd>{t('standardsInfo.metaReplacesValue')}</dd>
          </div>
          <div>
            <dt>{t('standardsInfo.metaStatus')}</dt>
            <dd>{t('standardsInfo.metaStatusValue')}</dd>
          </div>
        </dl>
      </section>

      <section className="standards-block">
        <h4>{t('standardsInfo.scopeTitle')}</h4>
        <p>{t('standardsInfo.scopeIndustrial')}</p>
        <p className="standards-note">{t('standardsInfo.scopeExcluded')}</p>
      </section>

      <section className="standards-block">
        <h4>{t('standardsInfo.changesTitle')}</h4>
        <ul>
          {CHANGE_KEYS.map((key) => (
            <li key={key}>{t(`standardsInfo.${key}`)}</li>
          ))}
        </ul>
      </section>

      <section className="standards-block standards-highlight">
        <h4>{t('standardsInfo.residentialTitle')}</h4>
        <p>{t('standardsInfo.residentialBody')}</p>
        <ul>
          <li>{t('standardsInfo.residentialTn')}</li>
          <li>{t('standardsInfo.residentialRcd')}</li>
          <li>{t('standardsInfo.residentialSelectivity')}</li>
        </ul>
      </section>

      <section className="standards-block">
        <h4>{t('standardsInfo.checksTitle')}</h4>
        <ul className="standards-checks">
          {CHECK_KEYS.map((key) => (
            <li key={key}>{t(`standardsInfo.${key}`)}</li>
          ))}
        </ul>
      </section>

      <section className="standards-block">
        <h4>{t('standardsInfo.refsTitle')}</h4>
        <ul className="standards-refs">
          {REF_KEYS.map((key) => (
            <li key={key}>{t(`standardsInfo.${key}`)}</li>
          ))}
        </ul>
      </section>
    </article>
  )
}
