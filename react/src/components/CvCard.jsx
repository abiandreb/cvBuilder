import { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import CvPreview from './CvPreview'
import { useCv } from '../context/CvContext'

const ALL_TEMPLATES = [
  { id: 'classic',   name: 'Classic' },
  { id: 'modern',    name: 'Modern' },
  { id: 'minimal',   name: 'Minimal' },
  { id: 'executive', name: 'Executive' },
  { id: 'vibrant',   name: 'Vibrant' },
]

const LANG_FLAGS = { en: '🇬🇧', uk: '🇺🇦', de: '🇩🇪', pl: '🇵🇱' }
const LANG_NAMES = { en: 'English', uk: 'Ukrainian', de: 'German', pl: 'Polish' }

const IconEdit = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinejoin="round"/>
  </svg>
)
const IconDownload = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12h10" strokeLinecap="round"/>
  </svg>
)
const IconPalette = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="8" cy="8" r="6"/>
    <circle cx="5.5" cy="6" r="1" fill="currentColor" stroke="none"/>
    <circle cx="10.5" cy="6" r="1" fill="currentColor" stroke="none"/>
    <circle cx="8" cy="10.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
)
const IconTranslate = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M2 4h7M5.5 2v2M2 4c0 3 2.5 5 5.5 5" strokeLinecap="round"/>
    <path d="M9 4c1 3 4 5 5 5" strokeLinecap="round"/>
    <path d="M8 14l2-5 2 5M9 12h2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconTrash = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M2.5 4.5h11M6 4.5V3h4v1.5M5.5 4.5l.5 8h4l.5-8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconChevron = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 4.5l3 3 3-3" strokeLinecap="round"/>
  </svg>
)

export default function CvCard({ cv, onEdit, onTranslate }) {
  const { updateCv, deleteCv } = useCv()
  const [showDesignMenu, setShowDesignMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [nameVal, setNameVal] = useState(cv.name)
  const [downloading, setDownloading] = useState(false)
  const nameRef = useRef(null)
  const menuRef = useRef(null)
  const pdfRef = useRef(null)

  useEffect(() => {
    if (editing && nameRef.current) nameRef.current.select()
  }, [editing])

  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowDesignMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const saveName = () => {
    const trimmed = nameVal.trim()
    if (trimmed) updateCv(cv.id, { name: trimmed })
    else setNameVal(cv.name)
    setEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${cv.name}"? This cannot be undone.`)) {
      deleteCv(cv.id)
    }
  }

  const handleDownload = async () => {
    if (!pdfRef.current || downloading) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const w = pdf.internal.pageSize.getWidth()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, (canvas.height * w) / canvas.width)
      pdf.save(`${(cv.data.personal?.name || cv.name).replace(/\s+/g, '_')}_cv.pdf`)
    } finally {
      setDownloading(false)
    }
  }

  const updatedLabel = cv.updatedAt
    ? new Date(cv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null

  return (
    <>
      {/* Hidden full-size CV for PDF export */}
      <div style={{ position: 'fixed', left: '-10000px', top: 0, pointerEvents: 'none', zIndex: -1 }}>
        <CvPreview data={cv.data} template={cv.template} cvRef={pdfRef} />
      </div>

      <div className="cv-card">
        {/* Thumbnail */}
        <div className="cv-card-thumb" onClick={onEdit}>
          <div className="cv-card-scale">
            <CvPreview data={cv.data} template={cv.template} />
          </div>
          <div className="cv-card-thumb-overlay">
            <span className="cv-card-edit-hint">
              <IconEdit /> Edit
            </span>
          </div>
          {cv.isTranslation && (
            <div className="cv-card-lang-badge">
              {LANG_FLAGS[cv.language] || '🌐'} {LANG_NAMES[cv.language] || cv.language}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="cv-card-body">
          <div className="cv-card-body-top">
            {editing ? (
              <input
                ref={nameRef}
                className="cv-card-name-input"
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveName()
                  if (e.key === 'Escape') { setNameVal(cv.name); setEditing(false) }
                }}
              />
            ) : (
              <div
                className="cv-card-name"
                onDoubleClick={() => setEditing(true)}
                title="Double-click to rename"
              >
                {cv.name}
              </div>
            )}
          </div>
          <div className="cv-card-meta-row">
            <span className="cv-card-tmpl-badge">
              {ALL_TEMPLATES.find(t => t.id === cv.template)?.name || cv.template}
            </span>
            {updatedLabel && <span className="cv-card-date">Updated {updatedLabel}</span>}
          </div>
        </div>

        {/* Primary action */}
        <div className="cv-card-primary">
          <button className="btn-card-download" onClick={handleDownload} disabled={downloading}>
            <IconDownload />
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
          <button className="btn-card-edit" onClick={onEdit}>
            <IconEdit />
            Edit
          </button>
        </div>

        {/* Secondary actions */}
        <div className="cv-card-secondary">
          <div className="cv-card-design-wrap" ref={menuRef}>
            <button className="cv-card-icon-btn" onClick={() => setShowDesignMenu(v => !v)} title="Change design">
              <IconPalette />
              <span>Design</span>
              <IconChevron />
            </button>
            {showDesignMenu && (
              <div className="design-menu">
                {ALL_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    className={`design-menu-item ${cv.template === t.id ? 'active' : ''}`}
                    onClick={() => { updateCv(cv.id, { template: t.id }); setShowDesignMenu(false) }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="cv-card-icon-btn" onClick={onTranslate} title="Translate">
            <IconTranslate />
            <span>Translate</span>
          </button>

          <button className="cv-card-icon-btn cv-card-icon-btn--danger" onClick={handleDelete} title="Delete">
            <IconTrash />
          </button>
        </div>
      </div>
    </>
  )
}
