const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatMonthYear(val) {
  if (!val) return ''
  const [year, month] = val.split('-')
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`
}

function expPeriod(exp) {
  if (!exp.startDate && !exp.endDate && !exp.isPresent) return ''
  const start = formatMonthYear(exp.startDate)
  const end = exp.isPresent ? 'Present' : formatMonthYear(exp.endDate)
  if (start && end) return `${start} – ${end}`
  return start || end
}

function eduPeriod(edu) {
  if (!edu.startYear && !edu.endYear) return ''
  if (edu.startYear && edu.endYear) return `${edu.startYear} – ${edu.endYear}`
  return edu.startYear || edu.endYear
}

const IconMail = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/>
    <path d="M1.5 5.5l6.5 4 6.5-4" strokeLinejoin="round"/>
  </svg>
)
const IconPhone = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M3 2.5h3l1.5 3-1.5 1.5a8 8 0 003 3L10.5 8.5l3 1.5V13a1 1 0 01-1 1C5.5 14 2 8.5 2 3.5a1 1 0 011-1z"/>
  </svg>
)
const IconLocation = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M8 1.5C5.79 1.5 4 3.29 4 5.5c0 3.25 4 9 4 9s4-5.75 4-9c0-2.21-1.79-4-4-4z"/>
    <circle cx="8" cy="5.5" r="1.5"/>
  </svg>
)
const IconLink = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M6.5 9.5a3.536 3.536 0 005 0l2-2a3.536 3.536 0 00-5-5l-1 1"/>
    <path d="M9.5 6.5a3.536 3.536 0 00-5 0l-2 2a3.536 3.536 0 005 5l1-1"/>
  </svg>
)

function ContactItem({ icon, value }) {
  if (!value) return null
  return <span className="cv-contact-item">{icon}{value}</span>
}

// ══════════════════════════════════════════════════════════════════════
// EXECUTIVE TEMPLATE (two-column, corporate)
// ══════════════════════════════════════════════════════════════════════
function ExecutiveTemplate({ data, cvRef }) {
  const { personal, summary, experience, education, skills } = data
  const hasExp = experience.some(e => e.role || e.company)
  const hasEdu = education.some(e => e.degree || e.school)
  const hasSkills = skills.some(s => s.items.length > 0)

  return (
    <div className="cv-page cv-executive" ref={cvRef}>
      <div className="exec-sidebar">
        {personal.photo && (
          <img className="exec-photo" src={personal.photo} alt="" />
        )}

        <div className="exec-section">
          <div className="exec-section-title">Contact</div>
          <div className="exec-contacts">
            {personal.email && (
              <div className="exec-contact-item"><IconMail /><span>{personal.email}</span></div>
            )}
            {personal.phone && (
              <div className="exec-contact-item"><IconPhone /><span>{personal.phone}</span></div>
            )}
            {personal.location && (
              <div className="exec-contact-item"><IconLocation /><span>{personal.location}</span></div>
            )}
            {personal.linkedin && (
              <div className="exec-contact-item"><IconLink /><span>{personal.linkedin}</span></div>
            )}
            {personal.website && (
              <div className="exec-contact-item"><IconLink /><span>{personal.website}</span></div>
            )}
          </div>
        </div>

        {hasSkills && (
          <div className="exec-section">
            <div className="exec-section-title">Skills</div>
            {skills.filter(s => s.items.length > 0).map(skill => (
              <div key={skill.id} className="exec-skill-group">
                {skill.category && <div className="exec-skill-category">{skill.category}</div>}
                <div className="exec-skill-items">{skill.items.join(' · ')}</div>
              </div>
            ))}
          </div>
        )}

        {hasEdu && (
          <div className="exec-section">
            <div className="exec-section-title">Education</div>
            {education.filter(e => e.degree || e.school).map(edu => (
              <div key={edu.id} className="exec-edu-entry">
                <div className="exec-edu-degree">{edu.degree}</div>
                {edu.school && <div className="exec-edu-school">{edu.school}</div>}
                {eduPeriod(edu) && <div className="exec-edu-period">{eduPeriod(edu)}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="exec-main">
        <div className="exec-header">
          {personal.name
            ? <div className="exec-name">{personal.name}</div>
            : <div className="exec-name exec-name--empty">Your Name</div>
          }
          {personal.jobTitle && <div className="exec-job-title">{personal.jobTitle}</div>}
        </div>

        {summary && (
          <div className="exec-main-section">
            <div className="exec-main-section-title">Profile</div>
            <p className="exec-summary">{summary}</p>
          </div>
        )}

        {hasExp && (
          <div className="exec-main-section">
            <div className="exec-main-section-title">Experience</div>
            {experience.filter(e => e.role || e.company).map(exp => (
              <div key={exp.id} className="exec-entry">
                <div className="exec-entry-header">
                  <span className="exec-entry-role">{exp.role}</span>
                  {expPeriod(exp) && <span className="exec-entry-period">{expPeriod(exp)}</span>}
                </div>
                {(exp.company || exp.location) && (
                  <div className="exec-entry-sub">
                    {exp.company && <span className="exec-entry-company">{exp.company}</span>}
                    {exp.location && <span className="exec-entry-location">{exp.location}</span>}
                  </div>
                )}
                {exp.bullets.filter(b => b.trim()).length > 0 && (
                  <ul className="exec-bullets">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// VIBRANT TEMPLATE (gradient sidebar, artistic)
// ══════════════════════════════════════════════════════════════════════
function VibrantTemplate({ data, cvRef }) {
  const { personal, summary, experience, education, skills } = data
  const hasExp = experience.some(e => e.role || e.company)
  const hasEdu = education.some(e => e.degree || e.school)
  const hasSkills = skills.some(s => s.items.length > 0)

  return (
    <div className="cv-page cv-vibrant" ref={cvRef}>
      <div className="vibrant-sidebar">
        {personal.photo && (
          <img className="vibrant-photo" src={personal.photo} alt="" />
        )}

        <div className="vibrant-name">
          {personal.name || <span style={{ opacity: 0.4 }}>Your Name</span>}
        </div>

        <div className="vibrant-contact-list">
          {personal.email && (
            <div className="vibrant-contact-item"><IconMail /><span>{personal.email}</span></div>
          )}
          {personal.phone && (
            <div className="vibrant-contact-item"><IconPhone /><span>{personal.phone}</span></div>
          )}
          {personal.location && (
            <div className="vibrant-contact-item"><IconLocation /><span>{personal.location}</span></div>
          )}
          {personal.linkedin && (
            <div className="vibrant-contact-item"><IconLink /><span>{personal.linkedin}</span></div>
          )}
          {personal.website && (
            <div className="vibrant-contact-item"><IconLink /><span>{personal.website}</span></div>
          )}
        </div>

        {hasSkills && (
          <div className="vibrant-skills-section">
            <div className="vibrant-sidebar-section-title">Skills</div>
            <div className="vibrant-skills-list">
              {skills.filter(s => s.items.length > 0).map(skill =>
                skill.items.map((item, i) => (
                  <span key={`${skill.id}-${i}`} className="vibrant-skill-pill">{item}</span>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="vibrant-main">
        {personal.jobTitle && (
          <div className="vibrant-job-title">{personal.jobTitle}</div>
        )}

        {summary && (
          <div className="vibrant-section">
            <div className="vibrant-section-title">Profile</div>
            <p className="vibrant-summary">{summary}</p>
          </div>
        )}

        {hasExp && (
          <div className="vibrant-section">
            <div className="vibrant-section-title">Experience</div>
            {experience.filter(e => e.role || e.company).map(exp => (
              <div key={exp.id} className="vibrant-entry">
                <div className="vibrant-entry-header">
                  <span className="vibrant-entry-role">{exp.role}</span>
                  {expPeriod(exp) && <span className="vibrant-entry-period">{expPeriod(exp)}</span>}
                </div>
                {(exp.company || exp.location) && (
                  <div className="vibrant-entry-sub">
                    {exp.company && <span className="vibrant-entry-company">{exp.company}</span>}
                    {exp.location && <span className="vibrant-entry-location">{exp.location}</span>}
                  </div>
                )}
                {exp.bullets.filter(b => b.trim()).length > 0 && (
                  <ul className="vibrant-bullets">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {hasEdu && (
          <div className="vibrant-section">
            <div className="vibrant-section-title">Education</div>
            {education.filter(e => e.degree || e.school).map(edu => (
              <div key={edu.id} className="vibrant-edu-entry">
                <div className="vibrant-edu-header">
                  <div>
                    <div className="vibrant-edu-degree">{edu.degree}</div>
                    {edu.school && <div className="vibrant-edu-school">{edu.school}</div>}
                  </div>
                  {eduPeriod(edu) && <span className="vibrant-entry-period">{eduPeriod(edu)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════
export default function CvPreview({ data, template = 'classic', cvRef }) {
  if (template === 'executive') return <ExecutiveTemplate data={data} cvRef={cvRef} />
  if (template === 'vibrant') return <VibrantTemplate data={data} cvRef={cvRef} />

  const { personal, summary, experience, education, skills } = data

  const hasExp = experience.some(e => e.role || e.company)
  const hasEdu = education.some(e => e.degree || e.school)
  const hasSkills = skills.some(s => s.items.length > 0)
  const hasContacts = personal.email || personal.phone || personal.location || personal.linkedin || personal.website

  return (
    <div className={`cv-page cv-${template}`} ref={cvRef}>
      <div className="cv-accent-bar" />
      <div className="cv-inner">

        <div className="cv-header">
          <div className="cv-header-text">
            {personal.name
              ? <div className="cv-name">{personal.name}</div>
              : <div className="cv-name cv-name--empty">Your Name</div>
            }
            {personal.jobTitle && <div className="cv-job-title">{personal.jobTitle}</div>}
          </div>
          {hasContacts && (
            <div className="cv-contacts">
              <ContactItem icon={<IconMail />} value={personal.email} />
              <ContactItem icon={<IconPhone />} value={personal.phone} />
              <ContactItem icon={<IconLocation />} value={personal.location} />
              <ContactItem icon={<IconLink />} value={personal.linkedin} />
              <ContactItem icon={<IconLink />} value={personal.website} />
            </div>
          )}
        </div>

        {summary && (
          <div className="cv-section">
            <div className="cv-section-title">Profile</div>
            <p className="cv-summary">{summary}</p>
          </div>
        )}

        {hasExp && (
          <div className="cv-section">
            <div className="cv-section-title">Experience</div>
            {experience.filter(e => e.role || e.company).map(exp => (
              <div className="cv-entry" key={exp.id}>
                <div className="cv-entry-header">
                  <span className="cv-entry-role">{exp.role}</span>
                  {expPeriod(exp) && <span className="cv-entry-period">{expPeriod(exp)}</span>}
                </div>
                {(exp.company || exp.location) && (
                  <div className="cv-entry-sub">
                    {exp.company && <span className="cv-entry-company">{exp.company}</span>}
                    {exp.location && <span className="cv-entry-location">{exp.location}</span>}
                  </div>
                )}
                {exp.bullets.filter(b => b.trim()).length > 0 && (
                  <ul className="cv-bullets">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {hasEdu && (
          <div className="cv-section">
            <div className="cv-section-title">Education</div>
            {education.filter(e => e.degree || e.school).map(edu => (
              <div className="cv-edu-entry" key={edu.id}>
                <div className="cv-edu-header">
                  <div>
                    <div className="cv-edu-degree">{edu.degree}</div>
                    {edu.school && <div className="cv-edu-school">{edu.school}</div>}
                    {edu.gpa && <div className="cv-edu-gpa">GPA: {edu.gpa}</div>}
                  </div>
                  {eduPeriod(edu) && <span className="cv-entry-period">{eduPeriod(edu)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasSkills && (
          <div className="cv-section">
            <div className="cv-section-title">Skills</div>
            <div className="cv-skills-grid">
              {skills.filter(s => s.items.length > 0).map(skill => (
                <div className="cv-skill-row" key={skill.id}>
                  {skill.category && <span className="cv-skill-category">{skill.category}</span>}
                  <span className="cv-skill-items">{skill.items.join(' · ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
