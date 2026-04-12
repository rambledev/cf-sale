import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPin } from '@/lib/auth'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { name, phone, pin } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'กรุณาระบุชื่อร้าน' }, { status: 400 })
  }
  if (!phone?.trim()) {
    return NextResponse.json({ error: 'กรุณาระบุเบอร์โทรศัพท์' }, { status: 400 })
  }
  if (!pin || String(pin).length < 4) {
    return NextResponse.json({ error: 'PIN ต้องมีอย่างน้อย 4 หลัก' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { phone: phone.trim() } })
  if (existing) {
    return NextResponse.json({ error: 'เบอร์โทรนี้มีบัญชีอยู่แล้ว' }, { status: 409 })
  }

  const pinHash = await hashPin(String(pin))

  const user = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { name: `${name.trim()} Shop` },
    })
    return tx.user.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        pinHash,
        workspaceId: workspace.id,
      },
    })
  })

  const session = await getSession()
  session.userId = user.id
  session.workspaceId = user.workspaceId
  session.userName = user.name
  await session.save()

  return NextResponse.json({ ok: true, name: user.name }, { status: 201 })
}
