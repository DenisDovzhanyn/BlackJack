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
        if (id == -1) {
            this.value = 0
            this.name = 'Blank'
        } else if (id == 0) {
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

