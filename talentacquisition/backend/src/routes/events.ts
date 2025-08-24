import { Router } from 'express'
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/EventsController.ts'

const router = Router()

router.post('/create', createEvent)

export default router
