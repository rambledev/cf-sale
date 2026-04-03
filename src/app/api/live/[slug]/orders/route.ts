import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CartItem {
  productId: number
  quantity: number
}

/** Public: submit cart order from live link */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await req.json()
  const { customerName, items } = body as {
    customerName: string
    items: CartItem[]
  }

  if (!customerName?.trim()) {
    return NextResponse.json({ error: 'กรุณาระบุชื่อ' }, { status: 400 })
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ' }, { status: 400 })
  }

  const session = await prisma.liveSession.findUnique({ where: { slug } })
  if (!session) {
    return NextResponse.json({ error: 'ไม่พบลิงก์นี้' }, { status: 404 })
  }
  if (!session.isActive) {
    return NextResponse.json({ error: 'ปิดรับออเดอร์แล้ว' }, { status: 400 })
  }

  // Validate all items + stock
  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  for (const item of items) {
    const product = productMap[item.productId]
    if (!product) {
      return NextResponse.json({ error: `ไม่พบสินค้า ID ${item.productId}` }, { status: 404 })
    }
    if (item.quantity < 1) {
      return NextResponse.json({ error: 'จำนวนต้องมากกว่า 0' }, { status: 400 })
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `สต็อก ${product.name} ไม่พอ (เหลือ ${product.stock})` },
        { status: 400 }
      )
    }
  }

  // Create order + reduce stock in transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        customerName: customerName.trim(),
        channel: 'CART',
        status: 'pending',
        liveSessionId: session.id,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        liveSession: true,
      },
    })

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return newOrder
  })

  return NextResponse.json(order, { status: 201 })
}
