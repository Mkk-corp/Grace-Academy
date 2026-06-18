import { readContent } from '@/lib/db'
import AboutClient from './AboutClient'

export default async function AboutPage() {
  const stats = await readContent('stats') || {}
  return <AboutClient stats={stats} />
}
