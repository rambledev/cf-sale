import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [totalOrders, confirmedOrders, products, orderItems] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'confirmed' } }),
    prisma.product.findMany(),
    prisma.orderItem.findMany({
      where: { order: { status: 'confirmed' } },
      include: { product: true },
    }),
  ])

  const totalSales = orderItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

  return NextResponse.json({
    totalOrders,
    confirmedOrders,
    pendingOrders: totalOrders - confirmedOrders,
    totalSales,
    totalProducts: products.length,
    totalStock,
  })
}
