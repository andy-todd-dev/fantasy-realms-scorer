import { getDeckCards } from "../../domain/deck";
import {
  CARDS,
  DECKS,
  DEFAULT_DECK,
  InMemoryCardCatalog,
} from "./in-memory-card-catalog";

describe("card data", () => {
  it("gives every card a unique ID", () => {
    const ids = CARDS.map((card) => card.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(CARDS.map((card) => [card.id, card.baseStrength] as const))(
    "gives %s a whole-number base strength from 0 to 40",
    (_, baseStrength) => {
      expect(Number.isInteger(baseStrength)).toBe(true);
      expect(baseStrength).toBeGreaterThanOrEqual(0);
      expect(baseStrength).toBeLessThanOrEqual(40);
    },
  );
});

describe("deck data", () => {
  it.each(DECKS.map((deck) => [deck.id, deck] as const))(
    "lists only known cards, without duplicates, in the %s deck",
    (_, deck) => {
      const knownIds = CARDS.map((card) => card.id);

      expect(knownIds).toEqual(expect.arrayContaining([...deck.cardIds]));
      expect(new Set(deck.cardIds).size).toBe(deck.cardIds.length);
    },
  );
});

describe("InMemoryCardCatalog", () => {
  it("returns the default deck's cards", async () => {
    const catalog = new InMemoryCardCatalog();

    await expect(catalog.getAll()).resolves.toEqual(
      getDeckCards(DEFAULT_DECK, CARDS),
    );
  });
});
