import { readData } from '@/lib/db'
import PortfolioClient from './PortfolioClient'

export default function PortfolioPage() {
  const projects = readData('portfolio.json')
  const stats = readData('stats.json')
  return <PortfolioClient projects={projects} stats={stats} />
}
