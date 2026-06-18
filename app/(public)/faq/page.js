export const dynamic = 'force-dynamic'
import { readContent } from '@/lib/db'
import FaqClient from './FaqClient'

export default async function FaqPage() {
  const faqs = await readContent('faq') || []
  return <FaqClient faqs={faqs} />
}
