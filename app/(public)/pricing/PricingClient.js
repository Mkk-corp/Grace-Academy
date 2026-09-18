'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import PageHero from '@/components/sections/PageHero'
import CountrySelect from '@/components/ui/CountrySelect'

/* ─── Country list (same as admin) ─────────────────────────────── */
const COUNTRIES = [
  { code: 'SA', en: 'Saudi Arabia',   ar: 'المملكة العربية السعودية' },
  { code: 'EG', en: 'Egypt',          ar: 'مصر'                      },
  { code: 'AE', en: 'UAE',            ar: 'الإمارات'                 },
  { code: 'KW', en: 'Kuwait',         ar: 'الكويت'                   },
  { code: 'QA', en: 'Qatar',          ar: 'قطر'                      },
  { code: 'BH', en: 'Bahrain',        ar: 'البحرين'                  },
  { code: 'OM', en: 'Oman',           ar: 'عُمان'                    },
  { code: 'JO', en: 'Jordan',         ar: 'الأردن'                   },
  { code: 'LB', en: 'Lebanon',        ar: 'لبنان'                    },
  { code: 'SY', en: 'Syria',          ar: 'سوريا'                    },
  { code: 'IQ', en: 'Iraq',           ar: 'العراق'                   },
  { code: 'YE', en: 'Yemen',          ar: 'اليمن'                    },
  { code: 'LY', en: 'Libya',          ar: 'ليبيا'                    },
  { code: 'TN', en: 'Tunisia',        ar: 'تونس'                     },
  { code: 'DZ', en: 'Algeria',        ar: 'الجزائر'                  },
  { code: 'MA', en: 'Morocco',        ar: 'المغرب'                   },
  { code: 'SD', en: 'Sudan',          ar: 'السودان'                  },
  { code: 'PS', en: 'Palestine',      ar: 'فلسطين'                   },
  { code: 'GB', en: 'United Kingdom', ar: 'المملكة المتحدة'          },
  { code: 'US', en: 'United States',  ar: 'الولايات المتحدة'         },
  { code: 'CA', en: 'Canada',         ar: 'كندا'                     },
  { code: 'AU', en: 'Australia',      ar: 'أستراليا'                 },
  { code: 'DE', en: 'Germany',        ar: 'ألمانيا'                  },
  { code: 'FR', en: 'France',         ar: 'فرنسا'                    },
  { code: 'OTHER', en: 'Other / Global', ar: 'أخرى / عالمي'         },
]

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
)
const XMARK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)

export default function PricingClient({ plans }) {
  const { t, lang } = useLang()
  const isAr = lang === 'ar'

  /* Build the list of countries that actually have plans */
  const availableCountries = useMemo(() => {
    const codes = [...new Set(plans.map(p => p.country).filter(Boolean))]
    return COUNTRIES.filter(c => codes.includes(c.code))
  }, [plans])

  const [selectedCountry, setSelectedCountry] = useState('')

  /* If no selection yet, pick the first available country on first render */
  const activeCountry = selectedCountry || (availableCountries[0]?.code ?? '')

  const filtered = useMemo(
    () => plans.filter(p => !p.country || p.country === activeCountry),
    [plans, activeCountry]
  )

  /* Sort: popular plans first */
  const sorted = useMemo(() => [...filtered].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0)), [filtered])

  return (
    <>
      <PageHero titleKey="pricingHeroTitle" subKey="pricingHeroSub" breadcrumbKey="pricingBreadCurrent" />

      <section className="pricing-section">
        <div className="container">

          {/* Section heading */}
          <div data-reveal>
            <span className="label">{t('pricingLabel')}</span>
            <h2 className="section-title section-title--center">{t('pricingTitle')}</h2>
          </div>

          {/* Country selector */}
          {availableCountries.length > 1 && (
            <div className="pricing-country-selector" data-reveal>
              <p className="pricing-country-label">
                {isAr ? 'اختر دولتك لعرض الخطط المناسبة لك:' : 'Select your country to see plans available for you:'}
              </p>
              <div className="pricing-country-dropdown">
                <CountrySelect
                  value={activeCountry}
                  onChange={setSelectedCountry}
                  countries={availableCountries}
                  isAr={isAr}
                  variant="public"
                />
              </div>
            </div>
          )}

          {/* Plans */}
          {sorted.length === 0 ? (
            <div className="pricing-empty" data-reveal>
              <p>{isAr ? 'لا توجد خطط متاحة لهذه الدولة حالياً.' : 'No plans are currently available for this country.'}</p>
            </div>
          ) : (
            <div
              className="pricing-grid"
              style={{
                gridTemplateColumns: `repeat(${Math.min(sorted.length, 3)}, 1fr)`,
                maxWidth: sorted.length === 1 ? 440 : sorted.length === 2 ? 820 : undefined,
                margin: sorted.length <= 2 ? '0 auto' : undefined,
              }}
              data-reveal
            >
              {sorted.map((plan, i) => {
                const nameText     = isAr && plan.nameAr     ? plan.nameAr     : plan.nameEn
                const descText     = isAr && plan.descAr     ? plan.descAr     : plan.descEn
                const durationText = isAr && plan.durationAr ? plan.durationAr : plan.durationEn
                const ctaText      = isAr && plan.ctaTextAr  ? plan.ctaTextAr  : (plan.ctaTextEn || 'Get Started')
                const badgeText    = isAr && plan.badgeAr    ? plan.badgeAr    : plan.badgeEn

                return (
                  <div
                    key={plan.id}
                    className={`pricing-card revealed${plan.popular ? ' pricing-card--popular' : ''}`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    {/* Badge */}
                    {badgeText && (
                      <div className="pricing-card__badge">{badgeText}</div>
                    )}

                    {/* Plan name */}
                    <h3 className="pricing-card__plan">{nameText}</h3>

                    {/* Price */}
                    <div className="pricing-card__price">
                      <span className="pricing-card__currency">{plan.currency}</span>
                      <span className="pricing-card__amount">{plan.price}</span>
                      {durationText && (
                        <span className="pricing-card__period">{durationText}</span>
                      )}
                    </div>

                    {/* Description */}
                    {descText && (
                      <p className="pricing-card__desc">{descText}</p>
                    )}

                    {/* Benefits */}
                    {plan.benefits && plan.benefits.length > 0 && (
                      <ul className="pricing-features">
                        {plan.benefits.map((b, fi) => {
                          const bText = isAr && b.textAr ? b.textAr : b.textEn
                          return (
                            <li key={b.id || fi} className={`pricing-feature${b.included ? '' : ' dim'}`}>
                              <span className="pricing-feature__icon">{b.included ? CHECK : XMARK}</span>
                              <span>{bText}</span>
                            </li>
                          )
                        })}
                      </ul>
                    )}

                    {/* CTA */}
                    <Link href={plan.ctaUrl || '/contact'} className="btn btn--primary pricing-cta">
                      {ctaText}
                    </Link>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </section>

    </>
  )
}
