import * as dotenv from 'dotenv'
import { connectDb } from './mongodb'
import app from './app';

async function main () {
    const port = 8000;
    dotenv.config()

    // establish connection to our mongodb server
    await connectDb()

    app.listen(port, () => {
        console.log(`server started on port: ${port}`)
    })
}

main()