import { API_BASE_URL } from './promptsApi.js'

async function parseAuthResponse(response, endpoint) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload && payload.message ? payload.message : `Request failed for ${endpoint}`
    throw new Error(message)
  }

  if (!payload || payload.success === false) {
    throw new Error(`Authentication request failed for ${endpoint}`)
  }

  return payload.data
}

export async function registerUser(formData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })

  return parseAuthResponse(response, '/auth/register')
}

export async function loginUser(formData) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })

  return parseAuthResponse(response, '/auth/login')
}

export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return parseAuthResponse(response, '/auth/me')
}

export async function getFavoritePrompts() {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return parseAuthResponse(response, '/favorites')
}

export async function addFavoritePrompt(slug) {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/favorites/${encodeURIComponent(slug)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return parseAuthResponse(response, `/favorites/${slug}`)
}

export async function removeFavoritePrompt(slug) {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/favorites/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return parseAuthResponse(response, `/favorites/${slug}`)
}

export async function getUserPrompts() {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/user-prompts`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return parseAuthResponse(response, '/user-prompts')
}

export async function createUserPrompt(formData) {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/user-prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  })

  return parseAuthResponse(response, '/user-prompts')
}

export async function updateUserPrompt(promptId, formData) {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/user-prompts/${encodeURIComponent(promptId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  })

  return parseAuthResponse(response, `/user-prompts/${promptId}`)
}

export async function deleteUserPrompt(promptId) {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/user-prompts/${encodeURIComponent(promptId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return parseAuthResponse(response, `/user-prompts/${promptId}`)
}
