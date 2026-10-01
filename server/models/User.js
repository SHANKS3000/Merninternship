import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'student'], required: true },
  year: { type: String, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
  branch: { type: String, trim: true },
  rollNumber: { type: String, trim: true },
}, { timestamps: true })

export default mongoose.model('User', userSchema)
