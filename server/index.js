import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import examRoutes from './routes/exams.js'
import { requireDatabase } from './middleware/database.js'

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '16kb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }))
app.use('/api/auth', requireDatabase, authRoutes)
app.use('/api/exams', requireDatabase, examRoutes)
app.use((error, _req, res, _next) => {
  void _next
  console.error(error)
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message })
  }
  return res.status(500).json({ message: 'Something went wrong. Please try again.' })
})

app.listen(port, () => console.log(`Exam portal API listening on http://localhost:${port}`))

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection failed:', error.message))
} else {
  console.warn('MONGO_URI is not set. API routes will return 503; browser demo mode remains available.')
}
