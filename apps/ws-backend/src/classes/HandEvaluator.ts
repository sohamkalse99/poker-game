import { Card } from "./Deck";
import PokerEvaluator from "poker-evaluator";

export class HandEvaluator {
    static evaluate(holeCards: Card[], communityCards: Card[]) {
        const allCards = [...holeCards, ...communityCards];
        // Map our { suit: 'h', rank: 'A' } to "Ah" format
        const formattedCards = allCards.map(c => `${c.rank}${c.suit}`);

        return PokerEvaluator.evalHand(formattedCards);
    }
}
