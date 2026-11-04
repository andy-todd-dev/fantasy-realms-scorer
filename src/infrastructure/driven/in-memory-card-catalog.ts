import type { Card, CardId } from "../../domain/card";
import type { Deck, DeckId } from "../../domain/deck";
import { BASE_DECK, BASE_DECK_CARDS } from "./decks/base.cards";

type CatalogCard = Card & {
  readonly deckId: DeckId;
};

const DEFAULT_DECK = BASE_DECK;

export const DECKS: readonly Deck[] = [BASE_DECK];

export const CARDS: readonly CatalogCard[] = Object.entries(BASE_DECK_CARDS).map(
  ([id, definition]) => ({ deckId: BASE_DECK.id, id, ...definition }),
);

export class InMemoryCardCatalog {
  private readonly cards: readonly Card[];

  constructor(catalogCards: readonly CatalogCard[] = CARDS) {
    this.cards = catalogCards
      .filter((catalogCard) => catalogCard.deckId === DEFAULT_DECK.id)
      .map(({ deckId, ...card }) => card);
  }

  async getAll(): Promise<Card[]> {
    return [...this.cards];
  }

  async getByIds(cardIds: readonly CardId[]): Promise<Card[]> {
    return cardIds.map((cardId) => {
      const card = this.cards.find((deckCard) => deckCard.id === cardId);

      if (!card) {
        throw new Error(`Unknown card: ${cardId}`);
      }

      return card;
    });
  }
}
