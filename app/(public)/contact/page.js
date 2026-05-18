import { readData } from '@/lib/db'
import ContactClient from './ContactClient'

export default function ContactPage() {
  const content = readData('content.json')
  return <ContactClient content={content} />
}
