import { Request, Response } from 'express'
import { User } from '../models/user'
import { updateBalanceAndTotalProfit } from '../db/user'
import { BlackJackGame } from '../game/game'
import { deleteGameState, getGameState, setGameState } from '../redis'


export const placeBet = async (req: Request, res: Response) => {
    /*
    * here we will want to create a new game instance with the bet if the player
    * has enough money, then place the game instance into redis for quick
    * retrieval instead of storing it directly on our server
    */
    const { betAmount } = req.body
    const user: User = res.locals.user
    
    if (betAmount > user.balance) {
        res.status(400).json({error: 'Your balance is too low to place this bet'}).end()
        return
    }

    await updateBalanceAndTotalProfit(user._id!, -betAmount)

    const game: BlackJackGame = new BlackJackGame({playerId: user._id!, betAmount})
    game.beginGame()

    await setGameState(game)

    /*
    * after setting the game state i need to send back a blackjackgameDTO, we do not want to show the user
    * the dealers second card, even though it wont be displayed on the front end, if i was to send a blackjackgame object
    * the user could just look into their network tab and see what the value of that flipped card is
    */
     res.status(200).json(game.serialize()).end()
}


export const hit = async (req: Request, res: Response) => {
    const user: User = res.locals.user

    const game = await getGameState(user._id!)

    if (!game) {
        res.status(400).json({error: 'Existing Game not found'}).end()
        return
    }

    game.hit(true)
    game.playerHand.calculateValue()
    if (game.playerHand.handValue > 21) {
        /*
        * we wanna flip all cards up here cus the player has lost, and we want them to feel bad if the dealer had a low hand hahaha
        * we delete the game state because the server does not need it at this point
        */
        game.dealerHand.cards.forEach((card) => card.isFacingUp = true)
        await deleteGameState(game.playerId)
    } else {
        //TODO im pretty sure this can throw an error so like you know be careful
        await setGameState(game)
    }
    //TODO we also need to check does the player have exactly 21? if they do then the dealer
    //TODO needs to act at this point.

    res.status(200).json(game.serialize()).end()
}