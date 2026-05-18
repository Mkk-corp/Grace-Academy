import { readData } from '@/lib/db'
import PricingClient from './PricingClient'

export default function PricingPage() {
  const plans = readData('pricing.json')
  return <PricingClient plans={plans} />
}
