import { api } from './api'

// TODO: replace with Gemini API call (process.env.GEMINI_API_KEY) — handled in cv-api/app/api/translate/route.ts
export async function translateCv(cvData, targetLang) {
  return api.translate(cvData, targetLang)
}
