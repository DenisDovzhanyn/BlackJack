import { Request, Response, NextFunction } from "express"
import { User } from "../models/user"
import { findBySession } from "../db/user"

export const requireAuth =  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionToken } = req.cookies
    if (!sessionToken) {
        res.sendStatus(403)
        return
    }
    const user: User = await findBySession(sessionToken) as User

    if (!user) {
        res.sendStatus(403)
        return
    }

    next()
}