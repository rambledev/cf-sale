'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

const AUTH_PATHS = ['/login', '/register']

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (AUTH_PATHS.includes(pathname)) {
    return <>{children}</>
  }

  if (pathname.startsWith('/live/')) {
    return <div className="min-h-screen bg-orange-50">{children}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
