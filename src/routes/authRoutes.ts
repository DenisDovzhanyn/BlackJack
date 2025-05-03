import express, { Request, Response } from 'express'
import { login, register } from '../controllers/authenticationController'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)

export default router 