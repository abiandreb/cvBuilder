import { useState } from 'react'
import CvPreview from './CvPreview'

// ── Icons ──────────────────────────────────────────────────────────────
const IconPlus = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8 3v10M3 8h10" strokeLinecap="round"/>
  </svg>
)
const IconX = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/>
  </svg>
)
const IconDownload = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12h10" strokeLinecap="round"/>
  </svg>
)
const IconSave = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 2h7l3 3v9H3V2z" strokeLinejoin="round"/>
    <path d="M10 2v3H5V2M5 9h6" strokeLinecap="round"/>
  </svg>
)

let _id = 100
const uid = () => ++_id

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i)

function formatMonthYear(val) {
  if (!val) return ''
  const [year, month] = val.split('-')
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`
}

// ── Field helpers ──────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      {label && (
        <label>
          {label}
          {required && <span className="field-required">*</span>}
        </label>
      )}
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = 'text', error, required }) {
  return (
    <Field label={label} error={error} required={required}>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? 'input--error' : ''}
      />
    </Field>
  )
}

function Textarea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <Field label={label}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minHeight: rows * 22 + 'px' }}
      />
    </Field>
  )
}

// Month + Year picker
function MonthYearPicker({ label, value, onChange }) {
  const [year, month] = value ? value.split('-') : ['', '']
  const setYear = v => onChange(v && month ? `${v}-${month}` : v ? `${v}-01` : '')
  const setMonth = v => onChange(year && v ? `${year}-${v}` : '')
  return (
    <Field label={label}>
      <div className="date-picker-row">
        <select value={month || ''} onChange={e => setMonth(e.target.value)} className="date-select">
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
          ))}
        </select>
        <select value={year || ''} onChange={e => setYear(e.target.value)} className="date-select">
          <option value="">Year</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </Field>
  )
}

// Year-only picker
function YearPicker({ label, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      <select value={value || ''} onChange={e => onChange(e.target.value)} className="date-select date-select--full">
        <option value="">{placeholder || 'Year'}</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </Field>
  )
}

function StepHeading({ title, subtitle }) {
  return (
    <div className="step-heading">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// STEP 0 — Personal Info
// ══════════════════════════════════════════════════════════════════════
export function PersonalStep({ data, update, errors = {} }) {
  const p = key => val => update(`personal.${key}`, val)

  const handlePhotoChange = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => p('photo')(ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <>
      <StepHeading title="Personal Information" subtitle="Your name and contact details." />
      <div className="field-row">
        <Input label="Full Name" required value={data.personal.name} onChange={p('name')} placeholder="Jane Smith" error={errors.name} />
        <Input label="Job Title" value={data.personal.jobTitle} onChange={p('jobTitle')} placeholder="Software Engineer" />
      </div>
      <div className="field-row">
        <Input label="Email" required type="email" value={data.personal.email} onChange={p('email')} placeholder="jane@example.com" error={errors.email} />
        <Input label="Phone" value={data.personal.phone} onChange={p('phone')} placeholder="+1 555 000 0000" />
      </div>
      <Input label="Location" value={data.personal.location} onChange={p('location')} placeholder="New York, NY" />
      <div className="field-row">
        <Input label="LinkedIn" value={data.personal.linkedin} onChange={p('linkedin')} placeholder="linkedin.com/in/jane" />
        <Input label="Website" value={data.personal.website} onChange={p('website')} placeholder="janesmith.dev" />
      </div>

      <Field label="Profile Photo">
        {data.personal.photo ? (
          <div className="photo-preview-wrap">
            <img className="photo-preview-img" src={data.personal.photo} alt="Profile" />
            <button className="btn-photo-remove" onClick={() => p('photo')(null)}>Remove</button>
          </div>
        ) : (
          <label className="photo-upload-area">
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round"/>
              <path d="M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Click to upload photo</span>
            <span className="photo-hint">Used in Executive &amp; Vibrant templates</span>
          </label>
        )}
      </Field>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════
// STEP 1 — Summary
// ══════════════════════════════════════════════════════════════════════
export function SummaryStep({ data, update }) {
  return (
    <>
      <StepHeading title="Professional Summary" subtitle="A short intro that appears at the top of your CV. Optional." />
      <Textarea
        label="Summary"
        value={data.summary}
        onChange={v => update('summary', v)}
        placeholder="Experienced professional with a track record of delivering results..."
        rows={7}
      />
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════
// STEP 2 — Experience
// ══════════════════════════════════════════════════════════════════════
export function ExperienceStep({ data, update, errors = {} }) {
  const experience = data.experience

  const set = (idx, key, val) =>
    update('experience', experience.map((e, i) => i === idx ? { ...e, [key]: val } : e))

  const setBullet = (idx, bIdx, val) =>
    update('experience', experience.map((e, i) => {
      if (i !== idx) return e
      return { ...e, bullets: e.bullets.map((b, j) => j === bIdx ? val : b) }
    }))

  const addBullet = idx =>
    update('experience', experience.map((e, i) =>
      i === idx ? { ...e, bullets: [...e.bullets, ''] } : e
    ))

  const removeBullet = (idx, bIdx) =>
    update('experience', experience.map((e, i) => {
      if (i !== idx) return e
      const bullets = e.bullets.filter((_, j) => j !== bIdx)
      return { ...e, bullets: bullets.length ? bullets : [''] }
    }))

  const add = () =>
    update('experience', [...experience, { id: uid(), company: '', role: '', startDate: '', endDate: '', isPresent: false, location: '', bullets: [''] }])

  const remove = idx => {
    const next = experience.filter((_, i) => i !== idx)
    update('experience', next.length ? next : [{ id: uid(), company: '', role: '', startDate: '', endDate: '', isPresent: false, location: '', bullets: [''] }])
  }

  return (
    <>
      <StepHeading title="Work Experience" subtitle="Add your positions, most recent first." />
      {experience.map((exp, idx) => (
        <div className="section-card" key={exp.id}>
          <div className="section-card-header">
            <span className="section-card-title">Position {idx + 1}</span>
            <button className="btn-remove" onClick={() => remove(idx)}><IconX /></button>
          </div>
          <div className="field-row">
            <Input
              label="Role / Title"
              required
              value={exp.role}
              onChange={v => set(idx, 'role', v)}
              placeholder="Senior Engineer"
              error={errors[`exp_role_${idx}`]}
            />
            <Input label="Company" value={exp.company} onChange={v => set(idx, 'company', v)} placeholder="Acme Corp" />
          </div>
          <Input label="Location" value={exp.location} onChange={v => set(idx, 'location', v)} placeholder="Remote / New York, NY" />
          <div className="field-row">
            <MonthYearPicker
              label="Start Date"
              value={exp.startDate}
              onChange={v => set(idx, 'startDate', v)}
            />
            <div>
              {!exp.isPresent && (
                <MonthYearPicker
                  label="End Date"
                  value={exp.endDate}
                  onChange={v => set(idx, 'endDate', v)}
                />
              )}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exp.isPresent}
                  onChange={e => set(idx, 'isPresent', e.target.checked)}
                />
                Currently working here
              </label>
            </div>
          </div>
          <Field label="Highlights">
            <div className="bullet-list">
              {exp.bullets.map((b, bIdx) => (
                <div className="bullet-item" key={bIdx}>
                  <input value={b} onChange={e => setBullet(idx, bIdx, e.target.value)} placeholder="Describe an achievement or responsibility..." />
                  <button className="btn-bullet-remove" onClick={() => removeBullet(idx, bIdx)}><IconX /></button>
                </div>
              ))}
            </div>
            <button className="btn-add-bullet" onClick={() => addBullet(idx)}>
              <IconPlus /> Add bullet
            </button>
          </Field>
        </div>
      ))}
      <button className="btn-add-section" onClick={add}><IconPlus /> Add Position</button>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════
// STEP 3 — Education
// ══════════════════════════════════════════════════════════════════════
export function EducationStep({ data, update }) {
  const education = data.education

  const set = (idx, key, val) =>
    update('education', education.map((e, i) => i === idx ? { ...e, [key]: val } : e))

  const add = () =>
    update('education', [...education, { id: uid(), degree: '', school: '', startYear: '', endYear: '', gpa: '' }])

  const remove = idx => {
    const next = education.filter((_, i) => i !== idx)
    update('education', next.length ? next : [{ id: uid(), degree: '', school: '', startYear: '', endYear: '', gpa: '' }])
  }

  return (
    <>
      <StepHeading title="Education" subtitle="Your academic background." />
      {education.map((edu, idx) => (
        <div className="section-card" key={edu.id}>
          <div className="section-card-header">
            <span className="section-card-title">Entry {idx + 1}</span>
            <button className="btn-remove" onClick={() => remove(idx)}><IconX /></button>
          </div>
          <div className="field-row">
            <Input label="Degree / Certificate" value={edu.degree} onChange={v => set(idx, 'degree', v)} placeholder="B.Sc. Computer Science" />
            <Input label="School / University" value={edu.school} onChange={v => set(idx, 'school', v)} placeholder="MIT" />
          </div>
          <div className="field-row">
            <YearPicker label="Start Year" value={edu.startYear} onChange={v => set(idx, 'startYear', v)} placeholder="Start year" />
            <YearPicker label="End Year" value={edu.endYear} onChange={v => set(idx, 'endYear', v)} placeholder="End year (or expected)" />
          </div>
          <Input label="GPA / Grade (optional)" value={edu.gpa} onChange={v => set(idx, 'gpa', v)} placeholder="3.9 / 4.0" />
        </div>
      ))}
      <button className="btn-add-section" onClick={add}><IconPlus /> Add Education</button>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════
// STEP 4 — Skills
// ══════════════════════════════════════════════════════════════════════
export function SkillsStep({ data, update }) {
  const skills = data.skills
  const [drafts, setDrafts] = useState(() => skills.map(() => ''))

  const setCategory = (idx, val) =>
    update('skills', skills.map((s, i) => i === idx ? { ...s, category: val } : s))

  const addTag = idx => {
    const val = (drafts[idx] || '').trim()
    if (!val) return
    update('skills', skills.map((s, i) => i === idx ? { ...s, items: [...s.items, val] } : s))
    setDrafts(d => d.map((v, i) => i === idx ? '' : v))
  }

  const removeTag = (idx, tIdx) =>
    update('skills', skills.map((s, i) =>
      i === idx ? { ...s, items: s.items.filter((_, j) => j !== tIdx) } : s
    ))

  const add = () => {
    update('skills', [...skills, { id: uid(), category: '', items: [] }])
    setDrafts(d => [...d, ''])
  }

  const remove = idx => {
    const next = skills.filter((_, i) => i !== idx)
    update('skills', next.length ? next : [{ id: uid(), category: '', items: [] }])
    setDrafts(d => d.filter((_, i) => i !== idx))
  }

  return (
    <>
      <StepHeading title="Skills" subtitle="Group your skills by category." />
      {skills.map((skill, idx) => (
        <div className="section-card" key={skill.id}>
          <div className="section-card-header">
            <span className="section-card-title">Group {idx + 1}</span>
            <button className="btn-remove" onClick={() => remove(idx)}><IconX /></button>
          </div>
          <Input label="Category" value={skill.category} onChange={v => setCategory(idx, v)} placeholder="Languages, Frameworks, Tools…" />
          <Field label="Skills (press Enter or click Add)">
            <div className="skills-input-row">
              <input
                value={drafts[idx] || ''}
                onChange={e => setDrafts(d => d.map((v, i) => i === idx ? e.target.value : v))}
                onKeyDown={e => e.key === 'Enter' && addTag(idx)}
                placeholder="Type a skill…"
              />
              <button className="btn-add-tag" onClick={() => addTag(idx)}>Add</button>
            </div>
            {skill.items.length > 0 && (
              <div className="tags-wrap">
                {skill.items.map((item, tIdx) => (
                  <span className="tag" key={tIdx}>
                    {item}
                    <button onClick={() => removeTag(idx, tIdx)}><IconX /></button>
                  </span>
                ))}
              </div>
            )}
          </Field>
        </div>
      ))}
      <button className="btn-add-section" onClick={add}><IconPlus /> Add Group</button>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════
// STEP 5 — Final Preview
// ══════════════════════════════════════════════════════════════════════
const TEMPLATES = [
  { id: 'classic',   name: 'Classic',   desc: 'Traditional & professional' },
  { id: 'modern',    name: 'Modern',    desc: 'Bold header, clean lines' },
  { id: 'minimal',   name: 'Minimal',   desc: 'Refined & typographic' },
  { id: 'executive', name: 'Executive', desc: 'Two-column, corporate' },
  { id: 'vibrant',   name: 'Vibrant',   desc: 'Gradient sidebar, artistic' },
]

export function FinalStep({ data, template, onTemplateChange, onExport, exporting, onBack, onSaveAndExit }) {
  return (
    <div className="final-step">
      <div className="final-preview-col">
        <div className="final-preview-scroll">
          <CvPreview data={data} template={template} />
        </div>
      </div>
      <div className="final-controls-col">
        <div className="final-controls">
          <div className="final-section-label">Template</div>
          <div className="template-switcher">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                className={`tmpl-switch-btn ${template === t.id ? 'active' : ''}`}
                onClick={() => onTemplateChange(t.id)}
              >
                <div className="tmpl-switch-preview">
                  <div className="tmpl-switch-scale">
                    <CvPreview data={data} template={t.id} />
                  </div>
                </div>
                <span className="tmpl-switch-name">{t.name}</span>
              </button>
            ))}
          </div>

          <div className="final-divider" />

          <div className="final-section-label">Export</div>
          <button className="btn-download" onClick={onExport} disabled={exporting}>
            <IconDownload />
            {exporting ? 'Generating PDF…' : 'Download PDF'}
          </button>

          <div className="final-divider" />

          {onSaveAndExit && (
            <button className="btn-save-exit" onClick={onSaveAndExit}>
              <IconSave />
              Save &amp; Exit to Dashboard
            </button>
          )}

          <button className="btn-action" onClick={onBack} style={{ marginTop: '6px' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 4L6 8l4 4" strokeLinecap="round"/></svg>
            Back to edit
          </button>
        </div>
      </div>
    </div>
  )
}

export { formatMonthYear }
