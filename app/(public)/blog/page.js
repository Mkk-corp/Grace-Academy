import { readData } from '@/lib/db'
import BlogClient from './BlogClient'

export default function BlogPage() {
  const posts = readData('blog.json').filter(p => p.published)
  return <BlogClient posts={posts} />
}
