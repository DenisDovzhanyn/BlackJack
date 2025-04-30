import { getDb } from "../mongodb";
import {User} from '../models/user'
import * as mongoDb from 'mongodb'
import { hash, randomBytes } from "crypto";

const DB_NAME = process.env.DB_NAME!

export const findByUsername = async (username: string) => {
    // connect/retrieve the user collection 
    const userCol: mongoDb.Collection = getDb(DB_NAME).collection('users')
    // try to find a user based on username
    return await userCol.findOne( {username: {'$regex': username, '$options': 'i'} } )
}

export const findBySession = async (sessionToken: string) => {
    const userCol: mongoDb.Collection = getDb(DB_NAME).collection('users')
    
    return await userCol.findOne( {authorization: { sessionToken: sessionToken }} )
}
export const insertUser = async (username: string, password: string, cookie: string) => {
    // generate a salt which will be used with the base password to create
    // a hash
    const salt: string = randomBytes(128).toString('hex')
    // concatenate password and salt, then hash using sha-256 algorithm
    const hashedPassword: string = hash('sha-256', password + salt)

    // put data into an object of type User
    const user: User = {
        username,
        authorization: {
            password: hashedPassword,
            salt: salt,
            sessionToken: cookie
        },
        balance: 1000,
        totalProfits: 0
    }

    const userCol: mongoDb.Collection = getDb(DB_NAME).collection('users')
    // insert into mongodb and return the user id
    return await userCol.insertOne(user)
}
export const deleteUser = async (username: string) => {
    const userCol: mongoDb.Collection = getDb(DB_NAME).collection('users')

    return await userCol.deleteOne({username: username})
}
export const updateSession = async (username: string, cookie: string) => {
    const userCol: mongoDb.Collection = getDb(DB_NAME).collection('users')

    await userCol.updateOne(
        {username}, {
            $set: {
                "authorization.sessionToken": cookie
            }
        }
    )
}

export const updateBalanceAndTotalProfit = async (cookie: string, amountAdded: number) => {
    const userCol: mongoDb.Collection  = getDb(DB_NAME).collection('users')

    await userCol.updateOne(
        {"authorization.sessionToken": cookie}, {
            $inc: {
                balance: amountAdded,
                totalProfits: amountAdded
            }
        }
    )
}