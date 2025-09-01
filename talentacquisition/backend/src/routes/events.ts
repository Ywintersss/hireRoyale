import { Router } from 'express'
import { getEvents, createEvent, updateEvent, deleteEvent, joinEvent, leaveEvent, getOneEvent, createEventLobby, createJobPosting, getJobs } from '../controllers/EventsController.js'

const router = Router()

router.post('/join', joinEvent)
router.post('/create', createEvent)
router.put('/update/:eventId', updateEvent)
router.delete('/delete/:eventId', deleteEvent)
router.delete('/leave/:eventId', leaveEvent)
router.get('/all', getEvents)
router.get('/fetch-one/:eventId', getOneEvent)
router.get('/get-jobs', getJobs)
router.post('/create-lobby', createEventLobby)
router.post('/job/:eventId', createJobPosting)


export default router
