import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  const { workspaceId } = session

  const products = await prisma.product.findMany({
    where: { workspaceId },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  const { workspaceId } = session

  const body = await req.json()
  const { code, name, price, stock } = body

  if (!code || !name || price == null || stock == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.product.findUnique({
    where: { code_workspaceId: { code: code.toUpperCase(), workspaceId } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Product code already exists' }, { status: 409 })
  }

  const product = await prisma.product.create({
    data: {
      code: code.toUpperCase(),
      name,
      price: Number(price),
      stock: Number(stock),
      workspaceId,
    },
  })

  return NextResponse.json(product, { status: 201 })
}
