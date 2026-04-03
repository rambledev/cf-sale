import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

export async function GET() {
  const sessions = await prisma.liveSession.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true } },
    },
  })
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { title } = body

  // Generate unique slug (retry on collision)
  let slug = generateSlug()
  let attempts = 0
  while (await prisma.liveSession.findUnique({ where: { slug } })) {
    slug = generateSlug()
    if (++attempts > 10) break
  }

  const session = await prisma.liveSession.create({
    data: { slug, title: title || null },
  })

  return NextResponse.json(session, { status: 201 })
}
