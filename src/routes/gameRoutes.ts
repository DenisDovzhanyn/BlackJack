import express from 'express'
import { doubleDown, hit, insurance, placeBet, stand } from '../controllers/gameController'
const router = express.Router()

router.post('/placebet', placeBet)
router.post('/hit', hit)
router.post('/doubledown', doubleDown)
router.post('/insurance', insurance)
router.post('/stand', stand)
export default router