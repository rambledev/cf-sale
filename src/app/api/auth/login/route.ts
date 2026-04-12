import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPin } from '@/lib/auth'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { phone, pin } = body

  if (!phone?.trim() || !pin) {
    return NextResponse.json({ error: 'กรุณาระบุเบอร์โทรและ PIN' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { phone: phone.trim() } })
  if (!user) {
    return NextResponse.json({ error: 'ไม่พบบัญชีนี้' }, { status: 401 })
  }

  const valid = await verifyPin(String(pin), user.pinHash)
  if (!valid) {
    return NextResponse.json({ error: 'PIN ไม่ถูกต้อง' }, { status: 401 })
  }

  const session = await getSession()
  session.userId = user.id
  session.workspaceId = user.workspaceId
  session.userName = user.name
  await session.save()

  return NextResponse.json({ ok: true, name: user.name })
}
