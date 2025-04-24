import express, {Request, Response} from 'express'
import * as dotenv from 'dotenv'
import * as mongoDb from 'mongodb'
import { connectDb, getDb } from './mongodb';

import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes';

async function main () {
    dotenv.config()
    const app = express();
    const port = 8080;

    await connectDb()

    const db: mongoDb.Db = getDb('blackjack')

    console.log(`successfully connected to ${db.databaseName} database`)

    app.use(express.json())
    app.use(cookieParser())

    app.get('/', (req: Request, res: Response) => {
        res.send('hi hi hi')
    })

    app.use('/auth', authRoutes)

    app.listen(port, () => {
        console.log(`listening on port ${port}`)
    })
}

main()