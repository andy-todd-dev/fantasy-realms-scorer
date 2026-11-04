import { Card, CardEffect } from "./card";
import { calculateScore } from "./score";

const card = (
  id: string,
  suit: Card["suit"],
  baseStrength: number,
  effects: readonly CardEffect[] = [],
): Card => ({
  id,
  name: id,
  suit,
  baseStrength,
  ...(effects.length > 0 && { bonus: { text: "", effects } }),
});

const anArmy = card("army-1", "army", 10);
const anotherArmy = card("army-2", "army", 20);
const aLeader = card("leader-1", "leader", 3);
const aLand = card("land-1", "land", 4);

const pointsPerArmy: CardEffect = {
  kind: "points",
  points: 5,
  per: { suit: "army" },
};

describe("calculateScore", () => {
  it("scores no cards as 0", () => {
    expect(calculateScore([])).toBe(0);
  });

  it("adds the base strengths of the cards together", () => {
    expect(calculateScore([anArmy, aLeader])).toBe(13);
  });

  describe("points effects", () => {
    it("adds flat points", () => {
      const subject = card("subject", "wizard", 1, [
        { kind: "points", points: 2 },
      ]);

      expect(calculateScore([subject])).toBe(3);
    });

    it("subtracts negative points", () => {
      const subject = card("subject", "wizard", 10, [
        { kind: "points", points: -8 },
      ]);

      expect(calculateScore([subject])).toBe(2);
    });

    it("counts effects from both the bonus and the penalty", () => {
      const subject: Card = {
        ...card("subject", "wizard", 10),
        bonus: { text: "", effects: [{ kind: "points", points: 5 }] },
        penalty: { text: "", effects: [{ kind: "points", points: -2 }] },
      };

      expect(calculateScore([subject])).toBe(13);
    });
  });

  describe("per", () => {
    it("scales with each matching card", () => {
      const subject = card("subject", "wizard", 1, [pointsPerArmy]);

      expect(calculateScore([subject, anArmy, anotherArmy])).toBe(41);
    });

    it("gives nothing without a matching card", () => {
      const subject = card("subject", "wizard", 1, [pointsPerArmy]);

      expect(calculateScore([subject, aLand])).toBe(5);
    });

    it("matches by card ID", () => {
      const subject = card("subject", "wizard", 1, [
        { kind: "points", points: 5, per: { cardId: "army-1" } },
      ]);

      expect(calculateScore([subject, anArmy, anotherArmy])).toBe(36);
    });

    it("doesn't count the card itself", () => {
      const subject = card("subject", "army", 1, [pointsPerArmy]);

      expect(calculateScore([subject])).toBe(1);
    });
  });

  describe("when", () => {
    const withLeader = card("subject", "wizard", 1, [
      { kind: "points", points: 5, when: { present: { suit: "leader" } } },
    ]);
    const withoutLeader = card("subject", "wizard", 1, [
      { kind: "points", points: 5, when: { absent: { suit: "leader" } } },
    ]);
    const withNamedCard = card("subject", "wizard", 1, [
      { kind: "points", points: 5, when: { present: { cardId: "land-1" } } },
    ]);

    it("applies a present condition only when a card matches", () => {
      expect(calculateScore([withLeader, aLeader])).toBe(9);
      expect(calculateScore([withLeader, aLand])).toBe(5);
    });

    it("applies an absent condition only when no card matches", () => {
      expect(calculateScore([withoutLeader, aLand])).toBe(10);
      expect(calculateScore([withoutLeader, aLeader])).toBe(4);
    });

    it("matches by card ID", () => {
      expect(calculateScore([withNamedCard, aLand])).toBe(10);
      expect(calculateScore([withNamedCard, aLeader])).toBe(4);
    });

    it("doesn't let the card satisfy its own condition", () => {
      const subject = card("subject", "leader", 1, [
        { kind: "points", points: 5, when: { present: { suit: "leader" } } },
      ]);

      expect(calculateScore([subject])).toBe(1);
    });

    it("applies only the matching amount of mutually exclusive effects", () => {
      const subject = card("subject", "wizard", 1, [
        {
          kind: "points",
          points: 5,
          per: { suit: "army" },
          when: { absent: { suit: "land" } },
        },
        {
          kind: "points",
          points: 20,
          per: { suit: "army" },
          when: { present: { suit: "land" } },
        },
      ]);

      expect(calculateScore([subject, anArmy])).toBe(16);
      expect(calculateScore([subject, anArmy, aLand])).toBe(35);
    });
  });

  describe("blank effects", () => {
    const blanker = card("blanker", "beast", 30, [
      { kind: "blank", targets: [{ suit: "army" }, { suit: "beast" }] },
    ]);

    it("removes the strength of each targeted card", () => {
      expect(calculateScore([blanker, anArmy, anotherArmy])).toBe(30);
    });

    it("leaves other suits alone", () => {
      expect(calculateScore([blanker, aLand])).toBe(34);
    });

    it("doesn't blank the card itself", () => {
      expect(calculateScore([blanker])).toBe(30);
    });

    it("blanks other cards of the blanking card's suit", () => {
      expect(calculateScore([blanker, card("beast", "beast", 9)])).toBe(30);
    });

    it("targets a card by ID", () => {
      const subject = card("subject", "wizard", 1, [
        { kind: "blank", targets: [{ cardId: "army-1" }] },
      ]);

      expect(calculateScore([subject, anArmy, anotherArmy])).toBe(21);
    });

    it("ignores the effects of a blanked card", () => {
      const penalised = card("penalised", "army", 10, [
        { kind: "points", points: -8 },
      ]);

      expect(calculateScore([blanker, penalised])).toBe(30);
    });

    it("doesn't count a blanked card toward per", () => {
      const subject = card("subject", "wizard", 1, [pointsPerArmy]);

      expect(calculateScore([blanker, subject, anArmy])).toBe(31);
    });

    it("doesn't let a blanked card satisfy a condition", () => {
      const subject = card("subject", "wizard", 1, [
        { kind: "points", points: 5, when: { present: { suit: "army" } } },
      ]);

      expect(calculateScore([blanker, subject, anArmy])).toBe(31);
    });

    it("treats a blanked card as absent", () => {
      const subject = card("subject", "wizard", 1, [
        { kind: "points", points: -1, when: { absent: { suit: "army" } } },
      ]);

      expect(calculateScore([blanker, subject, anArmy])).toBe(30);
    });
  });
});
