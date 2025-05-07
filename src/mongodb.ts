import * as mongoDb from 'mongodb'

const client: mongoDb.MongoClient = new mongoDb.MongoClient(process.env.DB_CONN_STRING!)

//* establish a connection to the cluster
export const connectDb = async () => {
    try {
        await client.connect()
        console.log(`connected to database client`)
    } catch (err) {
        console.log(err)
    }
}

// get database by database name
export const getDb = (dbName: string) => {
    return client.db(dbName)
}

export const closeConnection = async () => {
    return await client.close()
}
//* this is done this way so that the mongodb can be accessed throughout
//* the entire application