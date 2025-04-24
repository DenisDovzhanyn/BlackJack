import { getDb } from "../mongodb";
import {User} from '../models/user'
import * as mongoDb from 'mongodb'
import { hash, randomBytes } from "crypto";

export const findByUsername = async (username: string) => {
    const userCol: mongoDb.Collection = getDb('blackjack').collection('users')

    return await userCol.findOne({username: username})
}

export const insertUser = async (username: string, password: string) => {
    const salt: string = randomBytes(128).toString()
    const hashedPassword: string = hash('sha-256', password + salt)

    const user: User = {
        username: username,
        authorization: {
            password: hashedPassword,
            salt: salt
        },
        balance: 1000,
        totalProfits: 0
    }

    const userCol: mongoDb.Collection = getDb('blackjack').collection('users')

    return await userCol.insertOne(user)
}