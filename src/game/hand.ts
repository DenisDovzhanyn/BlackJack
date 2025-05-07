export class Hand {
    cards: Card[];
    handValue: number;

    constructor(cards: Card[] = [], handValue: number = 0) {
        this.cards = cards
        this.handValue = handValue
    }

    addCard(card: Card): void {
        this.cards.push(card)
    }

    calculateValue(): void {
        this.handValue = 0
        let amountOfAces = 0

        for (const card of this.cards) {
            this.handValue += card.value
            if (card.id == 0) amountOfAces++
        }

        //* aces are put in as 11 instead of 1 automatically, if we are over 21 we will subtract by 10, making the ace count as 1 and
        //* reduce the amount of 'aces' left
        while (this.handValue > 21 && amountOfAces > 0) {
            this.handValue -= 10
            amountOfAces--
        }
    }
}