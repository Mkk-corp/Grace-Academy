import { readContent } from '@/lib/db'
import BlogClient from './BlogClient'

export default async function BlogPage() {
  const allPosts = await readContent('blog') || []
  const posts = allPosts.filter(p => p.published)
  return <BlogClient posts={posts} />
}
