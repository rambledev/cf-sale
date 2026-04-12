import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  const { workspaceId } = session

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const channel = searchParams.get('channel')

  const orders = await prisma.order.findMany({
    where: {
      workspaceId,
      ...(status && { status }),
      ...(channel && { channel }),
    },
    include: {
      items: { include: { product: true } },
      liveSession: { select: { slug: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  const { workspaceId } = session

  const body = await req.json()
  const { customerName, productCode, quantity } = body

  if (!productCode || !quantity || quantity < 1) {
    return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { code_workspaceId: { code: productCode.toUpperCase(), workspaceId } },
  })

  if (!product) {
    return NextResponse.json({ error: `Product ${productCode} not found` }, { status: 404 })
  }

  if (product.stock < quantity) {
    return NextResponse.json(
      { error: `Insufficient stock. Available: ${product.stock}` },
      { status: 400 }
    )
  }

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        customerName: customerName || 'ไม่ระบุชื่อ',
        channel: 'COMMENT',
        status: 'confirmed',
        workspaceId,
        items: {
          create: {
            productId: product.id,
            quantity: Number(quantity),
            workspaceId,
          },
        },
      },
      include: {
        items: { include: { product: true } },
        liveSession: { select: { slug: true, title: true } },
      },
    })

    await tx.product.update({
      where: { id: product.id },
      data: { stock: { decrement: Number(quantity) } },
    })

    return newOrder
  })

  return NextResponse.json(order, { status: 201 })
}
