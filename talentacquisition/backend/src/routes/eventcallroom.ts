import { Router } from 'express'
import { UserConnectionController } from '../controllers/UserConnectionController.ts'

const router = Router()
export const connections = new UserConnectionController()
router.get('/get-room/:roomId', connections.getConnectionData)
router.post('/create-connection', connections.createConnection)
router.post('/create-room', connections.createRoom)

export default router
