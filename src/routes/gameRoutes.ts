import express from 'express'
import { hit, placeBet } from '../controllers/gameController'
const router = express.Router()

router.post('/placebet', placeBet)
router.post('/hit', hit)

export default router