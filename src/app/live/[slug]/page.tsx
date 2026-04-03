'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface Product {
  id: number
  code: string
  name: string
  price: number
  stock: number
}

interface LiveSession {
  id: number
  slug: string
  title: string | null
  isActive: boolean
}

interface OrderItem {
  quantity: number
  product: Product
}

interface ConfirmedOrder {
  id: number
  customerName: string
  items: OrderItem[]
}

type PageState = 'loading' | 'closed' | 'notfound' | 'cart' | 'submitting' | 'done' | 'error'

export default function LiveCartPage() {
  const { slug } = useParams<{ slug: string }>()

  const [state, setState] = useState<PageState>('loading')
  const [session, setSession] = useState<LiveSession | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [customerName, setCustomerName] = useState('')
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const load = useCallback(async () => {
    setState('loading')
    const res = await fetch(`/api/live/${slug}`)
    if (res.status === 404) {
      setState('notfound')
      return
    }
    const data = await res.json()
    setSession(data.session)
    setProducts(data.products)
    if (!data.session.isActive) {
      setState('closed')
    } else {
      setState('cart')
    }
  }, [slug])

  useEffect(() => { load() }, [load])

  const setQty = (productId: number, delta: number, max: number) => {
    setQuantities((prev) => {
      const current = prev[productId] ?? 0
      const next = Math.max(0, Math.min(max, current + delta))
      return { ...prev, [productId]: next }
    })
  }

  const cartItems = products
    .map((p) => ({ product: p, quantity: quantities[p.id] ?? 0 }))
    .filter((i) => i.quantity > 0)

  const total = cartItems.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0
  )

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setErrorMsg('กรุณาระบุชื่อของคุณ')
      return
    }
    if (cartItems.length === 0) {
      setErrorMsg('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ')
      return
    }
    setErrorMsg('')
    setState('submitting')

    const res = await fetch(`/api/live/${slug}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: customerName.trim(),
        items: cartItems.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setErrorMsg(data.error || 'เกิดข้อผิดพลาด')
      setState('cart')
    } else {
      setConfirmedOrder(data)
      setState('done')
    }
  }

  // ---- Render States ----

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-4 animate-pulse">🛒</div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (state === 'notfound') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-gray-700">ไม่พบลิงก์นี้</h1>
          <p className="text-gray-400 mt-2">ลิงก์ที่คุณใช้ไม่มีในระบบ</p>
        </div>
      </div>
    )
  }

  if (state === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-700">ปิดรับออเดอร์แล้ว</h1>
          <p className="text-gray-400 mt-2">
            {session?.title || 'Live นี้'} ปิดรับออเดอร์แล้ว
          </p>
          <p className="text-gray-400 text-sm mt-1">กรุณาติดต่อผู้ขาย</p>
        </div>
      </div>
    )
  }

  if (state === 'done' && confirmedOrder) {
    const orderTotal = confirmedOrder.items.reduce(
      (s, i) => s + i.product.price * i.quantity,
      0
    )
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900">สั่งเรียบร้อย!</h1>
            <p className="text-gray-500 mt-1 text-sm">ออเดอร์ #{confirmedOrder.id}</p>

            <div className="mt-6 text-left bg-orange-50 rounded-2xl p-4 space-y-2">
              <p className="font-semibold text-orange-800">คุณ {confirmedOrder.customerName}</p>
              {confirmedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-700">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {(item.product.price * item.quantity).toLocaleString('th-TH')} ฿
                  </span>
                </div>
              ))}
              <div className="border-t border-orange-200 pt-2 flex justify-between font-bold text-orange-700">
                <span>รวม</span>
                <span>{orderTotal.toLocaleString('th-TH')} บาท</span>
              </div>
            </div>

            <p className="text-gray-400 text-sm mt-4">
              ขอบคุณที่สั่งซื้อ 🙏 รอผู้ขายยืนยันออเดอร์
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ---- Main Cart UI ----

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-5 sticky top-0 z-30 shadow-md">
        <div className="max-w-lg mx-auto">
          <p className="text-orange-200 text-xs uppercase tracking-wide font-medium">
            Live Shopping
          </p>
          <h1 className="text-xl font-bold truncate">
            {session?.title || 'เลือกสินค้า'}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-40">
        {/* Name input */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ชื่อของคุณ <span className="text-red-400">*</span>
          </label>
          <input
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            placeholder="เช่น โบ, แดง, นิด..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        {/* Product list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">
            เลือกสินค้า
          </h2>
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
              ไม่มีสินค้าในขณะนี้
            </div>
          ) : (
            products.map((product) => {
              const qty = quantities[product.id] ?? 0
              const subtotal = product.price * qty
              const isMaxed = qty >= product.stock

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl shadow-sm p-4 transition-all ${
                    qty > 0 ? 'ring-2 ring-orange-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                          {product.code}
                        </span>
                        {product.stock <= 3 && (
                          <span className="text-xs text-red-500 font-medium">
                            เหลือ {product.stock}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 mt-1 truncate">{product.name}</p>
                      <p className="text-orange-600 font-bold text-lg">
                        {product.price.toLocaleString('th-TH')} ฿
                      </p>
                    </div>

                    {/* Quantity stepper */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => setQty(product.id, -1, product.stock)}
                        disabled={qty === 0}
                        className="w-10 h-10 rounded-full border-2 border-gray-200 text-xl font-bold text-gray-600 flex items-center justify-center disabled:opacity-30 active:bg-gray-100 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xl font-bold text-gray-900">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(product.id, +1, product.stock)}
                        disabled={isMaxed}
                        className="w-10 h-10 rounded-full bg-orange-500 text-white text-xl font-bold flex items-center justify-center disabled:opacity-30 active:bg-orange-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {qty > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                      <span className="text-gray-500">รวม {qty} ชิ้น</span>
                      <span className="font-semibold text-orange-600">
                        = {subtotal.toLocaleString('th-TH')} ฿
                      </span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl px-4 py-4 z-40">
        <div className="max-w-lg mx-auto space-y-3">
          {errorMsg && (
            <p className="text-red-500 text-sm text-center font-medium">{errorMsg}</p>
          )}

          {cartItems.length > 0 && (
            <div className="flex justify-between text-sm text-gray-600 px-1">
              <span>{cartItems.length} รายการ</span>
              <span className="font-bold text-gray-900 text-base">
                รวม {total.toLocaleString('th-TH')} ฿
              </span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={state === 'submitting' || cartItems.length === 0}
            className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: cartItems.length > 0
                ? 'linear-gradient(135deg, #f97316, #ea580c)'
                : '#d1d5db',
            }}
          >
            {state === 'submitting' ? (
              <span className="animate-pulse">กำลังสั่ง...</span>
            ) : cartItems.length === 0 ? (
              'เลือกสินค้าก่อน'
            ) : (
              `ยืนยันออเดอร์ — ${total.toLocaleString('th-TH')} ฿`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
