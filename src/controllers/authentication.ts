import { Request, Response } from 'express'
import { findByUsername, insertUser } from '../db/user'

export const register = async (req: Request, res: Response) => {
    try {
        const {username, password} = req.body

        if (!username || !password) {
            res.sendStatus(400)
            return
        }

        const user = await findByUsername(username)

        if (user) {
            res.sendStatus(400)
            return
        }  
        
        const newUser = await insertUser(username, password)
        res.status(200).json(newUser).end()
    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }
}