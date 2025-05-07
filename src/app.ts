import express, {Request, Response} from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import { requireAuth } from './middleware/requireAuth';

    const app = express();
    /*
    * this makes all of our requests go through a cookie and body parser
    * if the contenttype in the req is json, it'll parse it for us and give us
    * a nice data structure which will let us easily access and look for fields
    * if there are cookies the cookie parser will help us with being able to use them
    */
    app.use(cors({origin: process.env.CORS_ORIGIN , credentials: true}))
    app.use(express.json())
    app.use(cookieParser())

    app.get('/', (req: Request, res: Response) => {
        res.send('hi hi hi')
    })

    /*
    * if a request starts with '/auth' (like localhost:8080/auth) this'll
    * make the request go through a sub-app or 'route' which has paths related
    * to authentication, such as logging in or registering
    */
    app.use('/auth', authRoutes)

    /*
    * if something requires auth, it must be placed after this middle ware to ensure
    * that the user has a session token and is logged in. If it is placed before this,
    * then the user's validity will not be checked
    */
    app.use(requireAuth)
    
    app.use('/game', gameRoutes)
    
    /*
    * error handling, does not require a path, and it ALWAYS takes 4 arguments
    * without the 4 arguments it will not be recognized as an error handling
    * middle ware function
    */
    app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
        console.log(err)
        res.status(500).json({error: 'uh oh something broke'}).end()
    })

export default app