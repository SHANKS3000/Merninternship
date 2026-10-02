import test from 'node:test'
import assert from 'node:assert/strict'
import { handleDemoFallback } from './demoAuth.js'

test('student registration uses demo fallback when API is unavailable', () => {
  let storedValue = null
  let loggedInUser = null
  let loggedInToken = null
  const setError = () => {}
  const onLogin = (user, token) => {
    loggedInUser = user
    loggedInToken = token
  }

  global.localStorage = {
    setItem(key, value) {
      storedValue = `${key}:${value}`
    },
    getItem() {
      return null
    },
  }

  const result = handleDemoFallback({
    mode: 'register',
    role: 'student',
    data: {
      name: 'Test Student',
      email: 'student@example.com',
      year: '3rd Year',
      branch: 'Computer Science',
      rollNumber: 'CS23-101',
    },
    setError,
    onLogin,
  })

  assert.equal(result, true)
  assert.equal(storedValue.includes('exam-demo-user'), true)
  assert.equal(loggedInUser.email, 'student@example.com')
  assert.equal(loggedInToken, null)
})

test('admin login uses demo fallback for any email', () => {
  let loggedInUser = null
  const setError = () => {}
  const onLogin = (user) => {
    loggedInUser = user
  }

  global.localStorage = {
    setItem() {},
    getItem() {
      return null
    },
  }

  const result = handleDemoFallback({
    mode: 'login',
    role: 'admin',
    data: { email: 'shravan@northstar.edu', password: 'secret123' },
    setError,
    onLogin,
  })

  assert.equal(result, true)
  assert.equal(loggedInUser.role, 'admin')
  assert.equal(loggedInUser.email, 'shravan@northstar.edu')
})
