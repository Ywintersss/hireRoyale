import { Router } from 'express'
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/EventsController.ts'

const router = Router()

router.post('/create', createEvent)
router.get('/all', getEvents)

export default router
