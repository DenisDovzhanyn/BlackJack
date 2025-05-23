
import { connectDb } from './mongodb'
import app from './app';
import { connectToRedis } from './redis';


(async () => {
    //* establish connection to our mongodb server
    await connectDb()
    await connectToRedis()
    app.listen(process.env.PORT, () => {
        console.log(`server started on port: ${process.env.port}`)
    })
})()
