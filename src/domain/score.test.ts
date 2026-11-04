import { Card, CardEffect, EffectCondition } from "./card";
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

    describe("blanking is simultaneous", () => {
      const blanksArmies = card("blanks-armies", "wizard", 1, [
        { kind: "blank", targets: [{ suit: "army" }] },
      ]);
      const armyBlankingLands = card("blanks-lands", "army", 10, [
        { kind: "blank", targets: [{ suit: "land" }] },
      ]);

      it("lets a card that is itself blanked still blank others", () => {
        expect(calculateScore([armyBlankingLands, aLand])).toBe(10);
        expect(calculateScore([blanksArmies, armyBlankingLands, aLand])).toBe(1);
      });

      it("gives the same score whatever order the cards are in", () => {
        expect(calculateScore([aLand, armyBlankingLands, blanksArmies])).toBe(1);
      });
    });

    it("blanks both cards when each would blank the other", () => {
      const blanksLeaders = card("land-blanks-leaders", "land", 4, [
        { kind: "blank", targets: [{ suit: "leader" }] },
      ]);
      const blanksLands = card("leader-blanks-lands", "leader", 3, [
        { kind: "blank", targets: [{ suit: "land" }] },
      ]);

      expect(calculateScore([blanksLeaders, blanksLands])).toBe(0);
      expect(calculateScore([blanksLands, blanksLeaders])).toBe(0);
      expect(calculateScore([blanksLeaders, blanksLands, anArmy])).toBe(10);
    });

    it("treats a blanked card as absent", () => {
      const subject = card("subject", "wizard", 1, [
        { kind: "points", points: -1, when: { absent: { suit: "army" } } },
      ]);

      expect(calculateScore([blanker, subject, anArmy])).toBe(30);
    });
  });

  describe("allOf conditions", () => {
    const subject = card("subject", "wizard", 1, [
      {
        kind: "points",
        points: 50,
        when: {
          allOf: [
            { present: { cardId: "land-1" } },
            { present: { suit: "leader" } },
          ],
        },
      },
    ]);

    it("applies when every condition holds", () => {
      expect(calculateScore([subject, aLand, aLeader])).toBe(58);
    });

    it("doesn't apply when any condition fails", () => {
      expect(calculateScore([subject, aLand])).toBe(5);
      expect(calculateScore([subject, aLeader])).toBe(4);
    });

    it("applies only once however many cards match", () => {
      const anotherLeader = card("leader-2", "leader", 2);

      expect(calculateScore([subject, aLand, aLeader, anotherLeader])).toBe(60);
    });

    it("can combine present and absent", () => {
      const mixed = card("subject", "wizard", 1, [
        {
          kind: "points",
          points: 5,
          when: {
            allOf: [
              { present: { suit: "land" } },
              { absent: { suit: "leader" } },
            ],
          },
        },
      ]);

      expect(calculateScore([mixed, aLand])).toBe(10);
      expect(calculateScore([mixed, aLand, aLeader])).toBe(8);
    });

    it("doesn't let a blanked card satisfy a condition", () => {
      const blanksLeaders = card("blanker", "beast", 30, [
        { kind: "blank", targets: [{ suit: "leader" }] },
      ]);

      expect(calculateScore([subject, aLand, aLeader, blanksLeaders])).toBe(35);
    });
  });

  describe("anyOf conditions", () => {
    const withArmyOrLand: EffectCondition = {
      anyOf: [{ present: { suit: "army" } }, { present: { suit: "land" } }],
    };
    const subject = card("subject", "wizard", 1, [
      { kind: "points", points: 5, when: withArmyOrLand },
    ]);

    it("doesn't apply when no condition holds", () => {
      expect(calculateScore([subject, aLeader])).toBe(4); // 1 + 3
    });

    it("applies when the first condition holds", () => {
      expect(calculateScore([subject, anArmy])).toBe(16); // (1 + 5) + 10
    });

    it("applies when a later condition holds", () => {
      expect(calculateScore([subject, aLand])).toBe(10); // (1 + 5) + 4
    });

    it("applies only once when several conditions hold", () => {
      expect(calculateScore([subject, anArmy, aLand])).toBe(20); // (1 + 5) + 10 + 4
    });

    it("doesn't count a blanked card", () => {
      const blanksArmies = card("blanker", "weapon", 1, [
        { kind: "blank", targets: [{ suit: "army" }] },
      ]);

      expect(calculateScore([subject, anArmy, blanksArmies])).toBe(2); // 1 + 1, Army blanked
    });

    it("can be excluded by another clause through allOf", () => {
      const unlessLeader = card("subject", "wizard", 1, [
        {
          kind: "points",
          points: 5,
          when: { allOf: [{ absent: { suit: "leader" } }, withArmyOrLand] },
        },
      ]);

      expect(calculateScore([unlessLeader, anArmy])).toBe(16); // (1 + 5) + 10
      expect(calculateScore([unlessLeader, anArmy, aLeader])).toBe(14); // 1 + 10 + 3
    });

    it("stops being excluded when the excluding card is blanked", () => {
      const unlessLeader = card("subject", "wizard", 1, [
        {
          kind: "points",
          points: 5,
          when: { allOf: [{ absent: { suit: "leader" } }, withArmyOrLand] },
        },
      ]);
      const blanksLeaders = card("blanker", "weapon", 1, [
        { kind: "blank", targets: [{ suit: "leader" }] },
      ]);

      expect(
        calculateScore([unlessLeader, anArmy, aLeader, blanksLeaders]),
      ).toBe(17); // (1 + 5) + 10 + 1, Leader blanked
    });

    it("works as a self-blank condition", () => {
      const blanked = card("subject", "wizard", 1, [
        { kind: "blankSelf", when: withArmyOrLand },
      ]);

      expect(calculateScore([blanked, anArmy])).toBe(10); // Army 10, subject blanked
      expect(calculateScore([blanked, aLeader])).toBe(4); // 1 + 3
    });
  });

  describe("clearPenalty effects", () => {
    const clearsFloods = card("clearer", "land", 9, [
      { kind: "clearPenalty", targets: [{ suit: "flood" }] },
    ]);
    const penalisedFlood: Card = {
      ...card("flood-1", "flood", 5),
      bonus: { text: "", effects: [{ kind: "points", points: 3 }] },
      penalty: { text: "", effects: [{ kind: "points", points: -10 }] },
    };
    const blankingFlood: Card = {
      ...card("flood-2", "flood", 5),
      penalty: {
        text: "",
        effects: [{ kind: "blank", targets: [{ suit: "land" }] }],
      },
    };

    it("removes the penalty of each targeted card, keeping its bonus", () => {
      expect(calculateScore([penalisedFlood])).toBe(-2);
      expect(calculateScore([clearsFloods, penalisedFlood])).toBe(17);
    });

    it("leaves other suits' penalties alone", () => {
      const penalisedArmy: Card = {
        ...card("army-3", "army", 5),
        penalty: { text: "", effects: [{ kind: "points", points: -2 }] },
      };

      expect(calculateScore([clearsFloods, penalisedArmy])).toBe(12);
    });

    it("resolves before blanks, so a cleared penalty blanks nothing", () => {
      expect(calculateScore([blankingFlood, aLand])).toBe(5);
      expect(calculateScore([clearsFloods, blankingFlood])).toBe(14);
    });

    it("still clears when the clearing card is later blanked", () => {
      const blanksLands = card("blanker", "wizard", 1, [
        { kind: "blank", targets: [{ suit: "land" }] },
      ]);

      expect(calculateScore([clearsFloods, penalisedFlood, blanksLands])).toBe(9);
    });

    it("leaves a cleared card's suit and name counting for other cards", () => {
      const subject = card("subject", "wizard", 1, [
        { kind: "points", points: 5, per: { suit: "flood" } },
        { kind: "points", points: 7, when: { present: { cardId: "flood-1" } } },
      ]);

      expect(calculateScore([clearsFloods, penalisedFlood, subject])).toBe(30);
    });

    it("doesn't clear the clearing card's own penalty", () => {
      const clearsOwnSuit: Card = {
        ...card("flood-3", "flood", 5),
        bonus: {
          text: "",
          effects: [{ kind: "clearPenalty", targets: [{ suit: "flood" }] }],
        },
        penalty: { text: "", effects: [{ kind: "points", points: -2 }] },
      };

      expect(calculateScore([clearsOwnSuit])).toBe(3);
    });

    it("doesn't apply a clear when no card matches", () => {
      expect(calculateScore([clearsFloods, aLand])).toBe(13);
    });
  });

  describe("blankSelf effects", () => {
    const blankedWithoutArmy: CardEffect = {
      kind: "blankSelf",
      when: { absent: { suit: "army" } },
    };
    const selfBlanker: Card = {
      ...card("self-blanker", "weapon", 35),
      bonus: { text: "", effects: [{ kind: "points", points: 5 }] },
      penalty: { text: "", effects: [blankedWithoutArmy] },
    };
    const blanksArmies = card("blanks-armies", "wizard", 1, [
      { kind: "blank", targets: [{ suit: "army" }] },
    ]);

    it("blanks the card when the condition holds, ignoring its bonus", () => {
      expect(calculateScore([selfBlanker])).toBe(0);
      expect(calculateScore([selfBlanker, aLand])).toBe(4);
    });

    it("leaves the card alone when the condition doesn't hold", () => {
      expect(calculateScore([selfBlanker, anArmy])).toBe(50);
    });

    it("can be blanked by being with a card", () => {
      const blankedWithLand = card("subject", "weapon", 35, [
        { kind: "blankSelf", when: { present: { suit: "land" } } },
      ]);

      expect(calculateScore([blankedWithLand])).toBe(35);
      expect(calculateScore([blankedWithLand, aLand])).toBe(4);
    });

    it("doesn't count a self-blanked card toward per", () => {
      const subject = card("subject", "wizard", 1, [
        { kind: "points", points: 5, per: { suit: "weapon" } },
      ]);

      expect(calculateScore([selfBlanker, subject])).toBe(1);
    });

    it("checks the condition against cards not blanked by others", () => {
      expect(calculateScore([selfBlanker, anArmy, blanksArmies])).toBe(1);
      expect(calculateScore([blanksArmies, anArmy, selfBlanker])).toBe(1);
    });

    it("lets a blanked card that would have triggered the condition save it", () => {
      const blankedWithLand = card("subject", "weapon", 35, [
        { kind: "blankSelf", when: { present: { suit: "land" } } },
      ]);
      const blanksLands = card("blanks-lands", "wizard", 1, [
        { kind: "blank", targets: [{ suit: "land" }] },
      ]);

      expect(calculateScore([blankedWithLand, aLand, blanksLands])).toBe(36);
    });

    it("lets a self-blanked card still blank others", () => {
      const subject = card("subject", "weapon", 35, [
        blankedWithoutArmy,
        { kind: "blank", targets: [{ suit: "land" }] },
      ]);

      expect(calculateScore([subject, aLand])).toBe(0);
    });

    it("checks all self-blanks at once", () => {
      const needsWeapon = card("needs-weapon", "wizard", 2, [
        { kind: "blankSelf", when: { absent: { suit: "weapon" } } },
      ]);

      expect(calculateScore([selfBlanker, needsWeapon])).toBe(2);
      expect(calculateScore([needsWeapon, selfBlanker])).toBe(2);
    });

    it("doesn't apply when the penalty is cleared", () => {
      const clearsWeapons = card("clearer", "land", 1, [
        { kind: "clearPenalty", targets: [{ suit: "weapon" }] },
      ]);

      expect(calculateScore([selfBlanker, clearsWeapons])).toBe(41);
    });

    it("treats a self-blanked card as absent when points are added", () => {
      const withoutWeapon = card("subject", "wizard", 1, [
        { kind: "points", points: 5, when: { absent: { suit: "weapon" } } },
      ]);

      expect(calculateScore([selfBlanker, withoutWeapon])).toBe(6); // 1 + 5, self-blanker blanked
    });

    it("counts for other cards when a clear keeps it in play", () => {
      const clearsWeapons = card("clearer", "land", 1, [
        { kind: "clearPenalty", targets: [{ suit: "weapon" }] },
      ]);
      const perWeapon = card("subject", "wizard", 1, [
        { kind: "points", points: 5, per: { suit: "weapon" } },
      ]);

      expect(calculateScore([selfBlanker, clearsWeapons, perWeapon])).toBe(47); // (35 + 5) + 1 + (1 + 5)
    });
  });

  describe("clearPenaltySuitWord effects", () => {
    const withPenalty = (
      base: Card,
      effects: readonly CardEffect[],
    ): Card => ({ ...base, penalty: { text: "", effects } });
    const subject = (effects: readonly CardEffect[]) =>
      withPenalty(card("subject", "flame", 10), effects);
    const clearer = card("clearer", "wizard", 1, [
      { kind: "clearPenaltySuitWord", suit: "army" },
    ]);
    const minusThreePerArmy: CardEffect = {
      kind: "points",
      points: -3,
      per: { suit: "army" },
    };

    it("leaves the penalty in place without the clearer", () => {
      expect(calculateScore([subject([minusThreePerArmy]), anArmy])).toBe(17); // (10 - 3) + 10
    });

    it("removes a per effect naming the suit", () => {
      expect(
        calculateScore([subject([minusThreePerArmy]), anArmy, clearer]),
      ).toBe(21); // 10 + 10 + 1
    });

    it("works wherever the clearer sits in the hand", () => {
      expect(
        calculateScore([clearer, anArmy, subject([minusThreePerArmy])]),
      ).toBe(21); // 1 + 10 + 10
    });

    it("keeps a per effect naming another suit", () => {
      expect(
        calculateScore([
          subject([
            minusThreePerArmy,
            { kind: "points", points: -3, per: { suit: "land" } },
          ]),
          anArmy,
          aLand,
          clearer,
        ]),
      ).toBe(22); // (10 - 3) + 10 + 4 + 1
    });

    it("removes the suit from blank targets, keeping the others", () => {
      expect(
        calculateScore([
          subject([
            { kind: "blank", targets: [{ suit: "army" }, { suit: "land" }] },
          ]),
          anArmy,
          aLand,
          clearer,
        ]),
      ).toBe(21); // 10 + 10 + 1, Land blanked
    });

    it("removes a self-blank that applies without the suit", () => {
      const blankedWithoutArmy: CardEffect = {
        kind: "blankSelf",
        when: { absent: { suit: "army" } },
      };

      expect(calculateScore([subject([blankedWithoutArmy])])).toBe(0);
      expect(calculateScore([subject([blankedWithoutArmy]), clearer])).toBe(11); // 10 + 1
    });

    it("removes a self-blank that applies with the suit", () => {
      expect(
        calculateScore([
          subject([{ kind: "blankSelf", when: { present: { suit: "army" } } }]),
          anArmy,
          clearer,
        ]),
      ).toBe(21); // 10 + 10 + 1
    });

    it("removes the effect when an allOf condition names the suit", () => {
      expect(
        calculateScore([
          subject([
            {
              kind: "points",
              points: -5,
              when: {
                allOf: [
                  { absent: { suit: "army" } },
                  { present: { suit: "land" } },
                ],
              },
            },
          ]),
          aLand,
          clearer,
        ]),
      ).toBe(15); // 10 + 4 + 1
    });

    it("removes the effect when an anyOf condition names the suit", () => {
      expect(
        calculateScore([
          subject([
            {
              kind: "points",
              points: -5,
              when: {
                anyOf: [
                  { present: { suit: "army" } },
                  { present: { suit: "land" } },
                ],
              },
            },
          ]),
          aLand,
          clearer,
        ]),
      ).toBe(15); // 10 + 4 + 1
    });

    it("keeps a condition naming another suit", () => {
      expect(
        calculateScore([
          subject([
            { kind: "points", points: -5, when: { absent: { suit: "leader" } } },
          ]),
          clearer,
        ]),
      ).toBe(6); // (10 - 5) + 1
    });

    it("keeps a condition naming a specific card of that suit", () => {
      expect(
        calculateScore([
          subject([
            {
              kind: "points",
              points: -5,
              when: { present: { cardId: anArmy.id } },
            },
          ]),
          anArmy,
          clearer,
        ]),
      ).toBe(16); // (10 - 5) + 10 + 1
    });

    it("leaves bonuses alone", () => {
      expect(
        calculateScore([
          card("subject", "flame", 1, [pointsPerArmy]),
          anArmy,
          clearer,
        ]),
      ).toBe(17); // (1 + 5) + 10 + 1
    });

    it("still clears when the clearer is blanked, as clearing comes first", () => {
      const blanksWizards = card("blanker", "weapon", 1, [
        { kind: "blank", targets: [{ suit: "wizard" }] },
      ]);

      expect(
        calculateScore([
          subject([minusThreePerArmy]),
          anArmy,
          clearer,
          blanksWizards,
        ]),
      ).toBe(21); // 10 + 10 + 1, clearer blanked
    });

    it("protects a clearer of that suit from being blanked", () => {
      const armyClearer = card("clearer", "army", 1, [
        { kind: "clearPenaltySuitWord", suit: "army" },
      ]);

      expect(
        calculateScore([
          subject([{ kind: "blank", targets: [{ suit: "army" }] }]),
          armyClearer,
        ]),
      ).toBe(11); // 10 + 1
    });

    it("keeps a blank naming a specific card of that suit", () => {
      expect(
        calculateScore([
          subject([{ kind: "blank", targets: [{ cardId: anArmy.id }] }]),
          anArmy,
          clearer,
        ]),
      ).toBe(11); // 10 + 1, Army blanked
    });

    it("counts for other cards when it keeps a self-blanking card in play", () => {
      const perFlame = card("counter", "wizard", 1, [
        { kind: "points", points: 5, per: { suit: "flame" } },
      ]);

      expect(
        calculateScore([
          subject([{ kind: "blankSelf", when: { absent: { suit: "army" } } }]),
          clearer,
          perFlame,
        ]),
      ).toBe(17); // 10 + 1 + (1 + 5)
    });

    it("works alongside a clear of the whole penalty", () => {
      const clearsFlames = card("whole-clearer", "land", 1, [
        { kind: "clearPenalty", targets: [{ suit: "flame" }] },
      ]);

      expect(
        calculateScore([
          subject([minusThreePerArmy, { kind: "points", points: -2 }]),
          anArmy,
          clearer,
          clearsFlames,
        ]),
      ).toBe(22); // 10 + 10 + 1 + 1
    });

    it("only counts when it's in the bonus slot", () => {
      const penaltyClearer = withPenalty(card("clearer", "wizard", 1), [
        { kind: "clearPenaltySuitWord", suit: "army" },
      ]);

      expect(
        calculateScore([subject([minusThreePerArmy]), anArmy, penaltyClearer]),
      ).toBe(18); // (10 - 3) + 10 + 1
    });
  });
});
