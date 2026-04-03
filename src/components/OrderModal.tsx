'use client'

import { useEffect, useRef } from 'react'

interface Product {
  code: string
  name: string
  price: number
}

interface OrderItem {
  quantity: number
  product: Product
}

interface Order {
  id: number
  customerName: string | null
  status: string
  items: OrderItem[]
}

interface Props {
  order: Order | null
  onClose: () => void
}

function buildMessage(order: Order): string {
  const lines: string[] = [`คุณ ${order.customerName ?? 'ไม่ระบุชื่อ'}`]
  let total = 0

  for (const item of order.items) {
    const subtotal = item.product.price * item.quantity
    total += subtotal
    lines.push(`${item.product.name} x${item.quantity} = ${subtotal.toLocaleString('th-TH')} บาท`)
  }

  lines.push(`รวม ${total.toLocaleString('th-TH')} บาท`)
  return lines.join('\n')
}

export default function OrderModal({ order, onClose }: Props) {
  const copied = useRef(false)

  useEffect(() => {
    copied.current = false
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [order, onClose])

  if (!order) return null

  const message = buildMessage(order)
  const total = order.items.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(message).then(() => {
      alert('คัดลอกแล้ว!')
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold">สรุปออเดอร์</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">ลูกค้า</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {order.customerName || 'ไม่ระบุชื่อ'}
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items.map((item, i) => (
              <div key={i} className="py-2 flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.product.name}{' '}
                  <span className="text-gray-400 font-mono">({item.product.code})</span>
                  {' '}× {item.quantity}
                </span>
                <span className="font-semibold">
                  {(item.product.price * item.quantity).toLocaleString('th-TH')} ฿
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200">
            <span>รวมทั้งหมด</span>
            <span className="text-brand-600">{total.toLocaleString('th-TH')} บาท</span>
          </div>

          {/* Message preview */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">ข้อความที่จะส่ง</p>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">{message}</pre>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button onClick={handleCopy} className="btn-primary flex-1 py-3 text-base">
            📋 คัดลอกข้อความ
          </button>
          <button onClick={onClose} className="btn-outline px-5 py-3">
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}
