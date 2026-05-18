import { readData } from '@/lib/db'
import HomeClient from './HomeClient'

export default function HomePage() {
  const stats = readData('stats.json')
  const content = readData('content.json')
  return <HomeClient stats={stats} content={content} />
}
