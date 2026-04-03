'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLive = pathname.startsWith('/live/')

  if (isLive) {
    // Customer-facing: no admin navbar, orange theme, full-width
    return <div className="min-h-screen bg-orange-50">{children}</div>
  }

  // Admin/Seller: white + yellow theme with navbar
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
