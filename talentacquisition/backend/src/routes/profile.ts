import { Router } from 'express'

import { getUserProfile, updateUser, uploadResume, updateResume } from '../controllers/ProfileController.ts'
import { upload } from '../middleware/uploads.ts'

const router = Router()

router.put('/update-profile', updateUser)
router.get('/', getUserProfile)

router.post('/upload-resume', upload.single("resume"), uploadResume);
router.put('/update-resume', upload.single("resume"),updateResume)

export default router
