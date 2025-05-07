import { BlackJackGame } from "./game"

export const dealerPlay = (game: BlackJackGame) => {

    //? this covers most cases but what about when a player has a 21? we dont want to keep going while under,
    //? we want to keep going UNTIL we have 21 too (or bust)
    if (game.playerHand.handValue != 21) { 
        while (game.dealerHand.handValue <= game.playerHand.handValue) {
            game.hit(false)
            game.dealerHand.calculateValue()
        }
    } else {
        while (game.dealerHand.handValue < game.playerHand.handValue) {
            game.hit(false)
            game.dealerHand.calculateValue()
        }
    }
}