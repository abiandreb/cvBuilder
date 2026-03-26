import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'

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

const MOCK_TRANSLATIONS: Record<string, { summary: string | null }> = {
  uk: { summary: 'Досвідчений фахівець з підтвердженим досвідом роботи в галузі та стійкими результатами.' },
  de: { summary: 'Erfahrener Fachmann mit nachgewiesener Erfolgsbilanz in der Branche und beständigen Ergebnissen.' },
  pl: { summary: 'Doświadczony specjalista z udokumentowanymi osiągnięciami w branży i trwałymi wynikami.' },
  en: { summary: null },
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { cvData, targetLang } = await req.json()

    // TODO: replace with Gemini API call (process.env.GEMINI_API_KEY)
    await new Promise(r => setTimeout(r, 2000))

    const t = MOCK_TRANSLATIONS[targetLang] ?? MOCK_TRANSLATIONS.en
    const translated = {
      ...cvData,
      summary: t.summary ?? cvData.summary,
    }

    return NextResponse.json(translated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
