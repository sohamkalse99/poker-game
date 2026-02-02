declare module 'poker-evaluator' {
    export interface EvaluationResult {
        handType: number;
        handRank: number;
        value: number;
        handName: string;
    }

    export function evalHand(cards: string[]): EvaluationResult;
}
