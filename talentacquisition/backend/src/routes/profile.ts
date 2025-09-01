import { Router } from 'express'

import { getUserProfile, updateUser, uploadResume, updateResume } from '../controllers/ProfileController.js'
import { upload } from '../middleware/uploads.js'

const router = Router()

router.put('/update-profile', updateUser)
router.get('/', getUserProfile)

router.post('/upload-resume', upload.single("resume"), uploadResume);
router.put('/update-resume', upload.single("resume"),updateResume)

export default router
