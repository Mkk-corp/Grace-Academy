export const dynamic = 'force-dynamic'
import { readContent } from '@/lib/db'
import PricingClient from './PricingClient'

export default async function PricingPage() {
  const plans = await readContent('pricing') || []
  return <PricingClient plans={plans} />
}
