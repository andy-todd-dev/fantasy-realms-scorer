import {
  addCardToHand,
  emptyHand,
  isCardInHand,
  removeCardFromHand,
} from "./hand";

describe("emptyHand", () => {
  it("has no cards", () => {
    expect(emptyHand()).toEqual([]);
  });
});

describe("removeCardFromHand", () => {
  it("removes the card, keeping the order of the rest", () => {
    expect(removeCardFromHand(["king", "queen", "knights"], "queen")).toEqual([
      "king",
      "knights",
    ]);
  });

  it("leaves the hand unchanged when the card isn't in it", () => {
    const hand = ["king"];

    expect(removeCardFromHand(hand, "queen")).toBe(hand);
  });
});

describe("addCardToHand", () => {
  it("adds a card to the end of the hand", () => {
    expect(addCardToHand(["king"], "queen")).toEqual(["king", "queen"]);
  });

  it("leaves the hand unchanged when the card is already in it", () => {
    const hand = ["king"];

    expect(addCardToHand(hand, "king")).toBe(hand);
  });
});

describe("isCardInHand", () => {
  it("reports whether the card is in the hand", () => {
    expect(isCardInHand(["king"], "king")).toBe(true);
    expect(isCardInHand(["king"], "queen")).toBe(false);
  });
});
