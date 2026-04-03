'use client'

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/Toast'

interface LiveSession {
  id: number
  slug: string
  title: string | null
  isActive: boolean
  createdAt: string
  _count: { orders: number }
}

export default function AdminLivePage() {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [titleInput, setTitleInput] = useState('')
  const [origin, setOrigin] = useState('')
  const { show: showToast, node: toastNode } = useToast()

  // Get current origin client-side (works on any domain)
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setDbError(false)
    try {
      const res = await fetch('/api/live-sessions')
      if (!res.ok) {
        setDbError(true)
        return
      }
      const data = await res.json()
      setSessions(Array.isArray(data) ? data : [])
    } catch {
      setDbError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    setCreateError('')
    setCreating(true)
    try {
      const res = await fetch('/api/live-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleInput.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error || `เกิดข้อผิดพลาด (${res.status})`)
        return
      }
      setTitleInput('')
      load()
      showToast('สร้างลิงก์ขายใหม่แล้ว')
    } catch {
      setCreateError('เชื่อมต่อ server ไม่ได้')
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (session: LiveSession) => {
    const res = await fetch(`/api/live-sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !session.isActive }),
    })
    if (res.ok) {
      load()
      showToast(session.isActive ? 'ปิดรับออเดอร์แล้ว' : 'เปิดรับออเดอร์แล้ว')
    }
  }

  const handleDelete = async (session: LiveSession) => {
    if (!confirm(`ลบลิงก์ "/${session.slug}" ?\nออเดอร์ที่ผูกอยู่จะถูกยกเลิกการผูกด้วย`)) return
    const res = await fetch(`/api/live-sessions/${session.id}`, { method: 'DELETE' })
    if (res.ok) {
      load()
      showToast('ลบลิงก์แล้ว', 'error')
    }
  }

  const copyLink = (slug: string) => {
    const url = `${origin}/live/${slug}`
    navigator.clipboard.writeText(url).then(() => showToast('คัดลอกลิงก์แล้ว!'))
  }

  return (
    <div className="space-y-6">
      {toastNode}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">ลิงก์ขาย Live</h1>
        <p className="text-gray-500 text-sm mt-1">สร้างลิงก์แล้วส่งให้ลูกค้าเปิดสั่งสินค้า</p>
      </div>

      {/* DB Error Banner */}
      {dbError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">⚠️ เชื่อมต่อฐานข้อมูลไม่ได้ หรือยังไม่ได้ migrate</p>
          <p className="text-red-600 font-mono text-xs mt-2">npx prisma db push</p>
          <p className="text-red-500 text-xs mt-1">รันคำสั่งด้านบน แล้ว refresh หน้าใหม่</p>
        </div>
      )}

      {/* Create Form */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">สร้างลิงก์ขายใหม่</h2>
        <div className="flex gap-3 flex-wrap">
          <input
            className="input flex-1 min-w-48"
            placeholder="ชื่อไลฟ์ (ไม่บังคับ) เช่น ไลฟ์วันเสาร์"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            disabled={creating}
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="btn-primary px-6 py-2"
          >
            {creating ? 'กำลังสร้าง...' : '+ สร้างลิงก์ขาย'}
          </button>
        </div>
        {createError && (
          <p className="mt-2 text-sm text-red-600 font-medium">❌ {createError}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          ระบบสร้าง URL สุ่มให้อัตโนมัติ เช่น <code className="bg-gray-100 px-1 rounded">/live/abc123</code>
        </p>
      </div>

      {/* Sessions List */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            ลิงก์ทั้งหมด
            {!loading && !dbError && (
              <span className="text-gray-400 font-normal text-base ml-2">
                ({sessions.length})
              </span>
            )}
          </h2>
          <button
            onClick={load}
            disabled={loading}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {loading ? 'กำลังโหลด...' : '🔄 รีเฟรช'}
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">กำลังโหลด...</div>
        ) : dbError ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            ไม่สามารถโหลดข้อมูลได้
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-5xl mb-3">🔗</p>
            <p className="font-medium">ยังไม่มีลิงก์ขาย</p>
            <p className="text-sm mt-1">กดปุ่ม "สร้างลิงก์ขาย" ด้านบน</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((s) => {
              const fullUrl = `${origin}/live/${s.slug}`
              return (
                <div
                  key={s.id}
                  className={`px-6 py-5 ${s.isActive ? 'bg-white' : 'bg-gray-50 opacity-75'}`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 inline-block ${
                            s.isActive ? 'bg-green-400' : 'bg-gray-300'
                          }`}
                        />
                        <span className="font-semibold text-gray-900">
                          {s.title || `Live #${s.id}`}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            s.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {s.isActive ? '● เปิดรับออเดอร์' : '○ ปิดแล้ว'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {s._count.orders} ออเดอร์
                        </span>
                      </div>

                      {/* URL Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-lg font-mono truncate max-w-xs">
                          {fullUrl || `/live/${s.slug}`}
                        </span>
                        <button
                          onClick={() => copyLink(s.slug)}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-medium transition-colors"
                        >
                          📋 คัดลอก
                        </button>
                        <a
                          href={`/live/${s.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:underline"
                        >
                          เปิดหน้าลูกค้า ↗
                        </a>
                      </div>

                      <p className="text-xs text-gray-400">
                        สร้างเมื่อ{' '}
                        {new Date(s.createdAt).toLocaleString('th-TH', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(s)}
                        className={`text-sm px-4 py-2 rounded-lg font-medium border transition-colors ${
                          s.isActive
                            ? 'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100'
                            : 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100'
                        }`}
                      >
                        {s.isActive ? 'ปิดรับ' : 'เปิดรับ'}
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="text-sm text-red-400 hover:text-red-600 px-2"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* How to use */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
        <h3 className="font-semibold text-brand-800 mb-3">วิธีใช้งาน</h3>
        <ol className="text-sm text-brand-700 space-y-1.5 list-decimal list-inside">
          <li>กด <strong>"สร้างลิงก์ขาย"</strong> เพื่อรับลิงก์ใหม่</li>
          <li>กด <strong>"คัดลอก"</strong> แล้วส่งลิงก์ให้ลูกค้าผ่าน Chat หรือ Comment</li>
          <li>ลูกค้าเปิดลิงก์ → เลือกสินค้า → กดยืนยัน</li>
          <li>
            ออเดอร์โผล่ใน{' '}
            <a href="/admin/orders" className="underline font-medium">
              หน้าออเดอร์
            </a>{' '}
            ทันที
          </li>
          <li>กด <strong>"ปิดรับ"</strong> เมื่อต้องการหยุดรับออเดอร์</li>
        </ol>
      </div>
    </div>
  )
}
