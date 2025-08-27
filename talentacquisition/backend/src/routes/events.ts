import { Router } from 'express'
import { getEvents, createEvent, updateEvent, deleteEvent, joinEvent } from '../controllers/EventsController.ts'

const router = Router()

router.post('/join', joinEvent)
router.post('/create', createEvent)
router.put('/update/:eventId', updateEvent)
router.delete('/delete/:eventId', deleteEvent)
router.get('/all', getEvents)

export default router
