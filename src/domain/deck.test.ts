import { Card } from "./card";
import { Deck, getDeckCards } from "./deck";

const king: Card = { id: "king", name: "King", suit: "leader", baseStrength: 8 };
const queen: Card = { id: "queen", name: "Queen", suit: "leader", baseStrength: 6 };
const unicorn: Card = { id: "unicorn", name: "Unicorn", suit: "beast", baseStrength: 9 };

describe("getDeckCards", () => {
  it("returns only the deck's cards, in deck order", () => {
    const deck: Deck = { id: "test", name: "Test", cardIds: ["queen", "king"] };

    expect(getDeckCards(deck, [king, queen, unicorn])).toEqual([queen, king]);
  });
});
