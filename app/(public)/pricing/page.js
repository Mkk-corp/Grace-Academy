export const dynamic = 'force-dynamic'
import { readContent } from '@/lib/db'
import PricingClient from './PricingClient'

export default async function PricingPage() {
  const all   = await readContent('pricing') || []
  const plans = all.filter(p => p.visible !== false)
  return <PricingClient plans={plans} />
}
