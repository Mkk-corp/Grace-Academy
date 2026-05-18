import { readData } from '@/lib/db'
import ServicesClient from './ServicesClient'

export default function ServicesPage() {
  const services = readData('services.json')
  const stats = readData('stats.json')
  return <ServicesClient services={services} stats={stats} />
}
