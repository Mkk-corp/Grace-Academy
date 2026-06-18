export const dynamic = 'force-dynamic'
import { readContent } from '@/lib/db'
import ServicesClient from './ServicesClient'

export default async function ServicesPage() {
  const services = await readContent('services') || []
  const stats = await readContent('stats') || {}
  return <ServicesClient services={services} stats={stats} />
}
