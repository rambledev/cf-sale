import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const session = await prisma.liveSession.findUnique({ where: { id: Number(id) } })
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const updated = await prisma.liveSession.update({
    where: { id: Number(id) },
    data: {
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.title !== undefined && { title: body.title || null }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.liveSession.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
