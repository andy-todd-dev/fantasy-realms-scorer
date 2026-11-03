import type { Card, CardId } from "../../domain/card";
import type { Deck, DeckId } from "../../domain/deck";

type CatalogCard = Card & {
  readonly deckId: DeckId;
};

const DEFAULT_DECK: Deck = {
  id: "base",
  name: "Base game",
};

export const DECKS: readonly Deck[] = [DEFAULT_DECK];

// Sample cards: values and wording are placeholders until the full list is added.
export const CARDS: readonly CatalogCard[] = [
  {
    deckId: "base",
    id: "king",
    name: "King",
    suit: "leader",
    baseStrength: 8,
    bonus: { text: "+5 for each Army. OR +20 for each Army if with Queen." },
  },
  {
    deckId: "base",
    id: "queen",
    name: "Queen",
    suit: "leader",
    baseStrength: 6,
    bonus: { text: "+5 for each Army. OR +20 for each Army if with King." },
  },
  {
    deckId: "base",
    id: "basilisk",
    name: "Basilisk",
    suit: "beast",
    baseStrength: 35,
    penalty: { text: "BLANKS all Armies, Leaders, and other Beasts." },
  },
];

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
