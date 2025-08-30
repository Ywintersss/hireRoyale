import { Router } from 'express'
import { scoreResumes } from '../controllers/ShortlistController.ts'

const router = Router()

router.post('/score', scoreResumes)

export default router




