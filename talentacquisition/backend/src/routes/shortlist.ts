import { Router } from 'express'
import { scoreResumes } from '../controllers/ShortlistController.js'

const router = Router()

router.post('/score', scoreResumes)

export default router




