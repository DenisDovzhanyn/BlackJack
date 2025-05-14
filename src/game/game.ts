import { ObjectId } from "mongodb";
import { Hand } from "./hand";
import { Deck } from "./deck";
import { Card } from "./card";

export interface BlackJackDocument {
    playerId: ObjectId,
    isGameOver?: boolean,
    playerHand?: Hand,
    dealerHand?: Hand,
    deck?: Deck,
    betAmount: number,
    stand?: boolean,
    insurance?: boolean,
    insuranceBet?: number,
    insuranceBetWon?: boolean,
    turnCount?: number
}

export interface BlackJackDTO {
    isGameOver: boolean,
    playerHand: Hand,
    dealerHand: Hand,
    betAmount: number,
    stand?: boolean,
    insurance?: boolean,
    insuranceBet?: number,
    turnCount?: number
}
export class BlackJackGame{
    playerId: ObjectId;
    isGameOver: boolean;
    playerHand: Hand;
    dealerHand: Hand;
    deck: Deck;
    betAmount: number
    stand: boolean
    insurance: boolean
    insuranceBet?: number
    insuranceBetWon?: boolean
    turnCount: number
    
    constructor({ 
        playerId,
        isGameOver = false,
        betAmount,
        playerHand,
        dealerHand,
        deck,
        stand = false,
        insurance = false,
        insuranceBet = undefined,
        insuranceBetWon = undefined,
        turnCount = 1    
    }: BlackJackDocument) {
        this.playerId = playerId
        this.isGameOver = isGameOver
        this.betAmount = betAmount
        this.playerHand = new Hand(playerHand?.cards, playerHand?.handValue)
        this.dealerHand = new Hand(dealerHand?.cards, dealerHand?.handValue)
        this.deck = new Deck(deck?.cardsInDeck)
        this.stand = stand
        this.insurance = insurance
        this.insuranceBet = insuranceBet
        this.insuranceBetWon = insuranceBetWon
        this.turnCount = turnCount
    }

    beginGame() {
        for (let i = 0; i < 2; i++) {
            const card = this.deck.deal(true)
            this.playerHand.addCard(card)
            
            const dealerCard = this.deck.deal(i == 0)
            this.dealerHand.addCard(dealerCard)
        }
        this.dealerHand.calculateValue()
        this.playerHand.calculateValue()
    }

    hit(isPlayer: boolean): void {
        const card = this.deck.deal(isPlayer)
        
        isPlayer ? this.playerHand.addCard(card) : this.dealerHand.addCard(card)
        isPlayer ? this.playerHand.calculateValue() : this.dealerHand.calculateValue()
        this.turnCount++
    }

    //! Now that I think about it maybe we do not need to have a doubledown boolean? 
    //! Like they are only able to double on the first turn, where we just multiply the betAmount by 2 (winnings = (betAmount *= 2) * 2)
    //! But besides that we dont really need to know if they've doubleddown, we only need the stand boolean
    double(): void {
        //* meaning we are on first turn
        if (this.turnCount != 1) return
        
        this.betAmount *= 2
        const card = this.deck.deal(true)
        this.playerHand.addCard(card)
        this.playerHand.calculateValue()
        this.turnCount++
        this.stand = true
    }
    
    serialize(): BlackJackDTO {
        const doc: BlackJackDTO = { 
            isGameOver: this.isGameOver,
            playerHand: this.playerHand,
            dealerHand: this.dealerHand,
            betAmount: this.betAmount,
            stand: this.stand,
            insurance: this.insurance,
            insuranceBet: this.insuranceBet,
            turnCount: this.turnCount
        }
        
        //* we do this so that the user can not cheat and check the dealers face down cards
       
        //* if the card facing up we return the card, otherwise we give a blank card!
        //? I think subtracting card.value can cause problems with aces, we will see 
        //! ------------------------------------------------------------------
        //? Actually, on second thought this will NOT cause problems with aces, because the only point in the game where the dealers
        //? cards will be face down, is up until the point where the user stands or busts! SO because of this
        //? the dealer will not have a chance to pull more than 2 cards for himself. meaning we cant have a case where an ace counts
        //? as a 1 AND face down
        doc.dealerHand!.cards = doc.dealerHand!.cards.map((card) => {
            if (card.isFacingUp) return card
            
            doc.dealerHand.handValue -= card.value
            return new Card('blank', -1)
        })

        return doc
    }

}
