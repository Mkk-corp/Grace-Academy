import { readData } from '@/lib/db'
import FaqClient from './FaqClient'

export default function FaqPage() {
  const faqs = readData('faq.json')
  return <FaqClient faqs={faqs} />
}
