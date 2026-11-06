import { Card } from "../domain/card";
import { LoadCardsUseCase } from "./load-cards.usecase";

const plainCard: Card = {
  id: "plain",
  name: "Plain",
  suit: "land",
  baseStrength: 1,
};

const cardWithAbilities: Card = {
  id: "abilities",
  name: "Abilities",
  suit: "wizard",
  baseStrength: 2,
  bonus: {
    text: "Bonus text",
    effects: [{ kind: "points", points: 3 }],
  },
  penalty: {
    text: "Penalty text",
    effects: [{ kind: "blank", targets: [{ suit: "land" }] }],
  },
};

describe("LoadCardsUseCase", () => {
  it("serves only what the UI shows of the catalog's cards", async () => {
    const useCase = new LoadCardsUseCase({
      cardCatalog: { getAll: async () => [plainCard, cardWithAbilities] },
    });

    await expect(useCase.execute()).resolves.toStrictEqual([
      { id: "plain", name: "Plain", suit: "land" },
      { id: "abilities", name: "Abilities", suit: "wizard" },
    ]);
  });

  it("fails when the catalog can't serve the cards", async () => {
    const useCase = new LoadCardsUseCase({
      cardCatalog: { getAll: () => Promise.reject(new Error("no cards")) },
    });

    await expect(useCase.execute()).rejects.toThrow("no cards");
  });
});
