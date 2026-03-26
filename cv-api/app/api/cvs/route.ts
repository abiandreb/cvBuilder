import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const payload = await verifyJwt(auth.slice(7))
    return payload.userId as string
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cvs = await prisma.cv.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(cvs)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, template, data, language, isTranslation, originalCvId } = await req.json()
    const cv = await prisma.cv.create({
      data: {
        userId,
        name: name || 'My CV',
        template: template || 'classic',
        data: data ?? {},
        language: language || 'en',
        isTranslation: isTranslation || false,
        originalCvId: originalCvId || null,
      },
    })
    return NextResponse.json(cv, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
