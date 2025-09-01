import { Router } from 'express'
import { joinAndSyncEventLobbyConnection, leaveAndSyncEventLobbyConnection } from '../controllers/EventConnectionController.js'

const router = Router()

router.post('/join-lobby', joinAndSyncEventLobbyConnection)
router.post('/leave-lobby', leaveAndSyncEventLobbyConnection)

export default router
