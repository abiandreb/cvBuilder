import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCv } from '../context/CvContext'
import CvCard from '../components/CvCard'
import TranslateModal from '../components/TranslateModal'

export default function DashboardPage({ onNewCv, onEditCv }) {
  const { user, logout } = useAuth()
  const { cvs } = useCv()
  const [translateTarget, setTranslateTarget] = useState(null)

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div className="dash-logo">
          <div className="wiz-logo-mark">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 2h7l3 3v9H3V2z" strokeLinejoin="round"/>
              <path d="M10 2v3h3M5.5 7.5h5M5.5 10h5M5.5 12.5h3"/>
            </svg>
          </div>
          <span className="dash-logo-name">CV Builder</span>
        </div>
        <div className="dash-header-right">
          <span className="dash-user-name">Hi, {user?.name?.split(' ')[0]}</span>
          <button className="btn-new-cv" onClick={onNewCv}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 3v10M3 8h10" strokeLinecap="round"/>
            </svg>
            New CV
          </button>
          <button className="btn-logout" onClick={logout}>Log out</button>
        </div>
      </div>

      <div className="dash-body">
        {cvs.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-icon">
              <svg viewBox="0 0 64 64" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <rect x="10" y="6" width="36" height="48" rx="3"/>
                <path d="M18 18h20M18 26h20M18 34h14"/>
                <circle cx="48" cy="46" r="10" fill="#f3f4f6" stroke="#d1d5db"/>
                <path d="M44 46h8M48 42v8" strokeLinecap="round" stroke="#9ca3af" strokeWidth="1.5"/>
              </svg>
            </div>
            <h2 className="dash-empty-title">No CVs yet</h2>
            <p className="dash-empty-sub">Create your first CV to get started</p>
            <button className="btn-start" onClick={onNewCv} style={{ marginTop: '8px' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v10M3 8h10" strokeLinecap="round"/>
              </svg>
              Create your first CV
            </button>
          </div>
        ) : (
          <div className="cv-grid">
            {cvs.map(cv => (
              <CvCard
                key={cv.id}
                cv={cv}
                onEdit={() => onEditCv(cv.id)}
                onTranslate={() => setTranslateTarget(cv)}
              />
            ))}
          </div>
        )}
      </div>

      {translateTarget && (
        <TranslateModal
          cv={translateTarget}
          onClose={() => setTranslateTarget(null)}
        />
      )}
    </div>
  )
}
