export class Deck {
    cardsInDeck: Card[];

    constructor(cardsInDeck: Card[] = []) {
        this.cardsInDeck = cardsInDeck

        for (const suit of suits) {
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

const suits = [
    'Hearts',
    'Spades',
    'Diamonds',
    'Clubs'
]