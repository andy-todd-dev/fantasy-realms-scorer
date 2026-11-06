import { Card, CardEffect } from "./card";
import { withoutBlankedCards } from "./blanking";
import { effectsOf, matches, othersIn } from "./card-matching";
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

/*
  Calculates the total score for a hand of cards
*/
export function calculateScore(cards: readonly Card[]): number {
  // Clearing takes place before any penalties are applied
  const cleared = withPenaltiesCleared(cards);

  // Filter out blanked cards
  const remaining = withoutBlankedCards(cleared);

  // Calculate score based on what is left
  return remaining.reduce((score, card) => {
    const others = othersIn(remaining, card);

    return effectsOf(card).reduce(
      (total, effect) => total + effectPoints(effect, card, others),
      score + card.baseStrength,
    );
  }, 0);
}
