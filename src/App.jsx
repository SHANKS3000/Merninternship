import { useEffect, useMemo, useState } from 'react'
import { Bell, CalendarDays, Check, ChevronRight, Clock3, Download, LayoutDashboard, LogOut, MapPin, Plus, Search, ShieldCheck, TicketCheck, Trash2, Users, X } from 'lucide-react'
import './App.css'

const initialExams = [
  { _id: '1', subject: 'Data Structures & Algorithms', code: 'CS301', year: '3rd Year', branch: 'Computer Science', date: '2026-10-12', startTime: '09:30', endTime: '12:30', hall: 'Block A · Room 204' },
  { _id: '2', subject: 'Database Management Systems', code: 'CS302', year: '3rd Year', branch: 'Computer Science', date: '2026-10-15', startTime: '09:30', endTime: '12:30', hall: 'Block C · Room 108' },
  { _id: '3', subject: 'Computer Networks', code: 'CS303', year: '3rd Year', branch: 'Computer Science', date: '2026-10-19', startTime: '14:00', endTime: '17:00', hall: 'Block A · Room 112' },
  { _id: '4', subject: 'Operating Systems', code: 'CS304', year: '3rd Year', branch: 'Computer Science', date: '2026-10-22', startTime: '09:30', endTime: '12:30', hall: 'Block B · Room 306' },
]
const demoUser = { name: 'Aarav Mehta', email: 'aarav.mehta@northstar.edu', year: '3rd Year', branch: 'Computer Science', rollNumber: 'CS23-084' }
const initialForm = { subject: '', code: '', year: '3rd Year', branch: 'Computer Science', date: '', startTime: '09:30', endTime: '12:30', hall: '' }
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const formatDate = (value, options = { month: 'short', day: 'numeric' }) => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', options)
const formatTime = (value) => new Date(`2000-01-01T${value}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const iconMap = { grid: LayoutDashboard, calendar: CalendarDays, ticket: TicketCheck, users: Users, plus: Plus, search: Search, bell: Bell, clock: Clock3, pin: MapPin, download: Download, logout: LogOut, close: X, trash: Trash2, check: Check, chevron: ChevronRight, shield: ShieldCheck }
function Icon({ name, size = 18 }) {
  const IconComponent = iconMap[name]
  return <IconComponent size={size} strokeWidth={1.7} aria-hidden="true"/>
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, role }) })
      if (response.ok) {
        const result = await response.json()
        onLogin(result.user, result.token)
        return
      }
      if (response.status !== 404 && response.status !== 503) {
        const result = await response.json()
        setError(result.message || 'Could not sign in. Check your details.')
        return
      }
    } catch { /* Run the local demo when the API is not running. */ }
    if (mode === 'register' && role === 'admin') {
      setError('Administrator registration requires a configured API and valid invite code.')
    } else if (mode === 'register' && role === 'student') {
      const student = { name: data.name, email: data.email, year: data.year, branch: data.branch, rollNumber: data.rollNumber || 'CS23-084' }
      localStorage.setItem('exam-demo-user', JSON.stringify(student))
      onLogin(student, null)
    } else if (role === 'admin' && data.email.toLowerCase().includes('admin')) {
      onLogin({ name: 'Campus Administrator', email: data.email }, null)
    } else if (role === 'student') {
      const saved = localStorage.getItem('exam-demo-user')
      if (saved && JSON.parse(saved).email === data.email) onLogin(JSON.parse(saved), null)
      else onLogin(demoUser, null)
    } else setError('For the demo, use an email containing “admin”.')
  }
  return <main className="auth-layout">
    <section className="auth-aside">
      <div className="brand brand-light"><span className="brand-mark"><Icon name="grid" size={19}/></span><span>northstar<span className="brand-dot">.</span></span></div>
      <div className="aside-copy"><p className="eyebrow">THE EXAM OFFICE</p><h1>One less thing<br/>to worry about.</h1><p>Your exam schedule and hall pass, together in one place. Know where to be, and when.</p></div>
      <div className="aside-footer"><span>ACADEMIC YEAR 2026—27</span><span>01 / 03</span></div>
      <div className="aside-decoration">N<span>✳</span></div>
    </section>
    <section className="auth-main">
      <div className="auth-topline"><span>Already have an account?</span><button className="text-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Create account' : 'Sign in'} <Icon name="chevron" size={14}/></button></div>
      <form className="auth-form" onSubmit={submit}>
        <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</p>
        <h2>{mode === 'login' ? 'Sign in to your portal' : 'Create your account'}</h2>
        <p className="form-lede">{mode === 'login' ? 'Enter your details to continue to the exam office.' : 'A few details, then your exam office is ready.'}</p>
        <div className="role-picker" aria-label="Choose account type">
          <button type="button" className={role === 'student' ? 'selected' : ''} onClick={() => setRole('student')}><Icon name="users" size={16}/> Student</button>
          <button type="button" className={role === 'admin' ? 'selected' : ''} onClick={() => setRole('admin')}><Icon name="shield" size={16}/> Administrator</button>
        </div>
        {mode === 'register' && <label>Full name<input name="name" required placeholder="e.g. Aarav Mehta" autoComplete="name"/></label>}
        <label>College email<input name="email" required type="email" placeholder={role === 'admin' ? 'admin@northstar.edu' : 'you@northstar.edu'} autoComplete="email"/></label>
        {mode === 'register' && role === 'admin' && <label>Administrator invite code<input name="inviteCode" required placeholder="Provided by your institution"/></label>}
        {mode === 'register' && role === 'student' && <>
          <label>Roll number<input name="rollNumber" required placeholder="e.g. CS23-084"/></label>
          <div className="field-row"><label>Academic year<select name="year" defaultValue="3rd Year"><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select></label><label>Branch<select name="branch" defaultValue="Computer Science"><option>Computer Science</option><option>Information Technology</option><option>Electronics</option><option>Mechanical</option><option>Civil</option></select></label></div>
        </>}
        <label>Password<input name="password" required type="password" minLength="6" placeholder="At least 6 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button auth-submit" type="submit">{mode === 'login' ? 'Continue to portal' : role === 'admin' ? 'Create administrator account' : 'Create student account'} <Icon name="chevron" size={17}/></button>
        <p className="auth-note"><Icon name="shield" size={14}/> Secure access for the Northstar campus community</p>
      </form>
      <div className="auth-copyright">© 2026 Northstar University <span>·</span> Registrar’s office</div>
    </section>
  </main>
}

function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem('exam-user')) } catch { return null } })
  const [token, setToken] = useState(() => sessionStorage.getItem('exam-token'))
  const [exams, setExams] = useState(() => { try { return JSON.parse(localStorage.getItem('exam-list')) || initialExams } catch { return initialExams } })
  const [view, setView] = useState('overview')
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(initialForm)
  const [notice, setNotice] = useState('')
  const isAdmin = user?.role === 'admin'
  const visibleExams = useMemo(() => exams.filter((exam) => (!user || isAdmin || (exam.year === user.year && exam.branch === user.branch)) && `${exam.subject} ${exam.code} ${exam.hall}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => a.date.localeCompare(b.date)), [exams, user, isAdmin, query])
  const upcoming = visibleExams.filter((exam) => exam.status !== 'cancelled' && exam.date >= '2026-10-01')
  const today = new Date('2026-10-01T00:00:00')
  const calendarStart = new Date(today.getFullYear(), today.getMonth(), 1).getDay()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const examDays = new Set(visibleExams.filter((exam) => exam.date.startsWith('2026-10')).map((exam) => Number(exam.date.slice(-2))))

  const finishLogin = (nextUser, nextToken) => {
    const normalized = { ...nextUser, role: nextUser.role || (nextUser.email?.toLowerCase().includes('admin') ? 'admin' : 'student') }
    setUser(normalized); setToken(nextToken); setView('overview'); sessionStorage.setItem('exam-user', JSON.stringify(normalized))
    if (nextToken) sessionStorage.setItem('exam-token', nextToken)
  }
  const logout = () => { setUser(null); setToken(null); sessionStorage.removeItem('exam-user'); sessionStorage.removeItem('exam-token') }
  const saveExams = (next) => { setExams(next); localStorage.setItem('exam-list', JSON.stringify(next)) }
  useEffect(() => {
    if (!token) return
    fetch('/api/exams', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((records) => { if (records) { setExams(records); localStorage.setItem('exam-list', JSON.stringify(records)) } })
      .catch(() => {})
  }, [token])
  const addExam = async (event) => {
    event.preventDefault()
    const exam = { ...form, subject: form.subject.trim(), code: form.code.trim().toUpperCase(), hall: form.hall.trim() }
    if (token) {
      try {
        const response = await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(exam) })
        if (response.ok) { const created = await response.json(); saveExams([...exams, created]); setForm(initialForm); setNotice('Exam added to the published timetable.'); return }
        const body = await response.json(); setNotice(body.message || 'Unable to publish exam.'); return
      } catch { setNotice('API unavailable. The exam was saved in this browser only.') }
    }
    saveExams([...exams, { ...exam, _id: crypto.randomUUID() }]); setForm(initialForm); setNotice('Exam added to the published timetable.')
  }
  const deleteExam = async (id) => {
    if (token) {
      try { await fetch(`/api/exams/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }) } catch { /* Keep local admin controls available in demo mode. */ }
    }
    saveExams(exams.filter((exam) => exam._id !== id)); setNotice('Exam removed from the timetable.')
  }
  const cancelExam = async (id) => {
    const exam = exams.find((item) => item._id === id)
    if (token) {
      try {
        const response = await fetch(`/api/exams/${id}/cancel`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
        if (!response.ok) { const body = await response.json(); setNotice(body.message || 'Unable to cancel exam.'); return }
      } catch { setNotice('API unavailable. The change was saved in this browser only.') }
    }
    saveExams(exams.map((item) => item._id === id ? { ...item, status: 'cancelled' } : item)); setNotice(`${exam?.subject || 'Exam'} cancelled.`)
  }
  const printPass = () => window.print()

  if (!user) return <AuthScreen onLogin={finishLogin}/>
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Icon name="grid" size={19}/></span><span>northstar<span className="brand-dot">.</span></span></div>
      <div className="workspace-label">CAMPUS PORTAL</div>
      <div className="nav-group-label">WORKSPACE</div>
      <nav className="side-nav">
        <button className={view === 'overview' ? 'active' : ''} onClick={() => setView('overview')}><Icon name="grid"/> Overview</button>
        <button className={view === 'timetable' ? 'active' : ''} onClick={() => setView('timetable')}><Icon name="calendar"/> Exam timetable <span className="nav-count">{visibleExams.length}</span></button>
        {!isAdmin && <button className={view === 'hallpass' ? 'active' : ''} onClick={() => setView('hallpass')}><Icon name="ticket"/> Exam hall pass</button>}
        {isAdmin && <button className={view === 'manage' ? 'active' : ''} onClick={() => setView('manage')}><Icon name="users"/> Manage exams</button>}
      </nav>
      <div className="sidebar-bottom"><div className="semester-card"><span className="semester-dot"/><div><strong>Fall semester</strong><small>Academic year 2026–27</small></div><span className="semester-more">···</span></div><button className="profile-row" onClick={logout}><span className="avatar">{user.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'NS'}</span><span className="profile-copy"><strong>{user.name || 'Campus member'}</strong><small>{isAdmin ? 'Administrator' : user.rollNumber || 'Student'}</small></span><Icon name="logout" size={17}/></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs">Campus <Icon name="chevron" size={14}/> <span>{view === 'manage' ? 'Manage exams' : view === 'hallpass' ? 'Exam hall pass' : view === 'timetable' ? 'Exam timetable' : 'Overview'}</span></div><div className="top-actions"><span className="term-pill"><span/> FALL 2026</span><button className="icon-button" title="Notifications"><Icon name="bell"/></button><span className="top-avatar">{user.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'NS'}</span></div></header>
      <div className="page-content">
        <div className="page-heading"><div><p className="eyebrow">{isAdmin ? 'EXAM OFFICE' : `GOOD MORNING, ${(user.name || 'STUDENT').split(' ')[0].toUpperCase()}`}</p><h1>{view === 'manage' ? 'Manage examinations' : view === 'hallpass' && !isAdmin ? 'Your exam hall pass' : view === 'timetable' ? 'Exam timetable' : isAdmin ? 'Examination overview' : 'Your semester, at a glance.'}</h1><p className="heading-sub">{isAdmin ? 'Publish, update, and keep the campus schedule in sync.' : `${user.year || '3rd Year'} · ${user.branch || 'Computer Science'} · Academic year 2026–27`}</p></div>{isAdmin && <button className="primary-button add-top" onClick={() => { setView('manage'); document.getElementById('exam-subject')?.focus() }}><Icon name="plus" size={17}/> Schedule an exam</button>}</div>
        {notice && <div className="notice" role="status"><Icon name="check" size={16}/>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice"><Icon name="close" size={15}/></button></div>}
        {view === 'manage' && isAdmin ? <section className="manage-layout">
          <div className="panel form-panel"><div className="panel-heading"><div><p className="eyebrow">NEW SCHEDULE</p><h2>Add an examination</h2></div><span className="form-icon"><Icon name="calendar"/></span></div><form className="exam-form" onSubmit={addExam}>
            <label>Subject name<input id="exam-subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures & Algorithms"/></label>
            <div className="field-row"><label>Subject code<input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS301"/></label><label>Academic year<select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select></label></div>
            <label>Branch<select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}><option>Computer Science</option><option>Information Technology</option><option>Electronics</option><option>Mechanical</option><option>Civil</option></select></label>
            <div className="field-row"><label>Exam date<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}/></label><label>Exam hall<input required value={form.hall} onChange={(e) => setForm({ ...form, hall: e.target.value })} placeholder="Block A · Room 204"/></label></div>
            <div className="field-row"><label>Start time<input required type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}/></label><label>End time<input required type="time" min={form.startTime} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}/></label></div>
            <button className="primary-button submit-exam" type="submit"><Icon name="plus" size={17}/> Publish examination</button>
          </form></div>
          <div className="panel scheduled-panel"><div className="list-toolbar"><div><p className="eyebrow">LIVE SCHEDULE</p><h2>All examinations <span className="subtle-count">{exams.length}</span></h2></div><label className="search-field"><Icon name="search" size={16}/><input aria-label="Search exams" placeholder="Search exams" value={query} onChange={(e) => setQuery(e.target.value)}/></label></div><ExamTable exams={visibleExams} admin onDelete={deleteExam} onCancel={cancelExam}/></div>
        </section> : view === 'hallpass' && !isAdmin ? <section className="pass-page"><div className="pass-toolbar"><p>Show this pass at the examination hall entrance.</p><button className="outline-button" onClick={printPass}><Icon name="download" size={16}/> Print / save pass</button></div><HallPass user={user} exams={upcoming}/><p className="pass-disclaimer">Your hall pass is valid only with your college ID. Please arrive at the exam hall 30 minutes before the scheduled start.</p></section> : <>
          <div className="stats-row"><StatCard label={isAdmin ? 'SCHEDULED EXAMS' : 'UPCOMING EXAMS'} value={upcoming.length} note={isAdmin ? 'Across all departments' : 'This semester'} icon="calendar" tone="green"/><StatCard label={isAdmin ? 'ACADEMIC YEARS' : 'FIRST EXAM'} value={isAdmin ? '4' : upcoming.length ? formatDate(upcoming[0].date, { month: 'short', day: 'numeric' }) : '—'} note={isAdmin ? 'Currently on the roster' : upcoming.length ? weekdays[new Date(`${upcoming[0].date}T00:00:00`).getDay()] : 'No exams scheduled'} icon="clock" tone="blue"/><StatCard label={isAdmin ? 'DEPARTMENTS' : 'YOUR BRANCH'} value={isAdmin ? '5' : 'CSE'} note={isAdmin ? 'With published exams' : user.branch || 'Computer Science'} icon="users" tone="coral"/></div>
          <div className="dashboard-grid"><section className="panel timetable-panel"><div className="list-toolbar"><div><p className="eyebrow">YOUR SCHEDULE</p><h2>{isAdmin ? 'Published examinations' : 'Upcoming examinations'}</h2></div><button className="link-button" onClick={() => setView('timetable')}>Full timetable <Icon name="chevron" size={15}/></button></div><ExamTable exams={visibleExams.slice(0, 4)} admin={isAdmin} onDelete={deleteExam} onCancel={cancelExam}/></section>
            <aside className="right-rail">{!isAdmin && <section className="hallpass-teaser"><div className="teaser-top"><div className="teaser-icon"><Icon name="ticket" size={19}/></div><span className="teaser-status"><span/> READY</span></div><p className="eyebrow">EXAM ACCESS</p><h2>Your hall pass is ready.</h2><p>All your upcoming exams and assigned halls, in one place.</p><button onClick={() => setView('hallpass')}>View hall pass <Icon name="chevron" size={15}/></button><div className="teaser-watermark">N<span>✳</span></div></section>}
              <section className="panel mini-calendar"><div className="calendar-heading"><div><p className="eyebrow">EXAM CALENDAR</p><h2>October 2026</h2></div><Icon name="calendar" size={18}/></div><div className="calendar-grid calendar-weekdays">{weekdays.map((day) => <span key={day}>{day[0]}</span>)}</div><div className="calendar-grid calendar-days">{Array.from({ length: calendarStart }, (_, index) => <span className="empty-day" key={`empty-${index}`}/>)}{Array.from({ length: daysInMonth }, (_, index) => <span className={examDays.has(index + 1) ? 'exam-day' : index + 1 === 1 ? 'today' : ''} key={index + 1}>{index + 1}{examDays.has(index + 1) && <i/>}</span>)}</div><div className="calendar-legend"><span><i className="legend-exam"/> Exam day</span><span><i className="legend-today"/> Today</span></div></section>
            </aside></div>
          {view === 'timetable' && <section className="panel full-timetable"><div className="list-toolbar"><div><p className="eyebrow">FALL SEMESTER 2026</p><h2>Complete exam schedule</h2></div><label className="search-field"><Icon name="search" size={16}/><input aria-label="Search exams" placeholder="Search exams" value={query} onChange={(e) => setQuery(e.target.value)}/></label></div><ExamTable exams={visibleExams} admin={isAdmin} onDelete={deleteExam} onCancel={cancelExam}/></section>}
        </>}
        <footer className="page-footer"><span>© 2026 Northstar University</span><span>Registrar’s office <i/> Examination services</span></footer>
      </div>
    </main>
  </div>
}

function StatCard({ label, value, note, icon, tone }) {
  return <section className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon}/></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-note">{note}</div></section>
}

function ExamTable({ exams, admin, onDelete, onCancel }) {
  return <div className="table-scroll"><table><thead><tr><th>EXAMINATION</th><th>DATE</th><th>TIME</th><th>HALL</th>{admin && <th><span className="sr-only">Actions</span></th>}</tr></thead><tbody>{exams.length ? exams.map((exam) => <tr key={exam._id} className={exam.status === 'cancelled' ? 'cancelled-row' : ''}><td><div className="subject-cell"><span className="subject-monogram">{exam.code.slice(0, 2)}</span><span><strong>{exam.subject}{exam.status === 'cancelled' && <span className="cancelled-label"> CANCELLED</span>}</strong><small>{exam.code} <i/> {exam.year} · {exam.branch}</small></span></div></td><td><span className="date-cell">{formatDate(exam.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span></td><td><span className="time-cell">{formatTime(exam.startTime)} – {formatTime(exam.endTime)}</span></td><td><span className="hall-cell"><Icon name="pin" size={14}/>{exam.hall}</span></td>{admin && <td><span className="table-actions">{exam.status !== 'cancelled' && <button className="cancel-button" title={`Cancel ${exam.subject}`} onClick={() => onCancel(exam._id)}><Icon name="close" size={14}/></button>}<button className="delete-button" title={`Remove ${exam.subject}`} onClick={() => onDelete(exam._id)}><Icon name="trash" size={15}/></button></span></td>}</tr>) : <tr><td className="empty-state" colSpan={admin ? 5 : 4}>No examinations match this view.</td></tr>}</tbody></table></div>
}

function HallPass({ user, exams }) {
  return <article className="hall-pass"><div className="pass-accent"/><div className="pass-header"><div className="brand"><span className="brand-mark"><Icon name="grid" size={18}/></span><span>northstar<span className="brand-dot">.</span></span></div><div className="pass-type"><span>OFFICIAL DOCUMENT</span><strong>EXAMINATION PASS</strong></div></div><div className="pass-student"><span className="pass-avatar">{user.name?.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><p className="eyebrow">CANDIDATE</p><h2>{user.name}</h2><p>{user.rollNumber || 'Student'} <i/> {user.year} · {user.branch}</p></div><div className="pass-valid"><span><Icon name="check" size={14}/></span> VALID FOR FALL 2026</div></div><div className="pass-exams-head"><div><p className="eyebrow">REGISTERED EXAMINATIONS</p><h3>{exams.length} examinations scheduled</h3></div><span>ACADEMIC YEAR 2026—27</span></div><div className="pass-exam-list">{exams.map((exam, index) => <div className="pass-exam-row" key={exam._id}><span className="pass-number">0{index + 1}</span><div className="pass-exam-name"><strong>{exam.subject}</strong><small>{exam.code}</small></div><div className="pass-exam-date"><strong>{formatDate(exam.date, { month: 'short', day: 'numeric', year: 'numeric' })}</strong><small>{weekdays[new Date(`${exam.date}T00:00:00`).getDay()]}</small></div><div className="pass-exam-time"><strong>{formatTime(exam.startTime)} – {formatTime(exam.endTime)}</strong><small>Reporting 30 min early</small></div><div className="pass-exam-hall"><Icon name="pin" size={15}/><span><strong>{exam.hall}</strong><small>Examination hall</small></span></div></div>)}{!exams.length && <p className="no-pass-exams">There are no upcoming exams on your schedule.</p>}</div><div className="pass-bottom"><div><Icon name="shield" size={17}/><span>Issued by the Office of the Registrar<small>Northstar University · Examination services</small></span></div><div className="pass-id">PASS ID <strong>{(user.rollNumber || 'NSU-2026').replace(/[^a-z0-9]/gi, '').toUpperCase()}-F26</strong></div></div></article>
}

export default App
