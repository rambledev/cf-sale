import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  const { workspaceId } = session

  const sessions = await prisma.liveSession.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true } },
    },
  })
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  const { workspaceId } = session

  const body = await req.json().catch(() => ({}))
  const { title } = body

  // Generate unique slug (retry on collision)
  let slug = generateSlug()
  let attempts = 0
  while (await prisma.liveSession.findUnique({ where: { slug } })) {
    slug = generateSlug()
    if (++attempts > 10) break
  }

  const liveSession = await prisma.liveSession.create({
    data: { slug, title: title || null, workspaceId },
  })

  return NextResponse.json(liveSession, { status: 201 })
}
