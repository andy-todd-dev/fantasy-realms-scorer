import { Card, CardId } from "./card";

export type DeckId = string;

export type Deck = {
  readonly id: DeckId;
  readonly name: string;
  readonly cardIds: readonly CardId[];
};

export function getDeckCards(deck: Deck, cards: readonly Card[]): Card[] {
  return deck.cardIds.flatMap((cardId) =>
    cards.filter((card) => card.id === cardId),
  );
}
