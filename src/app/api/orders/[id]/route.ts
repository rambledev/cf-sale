import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      items: { include: { product: true } },
      liveSession: { select: { slug: true, title: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const order = await prisma.order.findUnique({ where: { id: Number(id) } })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const updated = await prisma.order.update({
    where: { id: Number(id) },
    data: {
      ...(body.status && { status: body.status }),
    },
    include: {
      items: { include: { product: true } },
      liveSession: { select: { slug: true, title: true } },
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.order.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
