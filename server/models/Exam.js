import mongoose from 'mongoose'

const examSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  year: { type: String, required: true, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
  branch: { type: String, required: true, trim: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  hall: { type: String, required: true, trim: true },
  status: { type: String, enum: ['scheduled', 'cancelled'], default: 'scheduled' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

examSchema.index({ year: 1, branch: 1, date: 1 })

export default mongoose.model('Exam', examSchema)
