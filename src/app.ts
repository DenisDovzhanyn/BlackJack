import express, {Request, Response} from 'express'
import * as dotenv from 'dotenv'
import * as mongoDb from 'mongodb'
import { connectDb, getDb } from './mongodb';

import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes';

async function main () {
    // load our secrets
    dotenv.config()
    const app = express();
    const port = 8080;

    // establish connection to our mongodb server
    await connectDb()

    const db: mongoDb.Db = getDb('blackjack')

    console.log(`successfully connected to ${db.databaseName} database`)

    // this makes all of our requests go through a cookie and body parser
    // if the contenttype in the req is json, it'll parse it for us and give us
    // a nice data structure which will let us easily access and look for fields
    // if there are cookies the cookie parser will help us with being able to use them

    app.use(express.json())
    app.use(cookieParser())

    app.get('/', (req: Request, res: Response) => {
        res.send('hi hi hi')
    })

    // if a request starts with '/auth' (like localhost:8080/auth) this'll
    // make the request go through a sub-app or 'route' which has paths related
    // to authentication, such as logging in or registering
    app.use('/auth', authRoutes)

    // spin up an http server listening on port 8080
    app.listen(port, () => {
        console.log(`listening on port ${port}`)
    })
}

main()