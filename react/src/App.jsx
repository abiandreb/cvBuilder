import { useState, useRef, useCallback } from 'react'
import './App.css'
import { PersonalStep, SummaryStep, ExperienceStep, EducationStep, SkillsStep, FinalStep } from './components/WizardSteps'
import CvPreview from './components/CvPreview'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CvProvider, useCv } from './context/CvContext'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'

const SAMPLE_DATA = {
  personal: { name: 'Alex Johnson', jobTitle: 'Product Designer', email: 'alex@example.com', phone: '+1 555 123 4567', location: 'San Francisco, CA', linkedin: 'linkedin.com/in/alex', website: '', photo: null },
  summary: 'Experienced designer with 6+ years crafting user-centered digital products.',
  experience: [
    { id: 1, role: 'Senior Product Designer', company: 'Figma Inc.', startDate: '2021-03', endDate: '', isPresent: true, location: 'Remote', bullets: ['Led redesign of core editor', 'Managed design system for 40+ components'] },
    { id: 2, role: 'UI Designer', company: 'Notion Labs', startDate: '2018-06', endDate: '2021-02', isPresent: false, location: 'NYC', bullets: ['Designed onboarding flows'] },
  ],
  education: [{ id: 1, degree: 'B.S. Interaction Design', school: 'Carnegie Mellon', startYear: '2014', endYear: '2018', gpa: '3.8' }],
  skills: [
    { id: 1, category: 'Design', items: ['Figma', 'Sketch', 'Prototyping'] },
    { id: 2, category: 'Tools', items: ['Jira', 'Notion', 'Linear'] },
  ],
}

function LandingPage({ onStart }) {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-logo">
          <div className="wiz-logo-mark landing-logo-mark">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 2h7l3 3v9H3V2z" strokeLinejoin="round"/>
              <path d="M10 2v3h3M5.5 7.5h5M5.5 10h5M5.5 12.5h3"/>
            </svg>
          </div>
          <span className="landing-logo-name">CV Builder</span>
        </div>
        <h1 className="landing-title">Build a professional CV<br/>in minutes</h1>
        <p className="landing-subtitle">Step-by-step guided builder. Choose from five clean templates.<br/>Export to PDF · AI translation · Save your CVs.</p>
        <button className="btn-start" onClick={onStart}>
          Start Building
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4l4 4-4 4" strokeLinecap="round"/>
          </svg>
        </button>
        <p className="landing-hint">Free · 5 templates · AI translation</p>
      </div>

      <div className="landing-templates">
        <p className="landing-templates-label">3 of 5 templates</p>
        <div className="landing-template-row">
          {['classic', 'modern', 'minimal'].map((t, i) => (
            <div className="landing-tmpl-card" key={t}>
              <div className="landing-tmpl-frame">
                <div className="landing-tmpl-scale">
                  <CvPreview data={SAMPLE_DATA} template={t} />
                </div>
              </div>
              <span className="landing-tmpl-name">{['Classic', 'Modern', 'Minimal'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const STEPS = ['Personal', 'Summary', 'Experience', 'Education', 'Skills', 'Preview']

const defaultData = {
  personal: { name: '', jobTitle: '', email: '', phone: '', location: '', linkedin: '', website: '', photo: null },
  summary: '',
  experience: [{ id: 1, company: '', role: '', startDate: '', endDate: '', isPresent: false, location: '', bullets: [''] }],
  education: [{ id: 1, degree: '', school: '', startYear: '', endYear: '', gpa: '' }],
  skills: [{ id: 1, category: '', items: [] }],
}

function validate(step, data) {
  const errors = {}
  if (step === 0) {
    if (!data.personal.name.trim()) errors.name = 'Full name is required'
    if (!data.personal.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email)) {
      errors.email = 'Enter a valid email address'
    }
  }
  if (step === 2) {
    data.experience.forEach((exp, i) => {
      if ((exp.company || exp.bullets.some(b => b.trim())) && !exp.role.trim()) {
        errors[`exp_role_${i}`] = 'Role is required'
      }
    })
  }
  return errors
}

function AppInner() {
  const { user, loading } = useAuth()
  const { createCv, updateCv, getCvById } = useCv()
  const [page, setPage] = useState('landing')
  const [step, setStep] = useState(0)
  const [template, setTemplate] = useState('classic')
  const [data, setData] = useState(defaultData)
  const [errors, setErrors] = useState({})
  const [exporting, setExporting] = useState(false)
  const [wizardMode, setWizardMode] = useState('create')
  const [editingCvId, setEditingCvId] = useState(null)
  const [cvName, setCvName] = useState('My CV')
  const cvRef = useRef(null)

  const update = useCallback((path, value) => {
    setData(prev => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value
      return next
    })
    setErrors(prev => {
      const key = path.split('.').pop()
      if (prev[key]) { const next = { ...prev }; delete next[key]; return next }
      return prev
    })
  }, [])

  const handleExport = async () => {
    if (!cvRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(cvRef.current, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const w = pdf.internal.pageSize.getWidth()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, (canvas.height * w) / canvas.width)
      pdf.save(`${(data.personal.name || 'cv').replace(/\s+/g, '_')}_cv.pdf`)
    } finally {
      setExporting(false)
    }
  }

  const next = () => {
    const errs = validate(step, data)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => { setErrors({}); setStep(s => Math.max(s - 1, 0)) }

  const goToDashboard = () => {
    setPage('dashboard')
    setStep(0)
    setData(defaultData)
    setTemplate('classic')
    setCvName('My CV')
    setEditingCvId(null)
    setWizardMode('create')
    setErrors({})
  }

  const startNewCv = () => {
    setStep(0)
    setData(defaultData)
    setTemplate('classic')
    setCvName('My CV')
    setEditingCvId(null)
    setWizardMode('create')
    setErrors({})
    setPage('wizard')
  }

  const startEditCv = (cvId) => {
    const cv = getCvById(cvId)
    if (!cv) return
    setStep(0)
    setData(cv.data)
    setTemplate(cv.template)
    setCvName(cv.name)
    setEditingCvId(cvId)
    setWizardMode('edit')
    setErrors({})
    setPage('wizard')
  }

  const handleSaveAndExit = async () => {
    if (wizardMode === 'edit' && editingCvId) {
      await updateCv(editingCvId, { data, template, name: cvName })
    } else {
      await createCv({ data, template, name: cvName })
    }
    goToDashboard()
  }

  if (loading) {
    return <div className="app-loading">Loading…</div>
  }

  if (page === 'landing') {
    return (
      <LandingPage
        onStart={() => {
          if (user) setPage('dashboard')
          else setPage('auth')
        }}
      />
    )
  }

  if (page === 'auth') {
    return <AuthPage onSuccess={() => setPage('dashboard')} />
  }

  if (page === 'dashboard') {
    if (!user) return <AuthPage onSuccess={() => setPage('dashboard')} />
    return <DashboardPage onNewCv={startNewCv} onEditCv={startEditCv} />
  }

  // page === 'wizard'
  if (!user) return <AuthPage onSuccess={() => setPage('dashboard')} />

  const isFormStep = step >= 0 && step <= 4
  const showFooter = step >= 0 && step <= 4

  return (
    <div className="wizard">
      <div className="wizard-header">
        <div className="wizard-logo" style={{ cursor: 'pointer' }} onClick={goToDashboard} title="Back to dashboard">
          <div className="wiz-logo-mark">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 2h7l3 3v9H3V2z" strokeLinejoin="round"/>
              <path d="M10 2v3h3M5.5 7.5h5M5.5 10h5M5.5 12.5h3"/>
            </svg>
          </div>
          <span className="wiz-logo-text">CV Builder</span>
        </div>

        <input
          className="wiz-cv-name"
          value={cvName}
          onChange={e => setCvName(e.target.value)}
          placeholder="CV name…"
        />

        <div className="wiz-stepper">
          {STEPS.map((label, i) => (
            <div key={i} className={`wiz-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="wiz-step-dot">
                {i < step
                  ? <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6l3 3 5-5" strokeLinecap="round"/></svg>
                  : <span>{i + 1}</span>}
              </div>
              <span className="wiz-step-label">{label}</span>
              {i < STEPS.length - 1 && <div className="wiz-step-line" />}
            </div>
          ))}
        </div>
      </div>

      <div className="wizard-main">
        {isFormStep && (
          <div className="wizard-form-layout">
            <div className="wizard-form-scroll">
              <div className="wizard-form-inner">
                {step === 0 && <PersonalStep data={data} update={update} errors={errors} />}
                {step === 1 && <SummaryStep data={data} update={update} />}
                {step === 2 && <ExperienceStep data={data} update={update} errors={errors} />}
                {step === 3 && <EducationStep data={data} update={update} />}
                {step === 4 && <SkillsStep data={data} update={update} />}
              </div>
            </div>
            <div className="wizard-aside">
              <div className="mini-preview-wrap">
                <div className="mini-preview-label">Live Preview</div>
                <div className="mini-preview-viewport">
                  <div className="mini-preview-inner">
                    <CvPreview data={data} template={template} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <FinalStep
            data={data}
            template={template}
            onTemplateChange={setTemplate}
            cvRef={cvRef}
            onExport={handleExport}
            exporting={exporting}
            onBack={back}
            onSaveAndExit={handleSaveAndExit}
          />
        )}
      </div>

      {showFooter && (
        <div className="wizard-footer">
          {step > 0 && (
            <button className="btn-nav btn-back" onClick={back}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 4L6 8l4 4" strokeLinecap="round"/></svg>
              Back
            </button>
          )}
          <div className="wiz-footer-steps">Step {step + 1} of {STEPS.length - 1}</div>
          <button className="btn-nav btn-next" onClick={next}>
            {step === 4 ? 'Preview CV' : 'Continue'}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round"/></svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CvProvider>
        <AppInner />
      </CvProvider>
    </AuthProvider>
  )
}
