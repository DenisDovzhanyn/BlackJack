import * as mongoDb from 'mongodb'
import * as dotenv from 'dotenv'

dotenv.config()

const client: mongoDb.MongoClient = new mongoDb.MongoClient(process.env.DB_CONN_STRING!)

export const connectDb = async () => {
    try {
        await client.connect()
    } catch (err) {
        console.log(err)
    }
}

export const getDb = (dbName: string) => {
    return client.db(dbName)
}