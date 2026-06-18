export const dynamic = 'force-dynamic'
import { readContent } from '@/lib/db'
import PortfolioClient from './PortfolioClient'

export default async function PortfolioPage() {
  const projects = await readContent('portfolio') || []
  const stats = await readContent('stats') || {}
  return <PortfolioClient projects={projects} stats={stats} />
}
