import { Card, CardId } from "../domain/card";
import { ScoreHandUseCase } from "./score-hand.usecase";

const king: Card = {
  id: "king",
  name: "King",
  suit: "leader",
  baseStrength: 8,
};
const queen: Card = {
  id: "queen",
  name: "Queen",
  suit: "leader",
  baseStrength: 6,
};

describe("ScoreHandUseCase", () => {
  it("scores the cards the catalog serves for the given IDs", async () => {
    const getByIds = jest.fn(async (_: readonly CardId[]) => [king, queen]);
    const useCase = new ScoreHandUseCase({ cardCatalog: { getByIds } });

    await expect(useCase.execute(["king", "queen"])).resolves.toBe(14);
    expect(getByIds).toHaveBeenCalledWith(["king", "queen"]);
  });

  it("scores no cards as 0", async () => {
    const useCase = new ScoreHandUseCase({
      cardCatalog: { getByIds: async () => [] },
    });

    await expect(useCase.execute([])).resolves.toBe(0);
  });

  it("fails when the catalog can't serve the cards", async () => {
    const useCase = new ScoreHandUseCase({
      cardCatalog: {
        getByIds: () => Promise.reject(new Error("unknown card")),
      },
    });

    await expect(useCase.execute(["unknown"])).rejects.toThrow("unknown card");
  });
});
