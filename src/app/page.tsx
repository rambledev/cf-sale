'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalOrders: number
  confirmedOrders: number
  pendingOrders: number
  totalSales: number
  totalProducts: number
  totalStock: number
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}) {
  return (
    <div className={`card ${accent ? 'border-brand-300 bg-brand-50' : ''}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ? 'text-brand-700' : 'text-gray-800'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-500 text-sm mt-1">ภาพรวมออเดอร์และยอดขาย</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-100" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="ยอดขาย (บาท)"
            value={stats.totalSales.toLocaleString('th-TH')}
            sub="จากออเดอร์ที่ยืนยันแล้ว"
            accent
          />
          <StatCard label="ออเดอร์ทั้งหมด" value={stats.totalOrders} />
          <StatCard label="ยืนยันแล้ว" value={stats.confirmedOrders} />
          <StatCard label="รอยืนยัน" value={stats.pendingOrders} />
          <StatCard label="สินค้าทั้งหมด" value={stats.totalProducts} />
          <StatCard label="สต็อกรวม" value={stats.totalStock} sub="ชิ้น" />
        </div>
      ) : (
        <p className="text-red-500">โหลดข้อมูลไม่ได้</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/comments"
          className="card flex flex-col items-center justify-center py-8 border-2 border-dashed border-brand-300 hover:border-brand-500 hover:bg-brand-50 transition-colors cursor-pointer group"
        >
          <span className="text-4xl mb-3">📋</span>
          <span className="text-base font-semibold text-brand-700 group-hover:text-brand-800">
            วางคอมเมนต์
          </span>
          <span className="text-xs text-gray-400 mt-1">ประมวลผลออเดอร์จาก Live</span>
        </Link>

        <Link
          href="/admin/live"
          className="card flex flex-col items-center justify-center py-8 border-2 border-dashed border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer group"
        >
          <span className="text-4xl mb-3">🔗</span>
          <span className="text-base font-semibold text-orange-600 group-hover:text-orange-700">
            ลิงก์ขาย Live
          </span>
          <span className="text-xs text-gray-400 mt-1">ส่งลิงก์ให้ลูกค้าสั่ง</span>
        </Link>

        <Link
          href="/products"
          className="card flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer group"
        >
          <span className="text-4xl mb-3">📦</span>
          <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">
            จัดการสินค้า
          </span>
          <span className="text-xs text-gray-400 mt-1">เพิ่ม / แก้ไข / สต็อก</span>
        </Link>
      </div>
    </div>
  )
}
