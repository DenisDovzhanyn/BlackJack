import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId,
    username: string,
    authorization: {
        password: string,
        salt: string
    },
    balance: number | 1000,
    totalProfits: number | 0 
}