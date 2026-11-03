import { Card } from "./card";

export function calculateScore(cards: readonly Card[]): number {
  return cards.reduce((score, card) => score + card.baseStrength, 0);
}
