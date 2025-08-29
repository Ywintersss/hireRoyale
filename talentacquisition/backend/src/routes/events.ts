import { Router } from 'express'
import { getEvents, createEvent, updateEvent, deleteEvent, joinEvent, leaveEvent, createEventLobby } from '../controllers/EventsController.ts'

const router = Router()

router.post('/join', joinEvent)
router.post('/create', createEvent)
router.put('/update/:eventId', updateEvent)
router.delete('/delete/:eventId', deleteEvent)
router.delete('/leave/:eventId', leaveEvent)
router.get('/all', getEvents)

router.post('/create-lobby', createEventLobby)

export default router
