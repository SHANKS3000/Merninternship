import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const studentYears = ['1st Year', '2nd Year', '3rd Year', '4th Year']

function issueSession(user) {
  const payload = { id: user._id.toString(), role: user.role, year: user.year, branch: user.branch }
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, year: user.year, branch: user.branch, rollNumber: user.rollNumber },
  }
}

export async function register(req, res) {
  const { name, email, password, role = 'student', year, branch, rollNumber, inviteCode } = req.body
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Name, email, and a password of at least 6 characters are required.' })
  }
  if (!['admin', 'student'].includes(role)) return res.status(400).json({ message: 'Choose a valid account role.' })
  if (role === 'admin' && (!process.env.ADMIN_INVITE_CODE || inviteCode !== process.env.ADMIN_INVITE_CODE)) {
    return res.status(403).json({ message: 'A valid administrator invite code is required.' })
  }
  if (role === 'student' && (!studentYears.includes(year) || !branch || !rollNumber)) {
    return res.status(400).json({ message: 'Academic year, branch, and roll number are required for students.' })
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash, role, year: role === 'student' ? year : undefined, branch: role === 'student' ? branch : undefined, rollNumber: role === 'student' ? rollNumber : undefined })
    return res.status(201).json(issueSession(user))
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' })
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message })
    throw error
  }
}

export async function login(req, res) {
  const { email, password, role } = req.body
  if (!email || !password || !['admin', 'student'].includes(role)) {
    return res.status(400).json({ message: 'Email, password, and account type are required.' })
  }
  const user = await User.findOne({ email: email.toLowerCase(), role }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' })
  }
  return res.json(issueSession(user))
}
