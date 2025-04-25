import { getDb } from "../mongodb";
import {User} from '../models/user'
import * as mongoDb from 'mongodb'
import { hash, randomBytes } from "crypto";

export const findByUsername = async (username: string) => {
    // connect/retrieve the user collection 
    const userCol: mongoDb.Collection = getDb('blackjack').collection('users')
    // try to find a user based on username
    return await userCol.findOne({username: username})
}

export const insertUser = async (username: string, password: string, cookie: string) => {
    // generate a salt which will be used with the base password to create
    // a hash
    const salt: string = randomBytes(128).toString('hex')
    // concatenate password and salt, then hash using sha-256 algorithm
    const hashedPassword: string = hash('sha-256', password + salt)

    // put data into an object of type User
    const user: User = {
        username: username,
        authorization: {
            password: hashedPassword,
            salt: salt,
            sessionToken: cookie
        },
        balance: 1000,
        totalProfits: 0
    }

    const userCol: mongoDb.Collection = getDb('blackjack').collection('users')
    // insert into mongodb and return the user id
    return await userCol.insertOne(user)
}

export const updateSession = async (username: string, cookie: string) => {
    const userCol: mongoDb.Collection = getDb('blackjack').collection('users')

    await userCol.updateOne(
        {username: username}, {
            $set: {
                authorization: {
                    sessionToken: cookie
                }
            }
        }
    )
}