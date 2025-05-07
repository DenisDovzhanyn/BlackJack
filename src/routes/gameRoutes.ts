import express from 'express'
import { doubleDown, hit, placeBet } from '../controllers/gameController'
const router = express.Router()

router.post('/placebet', placeBet)
router.post('/hit', hit)
router.post('/doubledown', doubleDown)
export default router