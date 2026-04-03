'use client'

import { useEffect, useState } from 'react'

interface Product {
  id: number
  code: string
  name: string
  price: number
  stock: number
}

const emptyForm = { code: '', name: '', price: '', stock: '' }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editStock, setEditStock] = useState<{ id: number; value: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'เกิดข้อผิดพลาด')
    } else {
      setForm(emptyForm)
      load()
    }
    setSubmitting(false)
  }

  const handleUpdateStock = async (id: number, stock: number) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    })
    setEditStock(null)
    load()
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ลบสินค้า "${name}" ออกจากระบบ?`)) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">สินค้า</h1>
        <p className="text-gray-500 text-sm mt-1">จัดการสินค้าและสต็อก</p>
      </div>

      {/* Add Product Form */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">เพิ่มสินค้าใหม่</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="label">รหัสสินค้า *</label>
            <input
              className="input uppercase"
              placeholder="A01"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">ชื่อสินค้า *</label>
            <input
              className="input"
              placeholder="เสื้อดำ"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">ราคา (บาท) *</label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder="100"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">สต็อก *</label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder="10"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
          </div>
          {error && <p className="col-span-full text-sm text-red-600">{error}</p>}
          <div className="col-span-full">
            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={submitting}>
              {submitting ? 'กำลังบันทึก...' : '+ เพิ่มสินค้า'}
            </button>
          </div>
        </form>
      </div>

      {/* Product Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">รายการสินค้า ({products.length})</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-400">กำลังโหลด...</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-gray-400">ยังไม่มีสินค้า</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">รหัส</th>
                  <th className="px-4 py-3 text-left">ชื่อสินค้า</th>
                  <th className="px-4 py-3 text-right">ราคา</th>
                  <th className="px-4 py-3 text-right">สต็อก</th>
                  <th className="px-4 py-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-brand-700">{p.code}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-right">{p.price.toLocaleString('th-TH')} ฿</td>
                    <td className="px-4 py-3 text-right">
                      {editStock?.id === p.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="0"
                            className="input w-20 text-right py-1"
                            value={editStock.value}
                            onChange={(e) =>
                              setEditStock({ id: p.id, value: e.target.value })
                            }
                          />
                          <button
                            onClick={() =>
                              handleUpdateStock(p.id, Number(editStock.value))
                            }
                            className="btn-green text-xs px-2 py-1"
                          >
                            บันทึก
                          </button>
                          <button
                            onClick={() => setEditStock(null)}
                            className="btn-outline text-xs px-2 py-1"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setEditStock({ id: p.id, value: String(p.stock) })
                          }
                          className={`font-semibold ${
                            p.stock === 0 ? 'text-red-500' : p.stock <= 2 ? 'text-orange-500' : 'text-gray-800'
                          } hover:underline`}
                        >
                          {p.stock}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
