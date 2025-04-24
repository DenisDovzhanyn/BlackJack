import express, { Request, Response } from 'express'
import { register } from '../controllers/authentication'
const router = express.Router()

router.post('/register', register)


export default router 