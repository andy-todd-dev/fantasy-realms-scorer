import { ScoreHandUseCase } from "./application/score-hand.usecase";
import {
  blank,
  clearPenalty,
  points,
  suit,
} from "./infrastructure/driven/decks/card-definitions";
import {
  CARDS,
  InMemoryCardCatalog,
} from "./infrastructure/driven/in-memory-card-catalog";

// Stand-ins for suits with no cards in the deck yet: replace them with real cards as they're added.
const standIns: typeof CARDS = [
  {
    deckId: "base",
    id: "a-flame",
    name: "A Flame",
    suit: "flame",
    baseStrength: 5,
  },
  {
    deckId: "base",
    id: "a-weather",
    name: "A Weather",
    suit: "weather",
    baseStrength: 5,
  },
  {
    deckId: "base",
    id: "a-weather-blanker",
    name: "A Weather Blanker",
    suit: "wizard",
    baseStrength: 1,
    penalty: { text: "BLANKS all Weather.", effects: [blank(suit("weather"))] },
  },
  {
    deckId: "base",
    id: "a-weapon-clearer",
    name: "A Weapon Clearer",
    suit: "wizard",
    baseStrength: 1,
    bonus: {
      text: "Clears the penalty on all Weapons.",
      effects: [clearPenalty(suit("weapon"))],
    },
  },
  {
    deckId: "base",
    id: "a-flood",
    name: "A Flood",
    suit: "flood",
    baseStrength: 5,
    bonus: { text: "+3.", effects: [points(3)] },
    penalty: { text: "-10.", effects: [points(-10)] },
  },
  {
    deckId: "base",
    id: "a-land-blanking-flood",
    name: "A Land-Blanking Flood",
    suit: "flood",
    baseStrength: 5,
    penalty: { text: "BLANKS all Lands.", effects: [blank(suit("land"))] },
  },
  {
    deckId: "base",
    id: "a-land-blanker",
    name: "A Land Blanker",
    suit: "wizard",
    baseStrength: 1,
    penalty: { text: "BLANKS all Lands.", effects: [blank(suit("land"))] },
  },
  {
    deckId: "base",
    id: "a-wild-blanker",
    name: "A Wild Blanker",
    suit: "wizard",
    baseStrength: 1,
    penalty: { text: "BLANKS all Wilds.", effects: [blank(suit("wild"))] },
  },
];

const score = (...cardIds: string[]) =>
  new ScoreHandUseCase({
    cardCatalog: new InMemoryCardCatalog([...CARDS, ...standIns]),
  }).execute(cardIds);

describe("war dirigible", () => {
  describe("blanked unless with at least one Army", () => {
    it("is blanked alone", async () => {
      await expect(score("war-dirigible")).resolves.toBe(0);
    });

    it("is blanked with no Army in the hand", async () => {
      await expect(score("war-dirigible", "king")).resolves.toBe(8); // King 8, Dirigible blanked
    });

    it("isn't blanked with an Army", async () => {
      await expect(score("war-dirigible", "knights")).resolves.toBe(47); // 35 + (20 - 8)
    });

    it("isn't blanked with an Army and a Leader", async () => {
      await expect(score("war-dirigible", "knights", "king")).resolves.toBe(68); // 35 + 20 + (8 + 5)
    });

    it("is blanked when the only Army is blanked by another card", async () => {
      await expect(score("war-dirigible", "knights", "basilisk")).resolves.toBe(35); // Basilisk 35, both others blanked
    });
  });

  describe("blanked with any Weather", () => {
    it("is blanked with a Weather, even with an Army", async () => {
      await expect(
        score("war-dirigible", "knights", "a-weather"),
      ).resolves.toBe(17); // (20 - 8) + 5, Dirigible blanked
    });

    it("isn't blanked when the Weather is blanked by another card", async () => {
      await expect(
        score("war-dirigible", "knights", "a-weather", "a-weather-blanker"),
      ).resolves.toBe(48); // 35 + (20 - 8) + 1, Weather blanked
    });
  });

  it("isn't blanked when its penalty is cleared", async () => {
    await expect(score("war-dirigible", "a-weapon-clearer")).resolves.toBe(36); // 35 + 1
  });

  it("leaves Swamp's penalty counting only the Army", async () => {
    await expect(score("war-dirigible", "knights", "swamp")).resolves.toBe(62); // 35 + (20 - 8) + (18 - 3)
  });
});

describe("swamp", () => {
  it("scores its base strength alone", async () => {
    await expect(score("swamp")).resolves.toBe(18);
  });

  it("loses 3 for an Army", async () => {
    await expect(score("swamp", "knights")).resolves.toBe(27); // (18 - 3) + (20 - 8)
  });

  it("loses 3 for a Flame", async () => {
    await expect(score("swamp", "a-flame")).resolves.toBe(20); // (18 - 3) + 5
  });

  it("loses 3 for each, with both an Army and a Flame", async () => {
    await expect(score("swamp", "knights", "a-flame")).resolves.toBe(29); // (18 - 6) + (20 - 8) + 5
  });

  it("ignores cards of other suits", async () => {
    await expect(score("swamp", "queen")).resolves.toBe(24); // 18 + 6
  });

  it("doesn't count a blanked Army", async () => {
    await expect(score("swamp", "knights", "basilisk")).resolves.toBe(53); // 18 + 35, Knights blanked
  });

  describe("with Mountain clearing its penalty", () => {
    it("loses nothing for an Army", async () => {
      await expect(score("swamp", "knights", "mountain")).resolves.toBe(39); // 18 + (20 - 8) + 9
    });

    it("loses nothing even if Mountain is blanked", async () => {
      await expect(
        score("swamp", "knights", "mountain", "a-land-blanker"),
      ).resolves.toBe(31); // 18 + (20 - 8) + 1, Mountain blanked
    });
  });
});

describe("mountain", () => {
  it("scores its base strength alone", async () => {
    await expect(score("mountain")).resolves.toBe(9);
  });

  describe("+50 with both Smoke and Wildfire", () => {
    it("doesn't apply with only Smoke", async () => {
      await expect(score("mountain", "smoke")).resolves.toBe(10); // 9 + 1
    });

    it("doesn't apply with only Wildfire", async () => {
      await expect(score("mountain", "wildfire")).resolves.toBe(11); // 9 + 2
    });

    it("applies with both", async () => {
      await expect(score("mountain", "smoke", "wildfire")).resolves.toBe(62); // 9 + 50 + 1 + 2
    });

    it("doesn't apply when they are blanked", async () => {
      await expect(
        score("mountain", "smoke", "wildfire", "a-wild-blanker"),
      ).resolves.toBe(10); // 9 + 1, Smoke and Wildfire blanked
    });
  });

  describe("clears the penalty on all Floods", () => {
    it("leaves the penalty in place without Mountain", async () => {
      await expect(score("a-flood")).resolves.toBe(-2); // 5 + 3 - 10
    });

    it("removes a Flood's penalty but keeps its bonus", async () => {
      await expect(score("mountain", "a-flood")).resolves.toBe(17); // 9 + (5 + 3)
    });

    it("stops a Flood's penalty from blanking Mountain", async () => {
      await expect(score("mountain", "a-land-blanking-flood")).resolves.toBe(14); // 9 + 5
    });

    it("doesn't clear the penalties of other suits", async () => {
      await expect(score("mountain", "knights")).resolves.toBe(21); // 9 + (20 - 8)
    });

    it("still clears when Mountain is blanked, as clearing comes first", async () => {
      await expect(
        score("mountain", "a-flood", "a-land-blanker"),
      ).resolves.toBe(9); // (5 + 3) + 1, Mountain blanked
    });
  });
});
