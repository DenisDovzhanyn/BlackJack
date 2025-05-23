import { Request, Response } from 'express'
import { findByUsername, insertUser, updateSession } from '../db/user'
import { hash, randomBytes } from 'crypto'
import { User } from '../models/user'

export const register = async (req: Request, res: Response) => {
    try {
        const {username, password} = req.body
        //* we will try to pull the username and password from the body
        //* if one is missing we will send 400 status code and return
        if (!username || !password) {
            res.status(422).json({error: 'Username or Password missing'})
            return
        }

        //* if we find a user by the same username, we send 400 and return
        const user: User | null = await findByUsername(username)

        if (user) {
            res.status(409).json({error: 'User already exists, sorry!'})
            return
        }  
        
        //* if no existing user we insert a new user into our user collection
        //* and send the user id returned back ( subject to change )
        const cookie = randomBytes(128).toString('hex')
        let newUser: User

        try {
            newUser = await insertUser(username, password, cookie)
        } catch (error) {
            res.status(500).json({error: 'Failed to create new user'}).end()
            return
        }

        console.log(`new user! ${username}`)
        res.status(201).cookie('sessionToken', cookie, {httpOnly: true}).json(newUser.serialize()).end()
    } catch (err) {
        //* if any error happens we send a 400 status code
        console.log(err)
        res.sendStatus(400)
    }
}


export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).json({error: 'Missing username or password'}).end()
        return
    }
    const user: User | null = await findByUsername(username)

    if (!user) {
        res.status(403).json({error: 'Incorrect username or password'}).end()
        return
    }

    const expectedPassword: string = user.authorization.password
    const hashedPassword: string = hash('sha-256', password + user.authorization.salt)
    
    if (expectedPassword != hashedPassword) {
        res.status(403).json({error: 'Incorrect username or password'}).end()
        return
    }

    const cookie: string = randomBytes(128).toString('hex')

    // we will try to update the users sessionToken in mongodb, if for whatever reason it fails we send a 400 and error
    if (!(await updateSession(username, cookie))) {
        res.status(400).json({error: 'There was an error logging you in'}).end()
        return
    }
    
    console.log(`${username} has logged in!`)
    res.status(200).cookie('sessionToken', cookie, {httpOnly: true}).json(user.serialize()).end()
}