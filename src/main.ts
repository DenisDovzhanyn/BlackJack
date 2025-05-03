import * as dotenv from 'dotenv'
import { connectDb } from './mongodb'
import app from './app';
import { connectToRedis } from './redis';


(async () => {
    const port = 8000;
    // establish connection to our mongodb server
    await connectDb()
    await connectToRedis()

    app.listen(port, () => {
        console.log(`server started on port: ${port}`)
    })
})()
