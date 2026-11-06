import { Card, CardEffect, CardId } from "./card";
import { withoutBlankedCards } from "./blanking";
import { matches, othersIn } from "./card-matching";
import { withPenaltiesCleared } from "./clearing";
import { conditionHolds } from "./conditions";

/*
  Rulebook Q&A: "Follow any instructions which call for the clearing of a penalty or part of a penalty. Finally, apply
  all penalties, beginning with cards not blanked by any other cards."

  Our interpretation of how these fit together, so scoring runs in this order:
  1. Clear penalties, and suit words from penalties (clearing.ts).
  2. Apply blanks, both those that target other cards and self-blanks, in rounds. Each round settles the cards whose
     fate no longer depends on unsettled cards, so blanked cards neither blank others nor trigger their self-blanks.
     Cards never settled are caught in a loop, or blanked only by cards in one, and are blanked (blanking.ts).
  3. Add up points using only the cards left after step 2.
*/

// Returns the length of the longest run of consecutive base strengths. Duplicate strengths neither break nor extend a run.
function longestBaseStrengthRun(cards: readonly Card[]): number {
  const strengths = new Set(cards.map(({ baseStrength }) => baseStrength));

  return Math.max(
    0,
    ...[...strengths].map((strength) => {
      let length = 1;

      while (strengths.has(strength + length)) {
        length += 1;
      }

      return length;
    }),
  );
}

// Returns the points of the highest tier that the longest run in the hand reaches. Tiers don't add up, only the longest run pays, and a run longer than the top tier pays nothing extra.
function baseStrengthRunPoints(
  tiers: Extract<CardEffect, { kind: "baseStrengthRun" }>["tiers"],
  cards: readonly Card[],
): number {
  const run = longestBaseStrengthRun(cards);

  return tiers
    .filter(({ length }) => length <= run)
    .reduce((best, tier) => (tier.length > best.length ? tier : best), {
      length: 0,
      points: 0,
    }).points;
}

// Calculates the points contributed by a specific effect of the specified card, based on the other cards in the hand.
function effectPoints(
  effect: CardEffect,
  card: Card,
  others: readonly Card[],
): number {
  if (effect.kind === "baseStrengthRun") {
    return baseStrengthRunPoints(effect.tiers, [card, ...others]);
  }

  if (effect.kind === "sum") {
    return others
      .filter((other) => matches(other, effect.of))
      .reduce((total, other) => total + other[effect.attribute], 0);
  }

  if (effect.kind !== "points") {
    return 0;
  }

  if (effect.when && !conditionHolds(effect.when, card, others)) {
    return 0;
  }

  const { per } = effect;

  return per
    ? effect.points * others.filter((other) => matches(other, per)).length
    : effect.points;
}

export type CardScore = {
  readonly cardId: CardId;
  readonly blanked: boolean;
  readonly base: number;
  readonly bonus: number;
  // Zero or negative.
  readonly penalty: number;
  readonly total: number;
};

export type HandScore = {
  // In the order the cards were given.
  readonly cards: readonly CardScore[];
  readonly base: number;
  readonly bonus: number;
  readonly penalty: number;
  readonly total: number;
};

// Adds up the points from some effects of the specified card.
function sumOfEffects(
  effects: readonly CardEffect[] | undefined,
  card: Card,
  others: readonly Card[],
): number {
  return (effects ?? []).reduce(
    (total, effect) => total + effectPoints(effect, card, others),
    0,
  );
}

const BLANKED = { blanked: true, base: 0, bonus: 0, penalty: 0, total: 0 };

/*
  Scores a hand of cards, card by card. Points from a card's bonus count as bonus and points from its penalty count as
  penalty. A blanked card is listed, scoring nothing.
*/
export function scoreHand(cards: readonly Card[]): HandScore {
  // Clearing takes place before any penalties are applied
  const cleared = withPenaltiesCleared(cards);

  // Filter out blanked cards
  const remaining = withoutBlankedCards(cleared);

  // Score each card based on what is left
  const cardScores = cards.map(({ id }): CardScore => {
    const card = remaining.find((other) => other.id === id);

    if (!card) {
      return { cardId: id, ...BLANKED };
    }

    const others = othersIn(remaining, card);
    const bonus = sumOfEffects(card.bonus?.effects, card, others);
    const penalty = sumOfEffects(card.penalty?.effects, card, others);

    return {
      cardId: id,
      blanked: false,
      base: card.baseStrength,
      bonus,
      penalty,
      total: card.baseStrength + bonus + penalty,
    };
  });

  const sum = (key: "base" | "bonus" | "penalty" | "total") =>
    cardScores.reduce((total, cardScore) => total + cardScore[key], 0);

  return {
    cards: cardScores,
    base: sum("base"),
    bonus: sum("bonus"),
    penalty: sum("penalty"),
    total: sum("total"),
  };
}

// Calculates the total score for a hand of cards
export function calculateScore(cards: readonly Card[]): number {
  return scoreHand(cards).total;
}
