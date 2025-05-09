import { Request, Response } from 'express'
import { User } from '../models/user'
import { updateBalanceAndTotalProfit } from '../db/user'
import { BlackJackGame } from '../game/game'
import { deleteGameState, getGameState, setGameState } from '../redis'
import { dealerPlay } from '../game/dealer'


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

    //? maybe i should check to see if the player has a 21 initially ?
    //? if they do there is no point in going foward i either pay them out at this point or not ( if the dealer also has 21 )
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
    if (game.playerHand.handValue >= 21) {
        //* dealer play here because the player cannot hit anymore if they are at 21
        if (game.playerHand.handValue == 21) {
            dealerPlay(game)
            //* if the dealers hand is not equal to 21 at this point, then the dealer has busted so we pay out player
            if (game.dealerHand.handValue != 21) await updateBalanceAndTotalProfit(game.playerId, game.betAmount * 2)
        }
        //* pay out any insurance bets in 21 or over case since the game is done at this point
        if (game.insurance && game.insuranceBetWon) await updateBalanceAndTotalProfit(game.playerId, game.insuranceBet! * 2)
        //* face up cards here so player can see them at this point
        game.dealerHand.cards.forEach((card) => card.isFacingUp = true)
        await deleteGameState(game.playerId)
    } else {
        //TODO im pretty sure this can throw an error so like you know be careful
        await setGameState(game)
    }

    res.status(200).json(game.serialize()).end()
}

export const doubleDown = async (req: Request, res: Response) => {
    const user: User = res.locals.user
    const game = await getGameState(user._id!)

    if (!game) {
        res.status(400).json({error: 'Existing game not found'}).end()
        return
    }

    //* doubling down means betAmount * 2, so we can just check whether the user has enough
    //* to have the bet amount subtracted again
    if (user.balance < game.betAmount) {
        res.status(400).json({error: 'You do not have enough balance to double down'}).end()
        return
    }

    //* subtracting the betAmount again from user because the game.double() func will double the bet 
    await updateBalanceAndTotalProfit(game.playerId, -game.betAmount)
    game.double()

    //* if player didnt bust we will let dealer try to beat/match
    if (game.playerHand.handValue <= 21) {
        dealerPlay(game)
        if (game.dealerHand.handValue > 21 || game.dealerHand.handValue < game.playerHand.handValue) {
            await updateBalanceAndTotalProfit(game.playerId, game.betAmount * 2) 
        }
        //* in the case the gets more or matches we do nothing because the money has been taken already
    }

    //* pay out insurance at this point because doubling down == stand
    if (game.insurance && game.insuranceBetWon) await updateBalanceAndTotalProfit(game.playerId, game.insuranceBet! * 2)
    
    game.dealerHand.cards.forEach((card) => card.isFacingUp = true)
    await deleteGameState(game.playerId)
    res.send(200).json(game.serialize()).end()
}


export const insurance = async (req: Request, res: Response) => {
    const user: User = res.locals.user
    const game = await getGameState(user._id!)
    const {insuranceBetAmount} = req.body

    if (!game) {
        res.status(400).json({error: 'Existing game not found'}).end()
        return
    } else if (!insuranceBetAmount) {
        res.status(400).json({error: 'Insurance bet amount not provided'}).end()
        return
    } else if (user.balance < insuranceBetAmount) {
        res.status(400).json({error: 'You do not have enough balance to place this insurance bet'}).end()
        return
    } else if (insuranceBetAmount > game.betAmount / 2) {
        res.status(400).json({error: 'You can only place an insurance bet up to half the amount of the original bet'}).end()
        return    
    } else if (game.turnCount > 1) {
        res.status(400).json({error: 'You can only place an insurance bet on the first turn'}).end()
        return
    } else if (game.dealerHand.cards[0].id != 0) {
        res.status(400).json({error: 'You can only place an insurance bet when the dealer has an ace'})
        return
    } else if (game.insurance) {
        res.status(400).json({error: 'You have already placed an insurance bet this game'}).end()
        return    
    }

    game.insurance = true
    game.insuranceBet = insuranceBetAmount
    await updateBalanceAndTotalProfit(game.playerId, -game.insuranceBet!)

    game.dealerHand.calculateValue()
    if (game.dealerHand.handValue == 21) game.insuranceBetWon = true

    await setGameState(game)

    res.status(200).json(game.serialize()).end()
}


export const stand = async (req: Request, res: Response) => {
    const user: User = res.locals.user
    const game = await getGameState(user._id!)

    if (!game) {
        res.status(400).json({error: 'Existing game not found'}).end()
        return
    }

    dealerPlay(game)

    if (game.dealerHand.handValue > 21 || game.dealerHand.handValue < game.playerHand.handValue) await updateBalanceAndTotalProfit(game.playerId, game.betAmount * 2) 
    
    if (game.insurance && game.insuranceBetWon) await updateBalanceAndTotalProfit(game.playerId, game.insuranceBet! * 2)
    
    await deleteGameState(game.playerId)

    game.dealerHand.cards.forEach((card) => card.isFacingUp = true)

    res.status(200).json(game.serialize()).end()
}