import ComingSoon from '@/components/ui/ComingSoon'

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
)

export const metadata = { title: 'Certificates — Grace Academy' }

export default function CertificatesPage() {
  return <ComingSoon titleKey="wipCertsTitle" bodyKey="wipCertsBody" icon={icon} />
}
