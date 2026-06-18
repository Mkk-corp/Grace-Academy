import { readContent } from '@/lib/db'
import { notFound } from 'next/navigation'
import PostClient from './PostClient'

export async function generateStaticParams() {
  try {
    const posts = await readContent('blog') || []
    return posts.filter(p => p.published).map(p => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export default async function BlogPostPage({ params }) {
  const posts = await readContent('blog') || []
  const post = posts.find(p => p.slug === params.slug && p.published)
  if (!post) notFound()
  return <PostClient post={post} />
}
