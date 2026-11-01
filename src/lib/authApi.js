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
