import { Request, Response } from 'express'
import { User } from '../models/user'
import { updateBalanceAndTotalProfit } from '../db/user'
import { BlackJackGame } from '../game/game'
import { setGameState } from '../redis'


export const placeBet = async (req: Request, res: Response) => {
    // here we will want to create a new game instance with the bet if the player
    // has enough money, then place the game instance into redis for quick
    // retrieval instead of storing it directly on our server
    const { betAmount } = req.body
    const user: User = res.locals.user
    
    if (betAmount > user.balance) {
        res.status(400).json({error: 'Your balance is too low to place this bet'}).end()
        return
    }

    await updateBalanceAndTotalProfit(user._id!, -betAmount)

    const game: BlackJackGame = new BlackJackGame({playerId: user._id!, betAmount})

    await setGameState(game)
    // after setting the game state i need to send back a blackjackgameDTO, we do not want to show the user
    // the dealers second card, even though it wont be displayed on the front end, if i was to send a blackjackgame object
    // the user could just look into their network tab and see what the value of that flipped card is
}