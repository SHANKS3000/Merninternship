import { Router } from 'express'
import { cancelExam, createExam, deleteExam, listExams } from '../controllers/examController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/', listExams)
router.post('/', requireAdmin, createExam)
router.patch('/:id/cancel', requireAdmin, cancelExam)
router.delete('/:id', requireAdmin, deleteExam)

export default router
