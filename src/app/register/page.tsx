'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (pin.length < 4) {
      setError('PIN ต้องมีอย่างน้อย 4 หลัก')
      return
    }
    if (pin !== pinConfirm) {
      setError('PIN ไม่ตรงกัน')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, pin }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'เกิดข้อผิดพลาด')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">CF Sale</h1>
          <p className="text-gray-500 mt-1 text-sm">เริ่มต้นใช้งานฟรี</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">สมัครสมาชิก</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">ชื่อร้านค้า</label>
              <input
                type="text"
                className="input"
                placeholder="ร้านของฉัน"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                className="input"
                placeholder="0812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">PIN (อย่างน้อย 4 หลัก)</label>
              <input
                type="password"
                className="input"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                inputMode="numeric"
                maxLength={8}
              />
            </div>

            <div>
              <label className="label">ยืนยัน PIN</label>
              <input
                type="password"
                className="input"
                placeholder="••••"
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value)}
                required
                inputMode="numeric"
                maxLength={8}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
