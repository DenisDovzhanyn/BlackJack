import express from 'express'
import { placeBet } from '../controllers/gameController'
const router = express.Router()

router.post('/placebet', placeBet)

export default router