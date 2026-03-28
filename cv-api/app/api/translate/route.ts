import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  uk: 'Ukrainian',
  de: 'German',
  pl: 'Polish',
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })

  try {
    const { cvData, targetLang } = await req.json()
    const langName = LANG_NAMES[targetLang] ?? targetLang

    const prompt = `You are a professional CV/resume translator. Translate ALL text content in the following JSON CV data into ${langName}.

Rules:
- Translate every human-readable string value: names of degrees, job titles, company descriptions, skills categories, bullet points, summary, location names, etc.
- Do NOT translate: email addresses, URLs, phone numbers, proper names of companies, universities, or people.
- Do NOT change the JSON structure or keys — only translate the string values.
- Keep the same JSON format. Return ONLY valid JSON, no markdown fences, no explanation.

CV data to translate:
${JSON.stringify(cvData)}`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    const translated = JSON.parse(cleaned)

    return NextResponse.json(translated)
  } catch (err) {
    console.error('Translation error:', err)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
