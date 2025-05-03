import { Request, Response, NextFunction } from "express"
import { findById } from "../db/user"

export const requireAuth =  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionToken } = req.cookies
    const { id } = req.body

    if (!sessionToken || !id) {
        res.sendStatus(401)
        return
    }
    
    const user = await findById(id)

    if (!user || user.authorization.sessionToken != sessionToken) {
        res.sendStatus(401)
        return
    }

    // Because at this point, the user is authenticated and logged in, we assign the user to the res object
    // so that we do not need to do multiple look ups down the line ( next function )
    res.locals.user = user
    next()
}