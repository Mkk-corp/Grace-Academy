import ComingSoon from '@/components/ui/ComingSoon'

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18"/>
    <path d="M9 21V9"/>
  </svg>
)

export const metadata = { title: 'Student Portal — Grace Academy' }

export default function PortalPage() {
  return <ComingSoon titleKey="wipPortalTitle" bodyKey="wipPortalBody" icon={icon} />
}
