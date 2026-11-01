const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

async function parsePromptResponse(response, endpoint) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload && payload.message ? payload.message : `Request failed for ${endpoint}`
    throw new Error(message)
  }

  if (!payload || payload.success === false) {
    throw new Error(`Prompt API request failed for ${endpoint}`)
  }

  return payload.data
}

export async function getAllPrompts() {
  const response = await fetch(`${API_BASE_URL}/prompts`)
  return parsePromptResponse(response, '/prompts')
}

export async function getPromptBySlug(slug) {
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    throw new Error('A valid prompt slug is required.')
  }

  const response = await fetch(`${API_BASE_URL}/prompts/${encodeURIComponent(slug)}`)
  return parsePromptResponse(response, `/prompts/${slug}`)
}
