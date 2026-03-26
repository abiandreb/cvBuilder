import { useState } from 'react'
import { useCv } from '../context/CvContext'
import { translateCv } from '../utils/translate'

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'uk', flag: '🇺🇦', name: 'Ukrainian' },
  { code: 'de', flag: '🇩🇪', name: 'German' },
  { code: 'pl', flag: '🇵🇱', name: 'Polish' },
]

export default function TranslateModal({ cv, onClose }) {
  const { createCv } = useCv()
  const [selectedLang, setSelectedLang] = useState('uk')
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    setLoading(true)
    try {
      const translatedData = await translateCv(cv.data, selectedLang)
      const langName = LANGUAGES.find(l => l.code === selectedLang)?.name || selectedLang
      await createCv({
        name: `${cv.name} (${langName})`,
        template: cv.template,
        data: translatedData,
        language: selectedLang,
        isTranslation: true,
        originalCvId: cv.id,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Translate CV</h3>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <p className="modal-subtitle">
          Choose a target language. A translated copy will appear on your dashboard.
        </p>

        <div className="lang-buttons">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              className={`lang-btn ${selectedLang === l.code ? 'active' : ''}`}
              onClick={() => setSelectedLang(l.code)}
              disabled={loading}
            >
              <span className="lang-flag">{l.flag}</span>
              {l.name}
            </button>
          ))}
        </div>

        {loading && (
          <div className="translate-loading">
            <div className="spinner" />
            <span>Translating with AI...</span>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-modal-ok" onClick={handleTranslate} disabled={loading}>
            {loading ? 'Translating…' : 'Translate'}
          </button>
        </div>
      </div>
    </div>
  )
}
