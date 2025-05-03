import { ObjectId } from "mongodb";

export interface BlackJackDocument {
    playerId: ObjectId,
    playerHand?: Hand,
    dealerHand?: Hand,
    deck?: Deck,
    betAmount: number,
    stand?: boolean,
    doubleDown?: boolean,
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
    doubleDown: boolean
    insurance: boolean
    insuranceBet?: number
    turnCount: number
    
    // i think we will only want to inc the turnCount when a user hits our api to hit/stand/doubledown ? 
    // with doubling down/ insurance having special conditions
    // and another thing, I am storing the game and also calculating the dealer hands value, however we do not want to include this
    // when sending it to the player. the player is not allowed to see any card from the dealer but the first drawn
    constructor({ 
        playerId,
        betAmount,
        playerHand = new Hand(),
        dealerHand = new Hand(),
        deck = new Deck(),
        stand = false,
        doubleDown = false,
        insurance = false,
        insuranceBet = undefined,
        turnCount = 1    
    }: BlackJackDocument) {
        this.playerId = playerId
        this.betAmount = betAmount
        this.playerHand = playerHand
        this.dealerHand = dealerHand
        this.deck = deck
        this.stand = stand
        this.doubleDown = doubleDown
        this.insurance = insurance
        this.insuranceBet = insuranceBet
        this.turnCount = turnCount
    }

    beginGame() {
        for (let i = 0; i < 3; i++) {
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
    }

    double(): void {
        // meaning we are on first turn
        if (this.turnCount != 1) return
        
        this.doubleDown = true
        this.betAmount *= 2
        const card = this.deck.deal(true)
        this.playerHand.addCard(card)
        this.playerHand.calculateValue()
        this.turnCount++
        this.stand = true
    }
 

}

class Deck {
    cardsInDeck: Card[];

    constructor() {
        this.cardsInDeck = []

        for (const suit in suits) {
            for (let i = 0; i < 14; i++) {
                this.cardsInDeck.push(new Card(suit, i))
            }
        }
        this.shuffle()
    }

    shuffle(): void {
        for (let i = 0; i < this.cardsInDeck.length; i++) {
            let random = Math.floor(Math.random() * (this.cardsInDeck.length))
            const tempCardHolder: Card = this.cardsInDeck[i]
            this.cardsInDeck[i] = this.cardsInDeck[random]
            this.cardsInDeck[random] = tempCardHolder 
        }
    }

    deal(isFaceUp: boolean): Card  {
        const dealtCard =  this.cardsInDeck.pop()!

        dealtCard.isFacingUp = isFaceUp
        return dealtCard
    }
}

class Hand {
    cards: Card[];
    handValue!: number;

    constructor(cards: Card[] = []) {
        this.cards = cards
    }

    addCard(card: Card): void {
        this.cards.push(card)
    }

    calculateValue(): void {
        let amountOfAces = 0

        for (const card of this.cards) {
            this.handValue += card.value
            if (card.id == 0) amountOfAces++
        }

        // aces are put in as 11 instead of 1 automatically, if we are over 21 we will subtract by 10, making the ace count as 1 and
        // reduce the amount of 'aces' left
        while (this.handValue > 21 && amountOfAces > 0) {
            this.handValue -= 10
            amountOfAces--
        }
    }
}

class Card {
    value: number;
    suit: string;
    id: number
    name?: string;
    isFacingUp: boolean;

    constructor(suit: string, id: number) {
        this.suit = suit
        this.isFacingUp = false
        this.id = id

        if (id == 0) {
            this.value = 11
            this.name = 'Ace'
        } else if (id < 10) {
            this.value = id + 1
            this.name = 'Number'
        } else {
            this.value = 10
            this.name = this.getName(id)
        }
    }

    getName(id: number): string {
        if (id == 11) return 'Jack'
        else if (id == 12) return 'King'
        else return 'Queen'
    }
}

const suits = [
    'Hearts',
    'Spades',
    'Diamonds',
    'Clubs'
]