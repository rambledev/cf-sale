'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'แดชบอร์ด', exact: true },
  { href: '/products', label: 'สินค้า', exact: false },
  { href: '/comments', label: 'คอมเมนต์', exact: false },
  { href: '/admin/orders', label: 'ออเดอร์', exact: false },
  { href: '/admin/live', label: '🔗 ลิงก์ขาย', exact: false },
]

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

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
        </div>
      </div>
    </nav>
  )
}
