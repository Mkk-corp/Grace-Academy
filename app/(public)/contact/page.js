import { readContent } from '@/lib/db'
import ContactClient from './ContactClient'

export default async function ContactPage() {
  const content = await readContent('content') || {}
  return <ContactClient content={content} />
}
