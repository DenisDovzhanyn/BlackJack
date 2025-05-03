import { Request, Response } from 'express'


export const placeBet = async (req: Request, res: Response) => {
    // here we will want to create a new game instance with the bet if the player
    // has enough money, then place the game instance into redis for quick
    // retrieval instead of storing it directly on our server
    
}