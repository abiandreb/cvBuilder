import { useState } from 'react'

const TABS = ['Info', 'Summary', 'Experience', 'Education', 'Skills']

// ── Icons ──────────────────────────────────────────────────────────────
const IconDoc = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 2h7l3 3v9H3V2z" strokeLinejoin="round"/>
    <path d="M10 2v3h3M5.5 7.5h5M5.5 10h5M5.5 12.5h3"/>
  </svg>
)
const IconDownload = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12h10" strokeLinecap="round"/>
  </svg>
)
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

let nextId = 100

function uid() {
  return ++nextId
}

// ── Field helpers ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
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

// ── Tab panels ─────────────────────────────────────────────────────────
function InfoPanel({ personal, update }) {
  const p = (key) => (val) => update(`personal.${key}`, val)
  return (
    <>
      <div className="field-row">
        <Input label="Full Name" value={personal.name} onChange={p('name')} placeholder="Jane Smith" />
        <Input label="Job Title" value={personal.jobTitle} onChange={p('jobTitle')} placeholder="Software Engineer" />
      </div>
      <div className="field-row">
        <Input label="Email" type="email" value={personal.email} onChange={p('email')} placeholder="jane@example.com" />
        <Input label="Phone" value={personal.phone} onChange={p('phone')} placeholder="+1 555 000 0000" />
      </div>
      <Input label="Location" value={personal.location} onChange={p('location')} placeholder="New York, NY" />
      <div className="field-row">
        <Input label="LinkedIn" value={personal.linkedin} onChange={p('linkedin')} placeholder="linkedin.com/in/jane" />
        <Input label="Website" value={personal.website} onChange={p('website')} placeholder="janesmith.dev" />
      </div>
    </>
  )
}

function SummaryPanel({ summary, update }) {
  return (
    <Textarea
      label="Professional Summary"
      value={summary}
      onChange={(v) => update('summary', v)}
      placeholder="A concise overview of your professional background, key skills, and career goals..."
      rows={6}
    />
  )
}

function ExperiencePanel({ experience, update }) {
  const set = (idx, key, val) => {
    const next = experience.map((e, i) => i === idx ? { ...e, [key]: val } : e)
    update('experience', next)
  }

  const setBullet = (idx, bIdx, val) => {
    const next = experience.map((e, i) => {
      if (i !== idx) return e
      const bullets = e.bullets.map((b, j) => j === bIdx ? val : b)
      return { ...e, bullets }
    })
    update('experience', next)
  }

  const addBullet = (idx) => {
    const next = experience.map((e, i) =>
      i === idx ? { ...e, bullets: [...e.bullets, ''] } : e
    )
    update('experience', next)
  }

  const removeBullet = (idx, bIdx) => {
    const next = experience.map((e, i) => {
      if (i !== idx) return e
      const bullets = e.bullets.filter((_, j) => j !== bIdx)
      return { ...e, bullets: bullets.length ? bullets : [''] }
    })
    update('experience', next)
  }

  const add = () => {
    update('experience', [...experience, { id: uid(), company: '', role: '', period: '', location: '', bullets: [''] }])
  }

  const remove = (idx) => {
    const next = experience.filter((_, i) => i !== idx)
    update('experience', next.length ? next : [{ id: uid(), company: '', role: '', period: '', location: '', bullets: [''] }])
  }

  return (
    <>
      {experience.map((exp, idx) => (
        <div className="section-card" key={exp.id}>
          <div className="section-card-header">
            <span className="section-card-title">Position {idx + 1}</span>
            <button className="btn-remove" onClick={() => remove(idx)} title="Remove">
              <IconX />
            </button>
          </div>
          <div className="field-row">
            <Input label="Role / Title" value={exp.role} onChange={v => set(idx, 'role', v)} placeholder="Senior Engineer" />
            <Input label="Company" value={exp.company} onChange={v => set(idx, 'company', v)} placeholder="Acme Corp" />
          </div>
          <div className="field-row">
            <Input label="Period" value={exp.period} onChange={v => set(idx, 'period', v)} placeholder="Jan 2021 – Present" />
            <Input label="Location" value={exp.location} onChange={v => set(idx, 'location', v)} placeholder="Remote" />
          </div>
          <Field label="Highlights">
            <div className="bullet-list">
              {exp.bullets.map((b, bIdx) => (
                <div className="bullet-item" key={bIdx}>
                  <input
                    value={b}
                    onChange={e => setBullet(idx, bIdx, e.target.value)}
                    placeholder="Describe an achievement or responsibility..."
                  />
                  <button className="btn-bullet-remove" onClick={() => removeBullet(idx, bIdx)}>
                    <IconX />
                  </button>
                </div>
              ))}
            </div>
            <button className="btn-add-bullet" onClick={() => addBullet(idx)}>
              <IconPlus /> Add bullet
            </button>
          </Field>
        </div>
      ))}
      <button className="btn-add-section" onClick={add}>
        <IconPlus /> Add Position
      </button>
    </>
  )
}

function EducationPanel({ education, update }) {
  const set = (idx, key, val) => {
    const next = education.map((e, i) => i === idx ? { ...e, [key]: val } : e)
    update('education', next)
  }

  const add = () => {
    update('education', [...education, { id: uid(), degree: '', school: '', period: '', gpa: '' }])
  }

  const remove = (idx) => {
    const next = education.filter((_, i) => i !== idx)
    update('education', next.length ? next : [{ id: uid(), degree: '', school: '', period: '', gpa: '' }])
  }

  return (
    <>
      {education.map((edu, idx) => (
        <div className="section-card" key={edu.id}>
          <div className="section-card-header">
            <span className="section-card-title">Entry {idx + 1}</span>
            <button className="btn-remove" onClick={() => remove(idx)}>
              <IconX />
            </button>
          </div>
          <div className="field-row">
            <Input label="Degree / Certificate" value={edu.degree} onChange={v => set(idx, 'degree', v)} placeholder="B.Sc. Computer Science" />
            <Input label="School / University" value={edu.school} onChange={v => set(idx, 'school', v)} placeholder="MIT" />
          </div>
          <div className="field-row">
            <Input label="Period" value={edu.period} onChange={v => set(idx, 'period', v)} placeholder="2016 – 2020" />
            <Input label="GPA / Grade" value={edu.gpa} onChange={v => set(idx, 'gpa', v)} placeholder="3.9 / 4.0" />
          </div>
        </div>
      ))}
      <button className="btn-add-section" onClick={add}>
        <IconPlus /> Add Education
      </button>
    </>
  )
}

function SkillsPanel({ skills, update }) {
  const [drafts, setDrafts] = useState(() => skills.map(() => ''))

  const ensureDrafts = (arr) => {
    setDrafts(d => {
      const next = [...d]
      while (next.length < arr.length) next.push('')
      return next
    })
  }

  const setCategory = (idx, val) => {
    const next = skills.map((s, i) => i === idx ? { ...s, category: val } : s)
    update('skills', next)
  }

  const addTag = (idx) => {
    const val = drafts[idx].trim()
    if (!val) return
    const next = skills.map((s, i) =>
      i === idx ? { ...s, items: [...s.items, val] } : s
    )
    update('skills', next)
    setDrafts(d => d.map((v, i) => i === idx ? '' : v))
  }

  const removeTag = (idx, tIdx) => {
    const next = skills.map((s, i) =>
      i === idx ? { ...s, items: s.items.filter((_, j) => j !== tIdx) } : s
    )
    update('skills', next)
  }

  const add = () => {
    const next = [...skills, { id: uid(), category: '', items: [] }]
    update('skills', next)
    ensureDrafts(next)
  }

  const remove = (idx) => {
    const next = skills.filter((_, i) => i !== idx)
    update('skills', next.length ? next : [{ id: uid(), category: '', items: [] }])
    setDrafts(d => d.filter((_, i) => i !== idx))
  }

  return (
    <>
      {skills.map((skill, idx) => (
        <div className="section-card" key={skill.id}>
          <div className="section-card-header">
            <span className="section-card-title">Skill Group {idx + 1}</span>
            <button className="btn-remove" onClick={() => remove(idx)}>
              <IconX />
            </button>
          </div>
          <Input
            label="Category"
            value={skill.category}
            onChange={v => setCategory(idx, v)}
            placeholder="e.g. Languages, Frameworks, Tools"
          />
          <Field label="Skills">
            <div className="skills-input-row">
              <input
                value={drafts[idx] || ''}
                onChange={e => setDrafts(d => d.map((v, i) => i === idx ? e.target.value : v))}
                onKeyDown={e => e.key === 'Enter' && addTag(idx)}
                placeholder="Type a skill and press Add or Enter"
              />
              <button className="btn-add-tag" onClick={() => addTag(idx)}>Add</button>
            </div>
            {skill.items.length > 0 && (
              <div className="tags-wrap">
                {skill.items.map((item, tIdx) => (
                  <span className="tag" key={tIdx}>
                    {item}
                    <button onClick={() => removeTag(idx, tIdx)}>
                      <IconX />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>
        </div>
      ))}
      <button className="btn-add-section" onClick={add}>
        <IconPlus /> Add Skill Group
      </button>
    </>
  )
}

// ── Editor ─────────────────────────────────────────────────────────────
export default function Editor({ data, update, onExport, exporting }) {
  const [activeTab, setActiveTab] = useState('Info')

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <div className="editor-logo">
          <div className="editor-logo-mark">
            <IconDoc />
          </div>
          <span className="editor-logo-text">CV Builder</span>
        </div>
        <button className="btn-export" onClick={onExport} disabled={exporting}>
          <IconDownload />
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      <div className="editor-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="editor-body">
        {activeTab === 'Info' && (
          <InfoPanel personal={data.personal} update={update} />
        )}
        {activeTab === 'Summary' && (
          <SummaryPanel summary={data.summary} update={update} />
        )}
        {activeTab === 'Experience' && (
          <ExperiencePanel experience={data.experience} update={update} />
        )}
        {activeTab === 'Education' && (
          <EducationPanel education={data.education} update={update} />
        )}
        {activeTab === 'Skills' && (
          <SkillsPanel skills={data.skills} update={update} />
        )}
      </div>
    </div>
  )
}
