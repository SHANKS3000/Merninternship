export function handleDemoFallback({ mode, role, data, setError, onLogin }) {
  if (mode === 'register' && role === 'admin') {
    setError('Administrator registration requires a configured API and valid invite code.')
    return true
  }

  if (mode === 'register' && role === 'student') {
    const student = {
      name: data.name,
      email: data.email,
      year: data.year,
      branch: data.branch,
      rollNumber: data.rollNumber || 'CS23-084',
    }
    localStorage.setItem('exam-demo-user', JSON.stringify(student))
    onLogin(student, null)
    return true
  }

  if (role === 'admin') {
    onLogin({ name: 'Campus Administrator', email: data.email, role: 'admin' }, null)
    return true
  }

  if (role === 'student') {
    const saved = localStorage.getItem('exam-demo-user')
    if (saved && JSON.parse(saved).email === data.email) {
      onLogin(JSON.parse(saved), null)
      return true
    }
    onLogin({ name: 'Aarav Mehta', email: 'aarav.mehta@northstar.edu', year: '3rd Year', branch: 'Computer Science', rollNumber: 'CS23-084', role: 'student' }, null)
    return true
  }

  setError('For the demo, use an email containing “admin”.')
  return true
}
