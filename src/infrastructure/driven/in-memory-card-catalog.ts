import { Card } from "../../domain/card";
import { Deck, getDeckCards } from "../../domain/deck";

// Sample cards: values and wording are placeholders until the full list is added.
export const CARDS: readonly Card[] = [
  {
    id: "king",
    name: "King",
    suit: "leader",
    baseStrength: 8,
    bonus: { text: "+5 for each Army. OR +20 for each Army if with Queen." },
  },
  {
    id: "queen",
    name: "Queen",
    suit: "leader",
    baseStrength: 6,
    bonus: { text: "+5 for each Army. OR +20 for each Army if with King." },
  },
  {
    id: "basilisk",
    name: "Basilisk",
    suit: "beast",
    baseStrength: 35,
    penalty: { text: "BLANKS all Armies, Leaders, and other Beasts." },
  },
];

export const DEFAULT_DECK: Deck = {
  id: "base",
  name: "Base game",
  cardIds: ["king", "queen", "basilisk"],
};

export const DECKS: readonly Deck[] = [DEFAULT_DECK];

export class InMemoryCardCatalog {
  async getAll(): Promise<Card[]> {
    return getDeckCards(DEFAULT_DECK, CARDS);
  }
}
