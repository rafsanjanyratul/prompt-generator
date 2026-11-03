export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

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

export async function createPrompt(payload) {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  return parsePromptResponse(response, '/prompts')
}

export async function uploadPromptImage(file) {
  if (!file) {
    throw new Error('Please select an image to upload.')
  }

  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  return parsePromptResponse(response, '/uploads/image')
}

function getAdminAuthHeaders() {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

export async function updatePromptBySlug(slug, payload) {
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    throw new Error('A valid prompt slug is required.')
  }

  const response = await fetch(`${API_BASE_URL}/prompts/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify(payload),
  })

  return parsePromptResponse(response, `/prompts/${slug}`)
}

export async function deletePromptBySlug(slug) {
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    throw new Error('A valid prompt slug is required.')
  }

  const response = await fetch(`${API_BASE_URL}/prompts/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
  })

  return parsePromptResponse(response, `/prompts/${slug}`)
}
