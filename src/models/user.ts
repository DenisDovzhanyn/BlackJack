import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId,
    username: string,
    authorization: {
        password: string,
        salt: string,
        sessionToken?: string
    },
    balance: number,
    totalProfits: number
}