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

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const cv = await prisma.cv.findUnique({ where: { id } })
  if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (cv.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json(cv)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const cv = await prisma.cv.findUnique({ where: { id } })
  if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (cv.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const updated = await prisma.cv.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.template !== undefined && { template: body.template }),
        ...(body.data !== undefined && { data: body.data }),
        ...(body.language !== undefined && { language: body.language }),
        ...(body.isTranslation !== undefined && { isTranslation: body.isTranslation }),
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const cv = await prisma.cv.findUnique({ where: { id } })
  if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (cv.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.cv.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
