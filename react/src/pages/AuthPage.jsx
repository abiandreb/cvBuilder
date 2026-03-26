import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ onSuccess }) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const errs = {}
    if (tab === 'register' && !name.trim()) errs.name = 'Name is required'
    if (!email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email'
    }
    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 6) {
      errs.password = 'At least 6 characters'
    }
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setServerError('')
    try {
      if (tab === 'register') {
        await register(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
      onSuccess()
    } catch (e) {
      setServerError(e.message)
    }
  }

  const switchTab = (t) => {
    setTab(t)
    setErrors({})
    setServerError('')
    setName('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="wiz-logo-mark">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 2h7l3 3v9H3V2z" strokeLinejoin="round"/>
              <path d="M10 2v3h3M5.5 7.5h5M5.5 10h5M5.5 12.5h3"/>
            </svg>
          </div>
          <span className="auth-logo-name">CV Builder</span>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Log in
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Register
          </button>
        </div>

        <div className="auth-form">
          {tab === 'register' && (
            <div className={`field ${errors.name ? 'field--error' : ''}`}>
              <label>Full Name <span className="field-required">*</span></label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          <div className={`field ${errors.email ? 'field--error' : ''}`}>
            <label>Email <span className="field-required">*</span></label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className={errors.email ? 'input--error' : ''}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className={`field ${errors.password ? 'field--error' : ''}`}>
            <label>Password <span className="field-required">*</span></label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className={errors.password ? 'input--error' : ''}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {serverError && <div className="auth-server-error">{serverError}</div>}

          <button className="btn-auth-submit" onClick={handleSubmit}>
            {tab === 'login' ? 'Log in' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  )
}
