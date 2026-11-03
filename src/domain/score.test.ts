import { Card } from "./card";
import { calculateScore } from "./score";

const king: Card = { id: "king", name: "King", suit: "leader", baseStrength: 8 };
const queen: Card = { id: "queen", name: "Queen", suit: "leader", baseStrength: 6 };

describe("calculateScore", () => {
  it("scores no cards as 0", () => {
    expect(calculateScore([])).toBe(0);
  });

  it("adds the base strengths of the cards together", () => {
    expect(calculateScore([king, queen])).toBe(14);
  });
});
