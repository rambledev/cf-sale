import type { Metadata } from 'next'
import './globals.css'
import LayoutShell from '@/components/LayoutShell'

export const metadata: Metadata = {
  title: 'CF Sale — ระบบจัดการ Live Comment',
  description: 'ระบบช่วยขาย CF สำหรับ Live Commerce',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
