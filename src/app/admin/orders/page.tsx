'use client'

import { useEffect, useState, useCallback } from 'react'
import OrderModal from '@/components/OrderModal'

interface Product {
  code: string
  name: string
  price: number
}

interface OrderItem {
  quantity: number
  product: Product
}

interface LiveSession {
  slug: string
  title: string | null
}

interface Order {
  id: number
  customerName: string | null
  channel: string
  status: string
  createdAt: string
  items: OrderItem[]
  liveSession: LiveSession | null
}

const channelLabel: Record<string, string> = {
  COMMENT: '💬 Comment',
  CART: '🛒 Cart',
}

const statusLabel: Record<string, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterChannel, setFilterChannel] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterChannel !== 'all') params.set('channel', filterChannel)
    if (filterStatus !== 'all') params.set('status', filterStatus)

    fetch(`/api/orders?${params}`)
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [filterChannel, filterStatus])

  useEffect(load, [load])

  const handleConfirm = async (id: number) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    })
    load()
  }

  const totalSales = orders
    .filter((o) => o.status === 'confirmed')
    .reduce(
      (sum, o) =>
        sum + o.items.reduce((s, i) => s + i.product.price * i.quantity, 0),
      0
    )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ออเดอร์ทั้งหมด</h1>
        <p className="text-gray-500 text-sm mt-1">ออเดอร์จากทุกช่องทาง</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <select
          className="input w-auto"
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
        >
          <option value="all">ทุกช่องทาง</option>
          <option value="COMMENT">💬 Comment</option>
          <option value="CART">🛒 Cart</option>
        </select>
        <select
          className="input w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">ทุกสถานะ</option>
          <option value="pending">รอยืนยัน</option>
          <option value="confirmed">ยืนยันแล้ว</option>
        </select>
        <button onClick={load} className="btn-outline px-4">
          🔄 รีเฟรช
        </button>
        {filterStatus === 'confirmed' && (
          <span className="ml-auto text-sm font-semibold text-brand-700">
            ยอดรวม: {totalSales.toLocaleString('th-TH')} ฿
          </span>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            รายการออเดอร์{' '}
            <span className="text-gray-400 font-normal text-base">({orders.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">กำลังโหลด...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">ไม่พบออเดอร์</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">ลูกค้า</th>
                  <th className="px-4 py-3 text-left">ช่องทาง</th>
                  <th className="px-4 py-3 text-left">Live Link</th>
                  <th className="px-4 py-3 text-left">สินค้า</th>
                  <th className="px-4 py-3 text-right">ยอด</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                  <th className="px-4 py-3 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const total = order.items.reduce(
                    (s, i) => s + i.product.price * i.quantity,
                    0
                  )
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors cursor-pointer ${
                        order.status === 'confirmed'
                          ? 'hover:bg-green-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono">#{order.id}</td>
                      <td className="px-4 py-3 font-medium">
                        {order.customerName || (
                          <span className="text-gray-400 italic">ไม่ระบุ</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {channelLabel[order.channel] ?? order.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.liveSession ? (
                          <a
                            href={`/live/${order.liveSession.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 font-mono text-xs hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            /{order.liveSession.slug}
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {order.items
                          .map((i) => `${i.product.name} x${i.quantity}`)
                          .join(', ')}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {total.toLocaleString('th-TH')} ฿
                      </td>
                      <td className="px-4 py-3 text-center">
                        {order.status === 'confirmed' ? (
                          <span className="badge-confirmed">✓ ยืนยันแล้ว</span>
                        ) : (
                          <span className="badge-pending">
                            {statusLabel[order.status] ?? order.status}
                          </span>
                        )}
                      </td>
                      <td
                        className="px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleConfirm(order.id)}
                            className="btn-green text-xs px-3 py-1.5"
                          >
                            ยืนยัน
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <span className="text-xs text-gray-400">คลิกดูสรุป</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  )
}
