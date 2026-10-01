import Exam from '../models/Exam.js'

export async function listExams(req, res) {
  const filter = req.user.role === 'admin' ? {} : { status: 'scheduled' }
  if (req.user.role !== 'admin') {
    filter.year = req.user.year
    filter.branch = req.user.branch
  } else if (req.query.year) {
    filter.year = req.query.year
  }
  if (req.query.branch) filter.branch = req.query.branch
  const exams = await Exam.find(filter).sort({ date: 1, startTime: 1 }).lean()
  return res.json(exams)
}

export async function createExam(req, res) {
  const { subject, code, year, branch, date, startTime, endTime, hall } = req.body
  if (!subject || !code || !year || !branch || !date || !startTime || !endTime || !hall) {
    return res.status(400).json({ message: 'Complete all examination fields before publishing.' })
  }
  if (endTime <= startTime) return res.status(400).json({ message: 'End time must be later than start time.' })
  const exam = await Exam.create({ subject, code, year, branch, date, startTime, endTime, hall, createdBy: req.user.id })
  return res.status(201).json(exam)
}

export async function cancelExam(req, res) {
  const exam = await Exam.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true, runValidators: true })
  if (!exam) return res.status(404).json({ message: 'Examination not found.' })
  return res.json(exam)
}

export async function deleteExam(req, res) {
  const exam = await Exam.findByIdAndDelete(req.params.id)
  if (!exam) return res.status(404).json({ message: 'Examination not found.' })
  return res.status(204).end()
}
