import mongoose from 'mongoose'

export function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'The exam database is not connected yet.' })
  }
  next()
}
