import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../utils/api'

const CvContext = createContext(null)

export function CvProvider({ children }) {
  const { user } = useAuth()
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // One-time migration: clear old localStorage data (passwords were plain-text)
    localStorage.removeItem('cv_list')
    localStorage.removeItem('cv_users')
  }, [])

  useEffect(() => {
    if (!user) {
      setCvs([])
      return
    }
    setLoading(true)
    api.getCvs()
      .then(data => setCvs(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  const createCv = async (cvData) => {
    const newCv = await api.createCv(cvData)
    setCvs(prev => [newCv, ...prev])
    return newCv
  }

  const updateCv = async (id, updates) => {
    const updated = await api.updateCv(id, updates)
    setCvs(prev => prev.map(cv => cv.id === id ? updated : cv))
    return updated
  }

  const deleteCv = async (id) => {
    await api.deleteCv(id)
    setCvs(prev => prev.filter(cv => cv.id !== id))
  }

  const getCvById = (id) => cvs.find(cv => cv.id === id) || null

  return (
    <CvContext.Provider value={{ cvs, createCv, updateCv, deleteCv, getCvById, loading, error }}>
      {children}
    </CvContext.Provider>
  )
}

export function useCv() {
  return useContext(CvContext)
}
