import { addCardToHand, isCardInHand } from "./hand";

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
