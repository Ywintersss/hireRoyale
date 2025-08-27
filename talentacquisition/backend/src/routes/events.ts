import { Router } from 'express'
import { getEvents, createEvent, updateEvent, deleteEvent, joinEvent, leaveEvent } from '../controllers/EventsController.ts'

const router = Router()

router.post('/join', joinEvent)
router.post('/create', createEvent)
router.put('/update/:eventId', updateEvent)
router.delete('/delete/:eventId', deleteEvent)
router.delete('/leave/:eventId', leaveEvent)
router.get('/all', getEvents)

export default router
