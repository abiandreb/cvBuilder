import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cv_token')
    if (token) {
      api.me()
        .then(({ user }) => setUser(user))
        .catch(() => localStorage.removeItem('cv_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const register = async (name, email, password) => {
    const { token, user } = await api.register({ name, email, password })
    localStorage.setItem('cv_token', token)
    setUser(user)
  }

  const login = async (email, password) => {
    const { token, user } = await api.login({ email, password })
    localStorage.setItem('cv_token', token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('cv_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
