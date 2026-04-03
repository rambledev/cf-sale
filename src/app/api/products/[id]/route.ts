import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { stock, name, price } = body

  const product = await prisma.product.findUnique({ where: { id: Number(id) } })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const updated = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...(name != null && { name }),
      ...(price != null && { price: Number(price) }),
      ...(stock != null && { stock: Number(stock) }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.product.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
