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
  it("serves the catalog's cards with their display text but no effects", async () => {
    const useCase = new LoadCardsUseCase({
      cardCatalog: { getAll: async () => [plainCard, cardWithAbilities] },
    });

    await expect(useCase.execute()).resolves.toStrictEqual([
      plainCard,
      {
        id: "abilities",
        name: "Abilities",
        suit: "wizard",
        baseStrength: 2,
        bonus: { text: "Bonus text" },
        penalty: { text: "Penalty text" },
      },
    ]);
  });

  it("fails when the catalog can't serve the cards", async () => {
    const useCase = new LoadCardsUseCase({
      cardCatalog: { getAll: () => Promise.reject(new Error("no cards")) },
    });

    await expect(useCase.execute()).rejects.toThrow("no cards");
  });
});
