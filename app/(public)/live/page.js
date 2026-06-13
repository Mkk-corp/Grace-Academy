import ComingSoon from '@/components/ui/ComingSoon'

const icon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.914L15 14"/>
    <rect x="2" y="7" width="13" height="10" rx="2"/>
  </svg>
)

export const metadata = { title: 'Live Sessions — Grace Academy' }

export default function LivePage() {
  return <ComingSoon titleKey="wipLiveTitle" bodyKey="wipLiveBody" icon={icon} />
}
