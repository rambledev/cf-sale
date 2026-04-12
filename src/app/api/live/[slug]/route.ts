import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Public: get session + products by slug (no auth required) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const session = await prisma.liveSession.findUnique({ where: { slug } })
  if (!session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Return only products that belong to this session's workspace
  const products = await prisma.product.findMany({
    where: { workspaceId: session.workspaceId, stock: { gt: 0 } },
    orderBy: { code: 'asc' },
  })

  return NextResponse.json({ session, products })
}
