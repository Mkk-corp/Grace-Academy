import { readData } from '@/lib/db'
import AboutClient from './AboutClient'

export default function AboutPage() {
  const stats = readData('stats.json')
  return <AboutClient stats={stats} />
}
