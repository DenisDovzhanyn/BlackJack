import { ObjectId } from "mongodb";

export interface UserDTO {
    id: ObjectId;
    username: string;
    balance: number;
    totalProfits: number;
}

export interface UserDocument {
    _id?: ObjectId,
    username: string,
    authorization: {
        password: string,
        salt: string,
        sessionToken: string
    },
    balance?: number,
    totalProfits?: number
}

export class User {
    _id?: ObjectId;
    username: string;
    authorization: {
        password: string;
        salt: string;
        sessionToken?: string;
    };
    balance: number;
    totalProfits: number;

    constructor({
        _id,
        username, 
        authorization: {password, salt, sessionToken}, 
        balance = 1000, 
        totalProfits = 0 
    }: UserDocument ) {   
        this._id = _id
        this.username = username
        this.authorization = {
            password,
            salt,
            sessionToken
        }
        this.balance = balance
        this.totalProfits = totalProfits
    }

    setId(id: ObjectId): void {
        this._id = id
    }

    serialize(): UserDTO {
        return {
            id: this._id!,
            username: this.username,
            balance: this.balance,
            totalProfits: this.totalProfits
        }
    }
}