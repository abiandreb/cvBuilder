const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

function getToken() { return localStorage.getItem('cv_token') }

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  register: (data)               => request('POST',   '/api/auth/register', data),
  login: (data)                  => request('POST',   '/api/auth/login', data),
  me: ()                         => request('GET',    '/api/auth/me'),
  getCvs: ()                     => request('GET',    '/api/cvs'),
  createCv: (data)               => request('POST',   '/api/cvs', data),
  updateCv: (id, data)           => request('PATCH',  `/api/cvs/${id}`, data),
  deleteCv: (id)                 => request('DELETE', `/api/cvs/${id}`),
  translate: (cvData, targetLang) => request('POST',  '/api/translate', { cvData, targetLang }),
}
