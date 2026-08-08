'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ScrollProgress from '@/components/layout/ScrollProgress'

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/portal', '/profile', '/unauthorized', '/assessor', '/teacher', '/notifications']

export default function PublicLayout({ children }) {
  const pathname = usePathname()

  if (AUTH_PATHS.includes(pathname)) {
    return <div className="platform-shell">{children}</div>
  }

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
