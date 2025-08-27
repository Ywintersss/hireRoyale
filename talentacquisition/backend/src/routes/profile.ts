import { Router } from 'express'

import { getUserProfile, updateUser, uploadResume } from '../controllers/ProfileController.ts'
import { upload } from '../middleware/uploads.ts'

const router = Router()

router.put('/update-profile', updateUser)
router.get('/', getUserProfile)

router.post("/upload-resume", upload.single("resume"), uploadResume);

export default router
