'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const links = [
  { href: '/', label: 'แดชบอร์ด', exact: true },
  { href: '/products', label: 'สินค้า', exact: false },
  { href: '/comments', label: 'คอมเมนต์', exact: false },
  { href: '/admin/orders', label: 'ออเดอร์', exact: false },
  { href: '/admin/live', label: '🔗 ลิงก์ขาย', exact: false },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => d.userName && setUserName(d.userName))
      .catch(() => {})
  }, [])

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl font-bold text-brand-600">CF Sale</span>
          </Link>

          <div className="flex items-center gap-0.5 overflow-x-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(link.href, link.exact)
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {userName && (
              <span className="text-sm text-gray-500 hidden sm:block">{userName}</span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
