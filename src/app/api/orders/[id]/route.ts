import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  const { workspaceId } = session
  const { id } = await params

  const order = await prisma.order.findFirst({
    where: { id: Number(id), workspaceId },
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
  const session = await getSession()
  const { workspaceId } = session
  const { id } = await params
  const body = await req.json()

  const order = await prisma.order.findFirst({ where: { id: Number(id), workspaceId } })
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
  const session = await getSession()
  const { workspaceId } = session
  const { id } = await params

  const order = await prisma.order.findFirst({
    where: { id: Number(id), workspaceId },
    include: { items: { include: { product: true } } },
  })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Restore stock for every item before deleting the order
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    }
    await tx.order.delete({ where: { id: Number(id) } })
  })

  return NextResponse.json({ ok: true })
}
