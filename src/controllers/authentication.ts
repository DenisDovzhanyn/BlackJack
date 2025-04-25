import { Request, Response } from 'express'
import { findByUsername, insertUser, updateSession } from '../db/user'
import { hash, randomBytes } from 'crypto'
import { User } from '../models/user'
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
        
        const cookie = randomBytes(128).toString('hex')
        const newUser = await insertUser(username, password, cookie)
        res.cookie('session', cookie).status(200).json(newUser).end()
    } catch (err) {
        // if any error happens we send a 400 status code
        console.log(err)
        res.sendStatus(400)
    }
}


export const login = async (req: Request, res: Response) => {
    const { username, password} = req.body

    if (!username || !password) {
        res.sendStatus(400)
        return
    }
    const user: User = await findByUsername(username) as User

    if (!user) {
        res.sendStatus(400)
        return
    }

    const expectedPassword: string = user.authorization.password
    const hashedPassword: string = hash('sha-256', password + user.authorization.salt)
    
    if (expectedPassword != hashedPassword) {
        res.sendStatus(403)
        return
    }

    const cookie: string = randomBytes(128).toString('hex')
    await updateSession(username, cookie)

    res.status(200).cookie('session', cookie).end()
}