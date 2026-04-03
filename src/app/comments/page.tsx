'use client'

import { useEffect, useState, useCallback } from 'react'
import { parseComments, ParsedLine } from '@/lib/parser'
import OrderModal from '@/components/OrderModal'

interface Product {
  id: number
  code: string
  name: string
  price: number
  stock: number
}

interface OrderItem {
  quantity: number
  product: Product
}

interface Order {
  id: number
  customerName: string
  status: string
  items: OrderItem[]
}

type RowStatus = 'pending' | 'confirming' | 'confirmed' | 'error'

interface Row extends ParsedLine {
  rowStatus: RowStatus
  errorMessage?: string
  order?: Order
  product?: Product
}

const EXAMPLE = `โบ A01 2\nแดง A01 1\nนิด B02 3`

export default function CommentsPage() {
  const [text, setText] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [processed, setProcessed] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
  }, [])

  const productMap = Object.fromEntries(products.map((p) => [p.code, p]))

  const handleProcess = () => {
    const parsed = parseComments(text)

    const newRows: Row[] = parsed.map((line) => {
      const product = productMap[line.productCode]
      if (!product) {
        return {
          ...line,
          rowStatus: 'error',
          errorMessage: `ไม่พบสินค้า ${line.productCode}`,
        }
      }
      return { ...line, rowStatus: 'pending', product }
    })

    setRows(newRows)
    setProcessed(true)
  }

  const handleConfirm = useCallback(
    async (index: number) => {
      const row = rows[index]
      if (row.rowStatus !== 'pending') return

      setRows((prev) =>
        prev.map((r, i) => (i === index ? { ...r, rowStatus: 'confirming' } : r))
      )

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: row.customerName,
          productCode: row.productCode,
          quantity: row.quantity,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setRows((prev) =>
          prev.map((r, i) =>
            i === index
              ? { ...r, rowStatus: 'error', errorMessage: data.error }
              : r
          )
        )
      } else {
        setRows((prev) =>
          prev.map((r, i) =>
            i === index ? { ...r, rowStatus: 'confirmed', order: data } : r
          )
        )
        // Refresh products to show updated stock
        fetch('/api/products')
          .then((r) => r.json())
          .then(setProducts)
      }
    },
    [rows]
  )

  const handleConfirmAll = async () => {
    const pendingIndexes = rows
      .map((r, i) => (r.rowStatus === 'pending' ? i : -1))
      .filter((i) => i !== -1)

    for (const i of pendingIndexes) {
      await handleConfirm(i)
    }
  }

  const pendingCount = rows.filter((r) => r.rowStatus === 'pending').length
  const confirmedCount = rows.filter((r) => r.rowStatus === 'confirmed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">คอมเมนต์ Live</h1>
        <p className="text-gray-500 text-sm mt-1">วางคอมเมนต์จาก Live แล้วประมวลผลออเดอร์</p>
      </div>

      {/* Input */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <label className="label mb-0">วางคอมเมนต์ที่นี่</label>
          <button
            onClick={() => setText(EXAMPLE)}
            className="text-xs text-brand-600 hover:underline"
          >
            ใช้ตัวอย่าง
          </button>
        </div>
        <textarea
          className="input font-mono h-40 resize-y"
          placeholder={`โบ A01 2\nแดง A01 1\nนิด B02 3`}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setProcessed(false)
          }}
        />
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleProcess}
            disabled={!text.trim()}
            className="btn-primary px-6 py-2.5"
          >
            ⚡ ประมวลผลคอมเมนต์
          </button>
          {processed && (
            <button
              onClick={() => {
                setText('')
                setRows([])
                setProcessed(false)
              }}
              className="btn-outline px-4 py-2.5"
            >
              เคลียร์
            </button>
          )}
        </div>
        <div className="text-xs text-gray-400">
          รองรับ: <code>A01 2</code> · <code>A01 x2</code> · <code>ชื่อ A01 2</code>
        </div>
      </div>

      {/* Results Table */}
      {rows.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">ผลลัพธ์ ({rows.length} รายการ)</h2>
              {confirmedCount > 0 && (
                <span className="badge-confirmed">{confirmedCount} ยืนยันแล้ว</span>
              )}
              {pendingCount > 0 && (
                <span className="badge-pending">{pendingCount} รอยืนยัน</span>
              )}
            </div>
            {pendingCount > 0 && (
              <button onClick={handleConfirmAll} className="btn-primary text-sm">
                ✅ ยืนยันทั้งหมด ({pendingCount})
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">ชื่อลูกค้า</th>
                  <th className="px-4 py-3 text-left">รหัสสินค้า</th>
                  <th className="px-4 py-3 text-left">ชื่อสินค้า</th>
                  <th className="px-4 py-3 text-right">จำนวน</th>
                  <th className="px-4 py-3 text-right">ราคา</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                  <th className="px-4 py-3 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, i) => {
                  const product = row.product || productMap[row.productCode]
                  const subtotal = product ? product.price * row.quantity : 0

                  return (
                    <tr
                      key={i}
                      className={`transition-colors ${
                        row.rowStatus === 'confirmed'
                          ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                          : row.rowStatus === 'error'
                          ? 'bg-red-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (row.rowStatus === 'confirmed' && row.order) {
                          setSelectedOrder(row.order)
                        }
                      }}
                    >
                      <td className="px-4 py-3 font-medium">
                        {row.customerName || (
                          <span className="text-gray-400 italic">ไม่ระบุ</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-brand-700">
                        {row.productCode}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product ? product.name : (
                          <span className="text-red-400">ไม่พบสินค้า</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">{row.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {product ? (
                          `${subtotal.toLocaleString('th-TH')} ฿`
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.rowStatus === 'pending' && (
                          <span className="badge-pending">รอยืนยัน</span>
                        )}
                        {row.rowStatus === 'confirming' && (
                          <span className="badge-pending animate-pulse">กำลังบันทึก...</span>
                        )}
                        {row.rowStatus === 'confirmed' && (
                          <span className="badge-confirmed">✓ ยืนยันแล้ว</span>
                        )}
                        {row.rowStatus === 'error' && (
                          <span className="badge-error" title={row.errorMessage}>
                            ❌ ผิดพลาด
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.rowStatus === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleConfirm(i)
                            }}
                            className="btn-green text-xs px-3 py-1.5"
                          >
                            ยืนยัน
                          </button>
                        )}
                        {row.rowStatus === 'confirmed' && (
                          <span className="text-xs text-gray-400">คลิกดูสรุป</span>
                        )}
                        {row.rowStatus === 'error' && (
                          <span className="text-xs text-red-500">{row.errorMessage}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {confirmedCount > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
              คลิกแถวที่ยืนยันแล้วเพื่อดูสรุปและคัดลอกข้อความส่งลูกค้า
            </div>
          )}
        </div>
      )}

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  )
}
