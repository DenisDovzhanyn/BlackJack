import { ObjectId } from "mongodb";

export class BlackJackGame{
    playerId: ObjectId;
    playerHand!: Card[];
    dealerHand!: Card[];
    deck: Deck;
    betAmount: number
    doubleDown!: boolean
    insurance!: boolean


    constructor(playerId: ObjectId, betAmount: number) {
        this.playerId = playerId
        this.betAmount = betAmount
        this.deck = new Deck()
        this.playerHand = []
        this.dealerHand = []

        for (let i = 0; i < 3; i++) {
            const card = this.deck.deal(true)
            if (card) this.playerHand.push(card)
            
            const dealerCard = this.deck.deal(i == 0)
            if (dealerCard) this.dealerHand.push(dealerCard)
        }
    }

    hit(isPlayer: boolean): void {
        const card = this.deck.deal(true)
        if (!card) return

        if (isPlayer) {
            this.playerHand.push(card)
        } else {
            card.isFacingUp = false
            this.dealerHand.push(card)
        }
    }


}

class Deck {
    cardsInDeck: Card[]

    constructor() {
        this.cardsInDeck = []
        let cardNames = names()
        let nameIterator = 0

        for (const suit in suits()) {
            for (let i = 0; i < 14; i++) {
                if (i == 0) {
                    this.cardsInDeck.push(new Card([1, 11], suit, cardNames[nameIterator].Name, false))
                    nameIterator++
                    continue
                } else if (i >= 10) {
                    nameIterator++
                    this.cardsInDeck.push(new Card(10, suit, cardNames[nameIterator].Name, false))
                    continue
                }

                this.cardsInDeck.push(new Card(i + 1, suit, cardNames[nameIterator].Name, false))
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

    deal(isFaceUp: boolean): Card | undefined {
        const dealtCard =  this.cardsInDeck.pop()
        if (!dealtCard) return undefined

        dealtCard.isFacingUp = isFaceUp
        return dealtCard
    }
}

class Hand {
    cards: Card[];
    handValue!: number[];

    constructor(cards: Card[]) {
        this.cards = cards
        this.handValue = []
    }

    addCard(card: Card): void {
        this.cards.push(card)
    }

    calculateValue(): void {
        let amountOfAces = 0

        for (const card of this.cards) {
            if (!Array.isArray(card.value)) {
                this.handValue[0] += card.value
            } else {
                amountOfAces++
                this.handValue[0] += card.value[0]
            }
        }

        for (let i = 1; i <= amountOfAces; i++) {
            this.handValue[i] = (this.handValue[0] - i) + (i * 11)
        }
    }
}

class Card {
    value: number | number[];
    suit: string;
    name?: string;
    isFacingUp: boolean;

    constructor(value: number | number[], suit: string, name: string | undefined = undefined, isFacingUp: boolean) {
        this.value = value
        this.suit = suit
        this.name = name;
        this.isFacingUp = isFacingUp
    }
}

const suits = () => {
    return [
        {Suit: 'Hearts'},
        {Suit: 'Spades'},
        {Suit: 'Diamonds'},
        {Suit: 'Clubs'}
    ]
}

const names = () =>  {
    return [
        {Name: 'Ace'},
        {Name: 'Number'},
        {Name: 'Jack'},
        {Name: 'King'},
        {Name: 'Queen'}
    ]
}