export const dynamic = 'force-dynamic'
import { readContent } from '@/lib/db'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const stats = await readContent('stats') || {}
  const content = await readContent('content') || {}
  return <HomeClient stats={stats} content={content} />
}
