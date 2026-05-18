import { readData } from '@/lib/db'
import { notFound } from 'next/navigation'
import PostClient from './PostClient'

export async function generateStaticParams() {
  const posts = readData('blog.json')
  return posts.filter(p => p.published).map(p => ({ slug: p.slug }))
}

export default function BlogPostPage({ params }) {
  const posts = readData('blog.json')
  const post = posts.find(p => p.slug === params.slug && p.published)
  if (!post) notFound()
  return <PostClient post={post} />
}
