import { getDb } from "../mongodb";
import { User, UserDocument} from '../models/user'
import * as mongoDb from 'mongodb'
import { hash, randomBytes } from "crypto";

const userCol: mongoDb.Collection = getDb(process.env.DB_NAME!).collection('users')

export const findByUsername = async (username: string): Promise<User | null> => {
    //* try to find a user based on username
    const foundUser =  await userCol.findOne( {username: {'$regex': username, '$options': 'i'} } )
    if (!foundUser) return null

    return new User(foundUser as UserDocument)
}

export const findById = async (userId: string): Promise<User | null> => {
    const _id = new mongoDb.ObjectId(userId)
    const foundUser = await userCol.findOne({_id})
    if (!foundUser) return null

    return new User(foundUser as UserDocument)
}

export const findBySession = async (sessionToken: string): Promise<User | null> => {
    const foundUser = await userCol.findOne( {authorization: { sessionToken: sessionToken }} )
    if (!foundUser) return null

    return new User(foundUser as UserDocument)
}

export const insertUser = async (username: string, password: string, cookie: string): Promise<User> => {
    const salt: string = randomBytes(128).toString('hex')
    const hashedPassword: string = hash('sha-256', password + salt)

    const user: User = new User({username, authorization: {password: hashedPassword, salt, sessionToken: cookie}})
    
    const resp = await userCol.insertOne(user)

    if(!resp.acknowledged) throw new Error()
    
    user.setId(resp.insertedId)
    return user
} 

export const deleteUser = async (username: string): Promise<boolean> => {
    return (await userCol.deleteOne({username: username})).acknowledged
}

export const updateSession = async (username: string, cookie: string): Promise<boolean> => {
    return (await userCol.updateOne(
        {username}, {
            $set: {
                "authorization.sessionToken": cookie
            }
        }
    )).acknowledged
}

export const updateBalanceAndTotalProfit = async (_id: mongoDb.ObjectId, amountAdded: number): Promise<User | null> => {
    const updatedUser =  await userCol.findOneAndUpdate(
        {_id}, {
            $inc: {
                balance: amountAdded,
                totalProfits: amountAdded
            }
        },
        {returnDocument: 'after'}
    ) 

    if (!updatedUser) return null

    return new User(updatedUser as UserDocument)
}