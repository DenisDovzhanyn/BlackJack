import { ObjectId } from "mongodb";
import { Hand } from "./hand";
import { Deck } from "./deck";

export interface BlackJackDocument {
    playerId: ObjectId,
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
            playerHand: this.playerHand,
            dealerHand: this.dealerHand,
            betAmount: this.betAmount,
            stand: this.stand,
            insurance: this.insurance,
            insuranceBet: this.insuranceBet,
            turnCount: this.turnCount
        }
        
        //* we do this so that the user can not cheat and check the dealers face down cards
        //* but we still need a way to tell the client side how many cards the dealer has
        //? do I really need to tell the client how many cards the dealer has? 
        //? the dealer will always deal himself 2 cards after dealing to the player, with one being visible. then the dealer
        //? will only hit again after the player stands, and at that point the user should be able to see dealer card
        doc.dealerHand!.cards = doc.dealerHand!.cards.filter((card) => {
            if (!card.isFacingUp) {
                doc.dealerHand!.handValue -= card.value
                return false
            }
            return true
        })

        return doc
    }

}
