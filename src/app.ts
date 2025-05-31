import express, {Request, Response} from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import { requireAuth } from './middleware/requireAuth';
import { User } from './models/user';
import { getTopTenEarners } from './db/user';

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
    //TODO right now, since i am requiring a user id ALONG with the session token in every request, i should store the user id as a cookie so the client doesnt need
    //TODO to include it in every body of every request. Because of this the front end has to do a POST to get user info

    //! ^ lol i remember why its not stored in cookie already. I didnt want to import a library for a single cookie
    app.post('/user', (req: Request, res: Response) => {
        const userDoc = res.locals.user
        const user = new User(userDoc)

        res.status(200).json(user.serialize()).end()
    })

    //* please work lol
    app.post('/topprofits', async (req: Request, res: Response) => {
        const users = await getTopTenEarners()
        res.status(200).json({users}).end()
    })

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