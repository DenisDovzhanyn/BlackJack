import { Request, Response } from 'express'
import { findByUsername, insertUser } from '../db/user'

export const register = async (req: Request, res: Response) => {
    try {
        // we will try to pull the username and password from the body
        const {username, password} = req.body
        // if one is missing we will send 400 status code and return
        if (!username || !password) {
            res.sendStatus(400)
            return
        }

        // if we find a user by the same username, we send 400 and return
        const user = await findByUsername(username)

        if (user) {
            res.sendStatus(400)
            return
        }  
        
        // if no existing user we insert a new user into our user collection
        // and send the user id returned back ( subject to change )
        const newUser = await insertUser(username, password)
        res.status(200).json(newUser).end()
    } catch (err) {
        // if any error happens we send a 400 status code
        console.log(err)
        res.sendStatus(400)
    }
}