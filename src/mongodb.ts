import * as mongoDb from 'mongodb'
import * as dotenv from 'dotenv'

dotenv.config()

const client: mongoDb.MongoClient = new mongoDb.MongoClient(process.env.DB_CONN_STRING!)

// establish a connection to the cluster
export const connectDb = async () => {
    try {
        await client.connect()
    } catch (err) {
        console.log(err)
    }
}

// get database by database name
export const getDb = (dbName: string) => {
    return client.db(dbName)
}

// this is done this way so that the mongodb can be accessed throughout
// the entire application