import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { getCurrentUser, loginUser, registerUser } from '../lib/authApi.js'

const TOKEN_STORAGE_KEY = 'promptmuse-auth-token'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const saveSession = useCallback((token, nextUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    setUser(nextUser)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setUser(null)
  }, [])

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const data = await getCurrentUser(token)
      setUser(data.user ?? data)
    } catch (error) {
      clearSession()
    } finally {
      setLoading(false)
    }
  }, [clearSession])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const signup = useCallback(
    async (formData) => {
      const data = await registerUser(formData)
      saveSession(data.token, data.user)
      return data.user
    },
    [saveSession],
  )

  const login = useCallback(
    async (formData) => {
      const data = await loginUser(formData)
      saveSession(data.token, data.user)
      return data.user
    },
    [saveSession],
  )

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      loading,
      signup,
      login,
      logout,
      refreshSession,
    }),
    [user, loading, signup, login, logout, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
