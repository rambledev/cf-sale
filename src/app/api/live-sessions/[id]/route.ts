import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  const { workspaceId } = session
  const { id } = await params
  const body = await req.json()

  const liveSession = await prisma.liveSession.findFirst({
    where: { id: Number(id), workspaceId },
  })
  if (!liveSession) {
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
  const session = await getSession()
  const { workspaceId } = session
  const { id } = await params

  const liveSession = await prisma.liveSession.findFirst({
    where: { id: Number(id), workspaceId },
  })
  if (!liveSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  await prisma.liveSession.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
