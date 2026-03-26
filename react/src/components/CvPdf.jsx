import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'

// ─── helpers ────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmy(val) {
  if (!val) return ''
  const [year, month] = val.split('-')
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`
}
function expPeriod(e) {
  const s = fmy(e.startDate)
  const end = e.isPresent ? 'Present' : fmy(e.endDate)
  if (s && end) return `${s} – ${end}`
  return s || end || ''
}
function eduPeriod(e) {
  if (e.startYear && e.endYear) return `${e.startYear} – ${e.endYear}`
  return e.startYear || e.endYear || ''
}

// ─── CLASSIC ────────────────────────────────────────────────────────────────

const cls = StyleSheet.create({
  page:         { fontFamily: 'Helvetica', backgroundColor: '#fff', paddingBottom: 40 },
  accentBar:    { height: 6, backgroundColor: '#2563eb' },
  inner:        { paddingHorizontal: 40, paddingTop: 28 },
  header:       { marginBottom: 18 },
  name:         { fontFamily: 'Helvetica-Bold', fontSize: 22, color: '#1e293b', marginBottom: 3 },
  jobTitle:     { fontSize: 11, color: '#64748b', marginBottom: 10 },
  contacts:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  contactItem:  { fontSize: 8, color: '#64748b' },
  divider:      { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginVertical: 12 },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#2563eb', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  entryRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  entryRole:    { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#1e293b' },
  period:       { fontSize: 8, color: '#94a3b8' },
  entrySub:     { fontSize: 9, color: '#64748b', marginBottom: 4 },
  bullet:       { fontSize: 9, color: '#374151', marginLeft: 10, marginBottom: 2 },
  summary:      { fontSize: 9.5, color: '#374151', lineHeight: 1.5 },
  section:      { marginBottom: 14 },
  eduDegree:    { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#1e293b' },
  eduSchool:    { fontSize: 9, color: '#64748b' },
  eduGpa:       { fontSize: 8, color: '#94a3b8' },
  skillRow:     { flexDirection: 'row', marginBottom: 3 },
  skillCat:     { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#374151', width: 80 },
  skillItems:   { fontSize: 9, color: '#64748b', flex: 1 },
})

function ClassicPdf({ data }) {
  const { personal, summary, experience, education, skills } = data
  const contacts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean)
  const exps = experience.filter(e => e.role || e.company)
  const edus = education.filter(e => e.degree || e.school)
  const skls = skills.filter(s => s.items.length > 0)

  return (
    <Page size="A4" style={cls.page}>
      <View style={cls.accentBar} />
      <View style={cls.inner}>
        <View style={cls.header}>
          <Text style={cls.name}>{personal.name || 'Your Name'}</Text>
          {personal.jobTitle ? <Text style={cls.jobTitle}>{personal.jobTitle}</Text> : null}
          {contacts.length > 0 && (
            <View style={cls.contacts}>
              {contacts.map((c, i) => <Text key={i} style={cls.contactItem}>{c}</Text>)}
            </View>
          )}
        </View>

        {summary ? (
          <View style={cls.section}>
            <Text style={cls.sectionTitle}>Profile</Text>
            <View style={cls.divider} />
            <Text style={cls.summary}>{summary}</Text>
          </View>
        ) : null}

        {exps.length > 0 && (
          <View style={cls.section}>
            <Text style={cls.sectionTitle}>Experience</Text>
            <View style={cls.divider} />
            {exps.map((exp, i) => (
              <View key={i} style={{ marginBottom: 10 }} wrap={false}>
                <View style={cls.entryRow}>
                  <Text style={cls.entryRole}>{exp.role}</Text>
                  {expPeriod(exp) ? <Text style={cls.period}>{expPeriod(exp)}</Text> : null}
                </View>
                {(exp.company || exp.location) ? (
                  <Text style={cls.entrySub}>{[exp.company, exp.location].filter(Boolean).join('  ·  ')}</Text>
                ) : null}
                {exp.bullets.filter(b => b.trim()).map((b, j) => (
                  <Text key={j} style={cls.bullet}>• {b}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {edus.length > 0 && (
          <View style={cls.section}>
            <Text style={cls.sectionTitle}>Education</Text>
            <View style={cls.divider} />
            {edus.map((edu, i) => (
              <View key={i} style={{ marginBottom: 8 }} wrap={false}>
                <View style={cls.entryRow}>
                  <Text style={cls.eduDegree}>{edu.degree}</Text>
                  {eduPeriod(edu) ? <Text style={cls.period}>{eduPeriod(edu)}</Text> : null}
                </View>
                {edu.school ? <Text style={cls.eduSchool}>{edu.school}</Text> : null}
                {edu.gpa ? <Text style={cls.eduGpa}>GPA: {edu.gpa}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {skls.length > 0 && (
          <View style={cls.section}>
            <Text style={cls.sectionTitle}>Skills</Text>
            <View style={cls.divider} />
            {skls.map((s, i) => (
              <View key={i} style={cls.skillRow}>
                {s.category ? <Text style={cls.skillCat}>{s.category}</Text> : null}
                <Text style={cls.skillItems}>{s.items.join(' · ')}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  )
}

// ─── MODERN ─────────────────────────────────────────────────────────────────

const mod = StyleSheet.create({
  page:         { fontFamily: 'Helvetica', backgroundColor: '#fff', paddingBottom: 40 },
  headerBg:     { backgroundColor: '#0f172a', paddingHorizontal: 40, paddingVertical: 28 },
  name:         { fontFamily: 'Helvetica-Bold', fontSize: 24, color: '#fff', marginBottom: 4 },
  jobTitle:     { fontSize: 11, color: '#94a3b8', marginBottom: 12 },
  contacts:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  contactItem:  { fontSize: 8, color: '#cbd5e1' },
  inner:        { paddingHorizontal: 40, paddingTop: 24 },
  section:      { marginBottom: 16 },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#6366f1', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 8, borderLeftWidth: 3, borderLeftColor: '#6366f1' },
  entryRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  entryRole:    { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#0f172a' },
  period:       { fontSize: 8, color: '#94a3b8' },
  entrySub:     { fontSize: 9, color: '#64748b', marginBottom: 4 },
  bullet:       { fontSize: 9, color: '#374151', marginLeft: 10, marginBottom: 2 },
  summary:      { fontSize: 9.5, color: '#374151', lineHeight: 1.5 },
  eduDegree:    { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#0f172a' },
  eduSchool:    { fontSize: 9, color: '#64748b' },
  eduGpa:       { fontSize: 8, color: '#94a3b8' },
  skillRow:     { flexDirection: 'row', marginBottom: 3 },
  skillCat:     { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#374151', width: 80 },
  skillItems:   { fontSize: 9, color: '#64748b', flex: 1 },
})

function ModernPdf({ data }) {
  const { personal, summary, experience, education, skills } = data
  const contacts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean)
  const exps = experience.filter(e => e.role || e.company)
  const edus = education.filter(e => e.degree || e.school)
  const skls = skills.filter(s => s.items.length > 0)

  return (
    <Page size="A4" style={mod.page}>
      <View style={mod.headerBg}>
        <Text style={mod.name}>{personal.name || 'Your Name'}</Text>
        {personal.jobTitle ? <Text style={mod.jobTitle}>{personal.jobTitle}</Text> : null}
        {contacts.length > 0 && (
          <View style={mod.contacts}>
            {contacts.map((c, i) => <Text key={i} style={mod.contactItem}>{c}</Text>)}
          </View>
        )}
      </View>

      <View style={mod.inner}>
        {summary ? (
          <View style={mod.section}>
            <Text style={mod.sectionTitle}>Profile</Text>
            <Text style={mod.summary}>{summary}</Text>
          </View>
        ) : null}

        {exps.length > 0 && (
          <View style={mod.section}>
            <Text style={mod.sectionTitle}>Experience</Text>
            {exps.map((exp, i) => (
              <View key={i} style={{ marginBottom: 10 }} wrap={false}>
                <View style={mod.entryRow}>
                  <Text style={mod.entryRole}>{exp.role}</Text>
                  {expPeriod(exp) ? <Text style={mod.period}>{expPeriod(exp)}</Text> : null}
                </View>
                {(exp.company || exp.location) ? (
                  <Text style={mod.entrySub}>{[exp.company, exp.location].filter(Boolean).join('  ·  ')}</Text>
                ) : null}
                {exp.bullets.filter(b => b.trim()).map((b, j) => (
                  <Text key={j} style={mod.bullet}>• {b}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {edus.length > 0 && (
          <View style={mod.section}>
            <Text style={mod.sectionTitle}>Education</Text>
            {edus.map((edu, i) => (
              <View key={i} style={{ marginBottom: 8 }} wrap={false}>
                <View style={mod.entryRow}>
                  <Text style={mod.eduDegree}>{edu.degree}</Text>
                  {eduPeriod(edu) ? <Text style={mod.period}>{eduPeriod(edu)}</Text> : null}
                </View>
                {edu.school ? <Text style={mod.eduSchool}>{edu.school}</Text> : null}
                {edu.gpa ? <Text style={mod.eduGpa}>GPA: {edu.gpa}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {skls.length > 0 && (
          <View style={mod.section}>
            <Text style={mod.sectionTitle}>Skills</Text>
            {skls.map((s, i) => (
              <View key={i} style={mod.skillRow}>
                {s.category ? <Text style={mod.skillCat}>{s.category}</Text> : null}
                <Text style={mod.skillItems}>{s.items.join(' · ')}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  )
}

// ─── MINIMAL ─────────────────────────────────────────────────────────────────

const min = StyleSheet.create({
  page:         { fontFamily: 'Helvetica', backgroundColor: '#fff', paddingHorizontal: 52, paddingTop: 48, paddingBottom: 40 },
  name:         { fontFamily: 'Helvetica-Bold', fontSize: 26, color: '#111827', marginBottom: 3 },
  jobTitle:     { fontSize: 11, color: '#6b7280', marginBottom: 10 },
  contacts:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  contactItem:  { fontSize: 8, color: '#9ca3af' },
  section:      { marginBottom: 18 },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#111827', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  divider:      { borderBottomWidth: 0.5, borderBottomColor: '#d1d5db', marginBottom: 10 },
  entryRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  entryRole:    { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#111827' },
  period:       { fontSize: 8, color: '#9ca3af' },
  entrySub:     { fontSize: 9, color: '#6b7280', marginBottom: 4 },
  bullet:       { fontSize: 9, color: '#374151', marginLeft: 10, marginBottom: 2 },
  summary:      { fontSize: 9.5, color: '#374151', lineHeight: 1.6 },
  eduDegree:    { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#111827' },
  eduSchool:    { fontSize: 9, color: '#6b7280' },
  eduGpa:       { fontSize: 8, color: '#9ca3af' },
  skillRow:     { flexDirection: 'row', marginBottom: 3 },
  skillCat:     { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#374151', width: 90 },
  skillItems:   { fontSize: 9, color: '#6b7280', flex: 1 },
})

function MinimalPdf({ data }) {
  const { personal, summary, experience, education, skills } = data
  const contacts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean)
  const exps = experience.filter(e => e.role || e.company)
  const edus = education.filter(e => e.degree || e.school)
  const skls = skills.filter(s => s.items.length > 0)

  return (
    <Page size="A4" style={min.page}>
      <Text style={min.name}>{personal.name || 'Your Name'}</Text>
      {personal.jobTitle ? <Text style={min.jobTitle}>{personal.jobTitle}</Text> : null}
      {contacts.length > 0 && (
        <View style={min.contacts}>
          {contacts.map((c, i) => <Text key={i} style={min.contactItem}>{c}</Text>)}
        </View>
      )}

      {summary ? (
        <View style={min.section}>
          <Text style={min.sectionTitle}>Profile</Text>
          <View style={min.divider} />
          <Text style={min.summary}>{summary}</Text>
        </View>
      ) : null}

      {exps.length > 0 && (
        <View style={min.section}>
          <Text style={min.sectionTitle}>Experience</Text>
          <View style={min.divider} />
          {exps.map((exp, i) => (
            <View key={i} style={{ marginBottom: 10 }} wrap={false}>
              <View style={min.entryRow}>
                <Text style={min.entryRole}>{exp.role}</Text>
                {expPeriod(exp) ? <Text style={min.period}>{expPeriod(exp)}</Text> : null}
              </View>
              {(exp.company || exp.location) ? (
                <Text style={min.entrySub}>{[exp.company, exp.location].filter(Boolean).join('  ·  ')}</Text>
              ) : null}
              {exp.bullets.filter(b => b.trim()).map((b, j) => (
                <Text key={j} style={min.bullet}>• {b}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {edus.length > 0 && (
        <View style={min.section}>
          <Text style={min.sectionTitle}>Education</Text>
          <View style={min.divider} />
          {edus.map((edu, i) => (
            <View key={i} style={{ marginBottom: 8 }} wrap={false}>
              <View style={min.entryRow}>
                <Text style={min.eduDegree}>{edu.degree}</Text>
                {eduPeriod(edu) ? <Text style={min.period}>{eduPeriod(edu)}</Text> : null}
              </View>
              {edu.school ? <Text style={min.eduSchool}>{edu.school}</Text> : null}
              {edu.gpa ? <Text style={min.eduGpa}>GPA: {edu.gpa}</Text> : null}
            </View>
          ))}
        </View>
      )}

      {skls.length > 0 && (
        <View style={min.section}>
          <Text style={min.sectionTitle}>Skills</Text>
          <View style={min.divider} />
          {skls.map((s, i) => (
            <View key={i} style={min.skillRow}>
              {s.category ? <Text style={min.skillCat}>{s.category}</Text> : null}
              <Text style={min.skillItems}>{s.items.join(' · ')}</Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  )
}

// ─── EXECUTIVE ───────────────────────────────────────────────────────────────

const exec = StyleSheet.create({
  page:           { fontFamily: 'Helvetica', backgroundColor: '#fff', flexDirection: 'row', paddingBottom: 40 },
  sidebar:        { width: 168, backgroundColor: '#1e293b', paddingHorizontal: 18, paddingTop: 32, paddingBottom: 40 },
  photo:          { width: 80, height: 80, borderRadius: 4, marginBottom: 20, alignSelf: 'center' },
  sideSection:    { marginBottom: 20 },
  sideSectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#fbbf24', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, borderBottomWidth: 0.5, borderBottomColor: '#334155', paddingBottom: 4 },
  contactItem:    { fontSize: 8, color: '#cbd5e1', marginBottom: 5, lineHeight: 1.4 },
  skillGroup:     { marginBottom: 8 },
  skillCat:       { fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#94a3b8', marginBottom: 2 },
  skillItems:     { fontSize: 8, color: '#cbd5e1' },
  eduDegree:      { fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: '#f1f5f9', marginBottom: 1 },
  eduSchool:      { fontSize: 7.5, color: '#94a3b8', marginBottom: 1 },
  eduPeriod:      { fontSize: 7, color: '#64748b' },
  main:           { flex: 1, paddingHorizontal: 28, paddingTop: 32 },
  mainHeader:     { marginBottom: 20 },
  name:           { fontFamily: 'Helvetica-Bold', fontSize: 22, color: '#1e293b', marginBottom: 4 },
  jobTitle:       { fontSize: 11, color: '#3b82f6' },
  mainSection:    { marginBottom: 14 },
  mainSectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#1e293b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4 },
  entryRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  entryRole:      { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#1e293b' },
  period:         { fontSize: 8, color: '#94a3b8' },
  entrySub:       { fontSize: 9, color: '#64748b', marginBottom: 3 },
  bullet:         { fontSize: 9, color: '#374151', marginLeft: 8, marginBottom: 2 },
  summary:        { fontSize: 9.5, color: '#374151', lineHeight: 1.5 },
})

function ExecutivePdf({ data }) {
  const { personal, summary, experience, education, skills } = data
  const contacts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean)
  const exps = experience.filter(e => e.role || e.company)
  const edus = education.filter(e => e.degree || e.school)
  const skls = skills.filter(s => s.items.length > 0)

  return (
    <Page size="A4" style={exec.page}>
      {/* Sidebar */}
      <View style={exec.sidebar}>
        {personal.photo ? <Image style={exec.photo} src={personal.photo} /> : null}

        {contacts.length > 0 && (
          <View style={exec.sideSection}>
            <Text style={exec.sideSectionTitle}>Contact</Text>
            {contacts.map((c, i) => <Text key={i} style={exec.contactItem}>{c}</Text>)}
          </View>
        )}

        {skls.length > 0 && (
          <View style={exec.sideSection}>
            <Text style={exec.sideSectionTitle}>Skills</Text>
            {skls.map((s, i) => (
              <View key={i} style={exec.skillGroup}>
                {s.category ? <Text style={exec.skillCat}>{s.category}</Text> : null}
                <Text style={exec.skillItems}>{s.items.join(' · ')}</Text>
              </View>
            ))}
          </View>
        )}

        {edus.length > 0 && (
          <View style={exec.sideSection}>
            <Text style={exec.sideSectionTitle}>Education</Text>
            {edus.map((edu, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={exec.eduDegree}>{edu.degree}</Text>
                {edu.school ? <Text style={exec.eduSchool}>{edu.school}</Text> : null}
                {eduPeriod(edu) ? <Text style={exec.eduPeriod}>{eduPeriod(edu)}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Main */}
      <View style={exec.main}>
        <View style={exec.mainHeader}>
          <Text style={exec.name}>{personal.name || 'Your Name'}</Text>
          {personal.jobTitle ? <Text style={exec.jobTitle}>{personal.jobTitle}</Text> : null}
        </View>

        {summary ? (
          <View style={exec.mainSection}>
            <Text style={exec.mainSectionTitle}>Profile</Text>
            <Text style={exec.summary}>{summary}</Text>
          </View>
        ) : null}

        {exps.length > 0 && (
          <View style={exec.mainSection}>
            <Text style={exec.mainSectionTitle}>Experience</Text>
            {exps.map((exp, i) => (
              <View key={i} style={{ marginBottom: 10 }} wrap={false}>
                <View style={exec.entryRow}>
                  <Text style={exec.entryRole}>{exp.role}</Text>
                  {expPeriod(exp) ? <Text style={exec.period}>{expPeriod(exp)}</Text> : null}
                </View>
                {(exp.company || exp.location) ? (
                  <Text style={exec.entrySub}>{[exp.company, exp.location].filter(Boolean).join('  ·  ')}</Text>
                ) : null}
                {exp.bullets.filter(b => b.trim()).map((b, j) => (
                  <Text key={j} style={exec.bullet}>• {b}</Text>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  )
}

// ─── VIBRANT ─────────────────────────────────────────────────────────────────

const vib = StyleSheet.create({
  page:           { fontFamily: 'Helvetica', backgroundColor: '#fff', flexDirection: 'row', paddingBottom: 40 },
  sidebar:        { width: 172, backgroundColor: '#7c3aed', paddingHorizontal: 18, paddingTop: 32, paddingBottom: 40 },
  photo:          { width: 72, height: 72, borderRadius: 36, marginBottom: 14, alignSelf: 'center', borderWidth: 2, borderColor: '#fff' },
  sidebarName:    { fontFamily: 'Helvetica-Bold', fontSize: 14, color: '#fff', textAlign: 'center', marginBottom: 16 },
  contactItem:    { fontSize: 8, color: '#ede9fe', marginBottom: 5 },
  sideSection:    { marginTop: 16 },
  sideSectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#c4b5fd', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  pill:           { fontSize: 8, color: '#7c3aed', backgroundColor: '#ede9fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginRight: 4, marginBottom: 4 },
  pillsRow:       { flexDirection: 'row', flexWrap: 'wrap' },
  main:           { flex: 1, paddingHorizontal: 28, paddingTop: 32 },
  jobTitle:       { fontSize: 13, color: '#7c3aed', fontFamily: 'Helvetica-Bold', marginBottom: 20 },
  section:        { marginBottom: 14 },
  sectionTitle:   { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#7c3aed', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, borderBottomWidth: 1.5, borderBottomColor: '#ede9fe', paddingBottom: 4 },
  entryRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  entryRole:      { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#1e1b4b' },
  period:         { fontSize: 8, color: '#a78bfa' },
  entrySub:       { fontSize: 9, color: '#6b7280', marginBottom: 3 },
  bullet:         { fontSize: 9, color: '#374151', marginLeft: 8, marginBottom: 2 },
  summary:        { fontSize: 9.5, color: '#374151', lineHeight: 1.5 },
  eduDegree:      { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#1e1b4b' },
  eduSchool:      { fontSize: 9, color: '#6b7280' },
  eduGpa:         { fontSize: 8, color: '#9ca3af' },
})

function VibrantPdf({ data }) {
  const { personal, summary, experience, education, skills } = data
  const contacts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean)
  const exps = experience.filter(e => e.role || e.company)
  const edus = education.filter(e => e.degree || e.school)
  const allSkills = skills.filter(s => s.items.length > 0).flatMap(s => s.items)

  return (
    <Page size="A4" style={vib.page}>
      {/* Sidebar */}
      <View style={vib.sidebar}>
        {personal.photo ? <Image style={vib.photo} src={personal.photo} /> : null}
        <Text style={vib.sidebarName}>{personal.name || 'Your Name'}</Text>

        {contacts.map((c, i) => <Text key={i} style={vib.contactItem}>{c}</Text>)}

        {allSkills.length > 0 && (
          <View style={vib.sideSection}>
            <Text style={vib.sideSectionTitle}>Skills</Text>
            <View style={vib.pillsRow}>
              {allSkills.map((item, i) => (
                <Text key={i} style={vib.pill}>{item}</Text>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Main */}
      <View style={vib.main}>
        {personal.jobTitle ? <Text style={vib.jobTitle}>{personal.jobTitle}</Text> : null}

        {summary ? (
          <View style={vib.section}>
            <Text style={vib.sectionTitle}>Profile</Text>
            <Text style={vib.summary}>{summary}</Text>
          </View>
        ) : null}

        {exps.length > 0 && (
          <View style={vib.section}>
            <Text style={vib.sectionTitle}>Experience</Text>
            {exps.map((exp, i) => (
              <View key={i} style={{ marginBottom: 10 }} wrap={false}>
                <View style={vib.entryRow}>
                  <Text style={vib.entryRole}>{exp.role}</Text>
                  {expPeriod(exp) ? <Text style={vib.period}>{expPeriod(exp)}</Text> : null}
                </View>
                {(exp.company || exp.location) ? (
                  <Text style={vib.entrySub}>{[exp.company, exp.location].filter(Boolean).join('  ·  ')}</Text>
                ) : null}
                {exp.bullets.filter(b => b.trim()).map((b, j) => (
                  <Text key={j} style={vib.bullet}>• {b}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {edus.length > 0 && (
          <View style={vib.section}>
            <Text style={vib.sectionTitle}>Education</Text>
            {edus.map((edu, i) => (
              <View key={i} style={{ marginBottom: 8 }} wrap={false}>
                <View style={vib.entryRow}>
                  <Text style={vib.eduDegree}>{edu.degree}</Text>
                  {eduPeriod(edu) ? <Text style={vib.period}>{eduPeriod(edu)}</Text> : null}
                </View>
                {edu.school ? <Text style={vib.eduSchool}>{edu.school}</Text> : null}
                {edu.gpa ? <Text style={vib.eduGpa}>GPA: {edu.gpa}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  )
}

// ─── ROOT DOCUMENT ───────────────────────────────────────────────────────────

export default function CvDocument({ data, template }) {
  return (
    <Document>
      {template === 'modern'    && <ModernPdf    data={data} />}
      {template === 'minimal'   && <MinimalPdf   data={data} />}
      {template === 'executive' && <ExecutivePdf data={data} />}
      {template === 'vibrant'   && <VibrantPdf   data={data} />}
      {(template === 'classic' || !template) && <ClassicPdf data={data} />}
    </Document>
  )
}
