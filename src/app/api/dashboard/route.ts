import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  const { workspaceId } = session

  const [totalOrders, confirmedOrders, products, orderItems] = await Promise.all([
    prisma.order.count({ where: { workspaceId } }),
    prisma.order.count({ where: { workspaceId, status: 'confirmed' } }),
    prisma.product.findMany({ where: { workspaceId } }),
    prisma.orderItem.findMany({
      where: { order: { status: 'confirmed', workspaceId } },
      include: { product: true },
    }),
  ])

  const totalSales = orderItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
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
