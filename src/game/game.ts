import { ObjectId } from "mongodb";

export class BlackJackGame{
    playerId: ObjectId;
    playerHand: Hand;
    dealerHand: Hand;
    deck: Deck;
    betAmount: number
    doubleDown!: boolean
    insurance!: boolean


    constructor(playerId: ObjectId, betAmount: number) {
        this.playerId = playerId
        this.betAmount = betAmount
        this.deck = new Deck()
        this.playerHand = new Hand()
        this.dealerHand = new Hand()

        for (let i = 0; i < 3; i++) {
            const card = this.deck.deal(true)
            this.playerHand.addCard(card)
            
            const dealerCard = this.deck.deal(i == 0)
            this.dealerHand.addCard(dealerCard)
        }
    }

    hit(isPlayer: boolean): void {
        const card = this.deck.deal(true)

        if (isPlayer) {
            this.playerHand.addCard(card)
        } else {
            card.isFacingUp = false
            this.dealerHand.addCard(card)
        }
    }


}

class Deck {
    cardsInDeck: Card[]

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