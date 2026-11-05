import { Card, CardEffect, CardMatcher, EffectCondition, Suit } from "./card";

/*
  Rulebook, on the rules this file implements:

  Blanking: "A blanked card should be considered to have no name, no suit, no base strength, no bonuses, and no
  penalties, so it should have no effect on other cards at all."

  Clearing: "A special kind of bonus is the ability to clear penalties or parts of penalties from other cards. A card
  that has had its penalty cleared still keeps its suit, base strength, bonus, and name. Clearing takes place before
  any penalties are applied."

  Rulebook Q&A: "Follow any instructions which call for the clearing of a penalty or part of a penalty. Finally, apply
  all penalties, beginning with cards not blanked by any other cards."

  Working rule, which may be a paraphrase rather than printed wording: "All blanking is considered to have happened
  simultaneously. Any card that still blanks at the point we're checking blanking will blank all cards that it affects,
  even if another card would blank it."

  Our interpretation of how these fit together, so scoring runs in this order:
  1. Clear penalties, and suit words from penalties.
  2. Apply blanks that target other cards, all at once across the whole hand.
  3. Check self-blanks, all at once, against the cards left after step 2.
  4. Add up points using only the cards left after step 3.
*/

// Returns all effects of the specified card, including both bonus and penalty effects.
function effectsOf(card: Card): readonly CardEffect[] {
  return [...(card.bonus?.effects ?? []), ...(card.penalty?.effects ?? [])];
}

//  Checks if the card matches the specified matcher. A matcher can either specify a suit, optionally excepting specific cards, or a specific card ID.
function matches(card: Card, matcher: CardMatcher): boolean {
  return "suit" in matcher
    ? card.suit === matcher.suit && !matcher.except?.includes(card.id)
    : card.id === matcher.cardId;
}

// Returns all cards in the hand except the specified card
function othersIn(cards: readonly Card[], card: Card): readonly Card[] {
  return cards.filter((other) => other.id !== card.id);
}

// Checks if any other card in the hand has a "clearPenalty" bonus that targets the specified card.
function isPenaltyCleared(card: Card, cards: readonly Card[]): boolean {
  return othersIn(cards, card).some((other) =>
    (other.bonus?.effects ?? []).some(
      (effect) =>
        effect.kind === "clearPenalty" &&
        effect.targets.some((target) => matches(card, target)),
    ),
  );
}

// Removes cleared penalties. Rulebook: "Clearing takes place before any penalties are applied", so this looks at the full hand, and a card that is later blanked still clears.
function withoutClearedPenalties(cards: readonly Card[]): readonly Card[] {
  return cards.map((card) => {
    if (!isPenaltyCleared(card, cards)) {
      return card;
    }

    const { penalty, ...cleared } = card;

    return cleared;
  });
}

// Checks if a matcher names the specified suit. A matcher naming a specific card doesn't count, even if that card is of the suit.
function namesSuit(matcher: CardMatcher, suit: Suit): boolean {
  return "suit" in matcher && matcher.suit === suit;
}

// Checks if a condition, or any part of it, names the specified suit.
function conditionNamesSuit(condition: EffectCondition, suit: Suit): boolean {
  if ("allOf" in condition) {
    return condition.allOf.some((part) => conditionNamesSuit(part, suit));
  }

  if ("anyOf" in condition) {
    return condition.anyOf.some((part) => conditionNamesSuit(part, suit));
  }

  if ("allSuitsDifferent" in condition) {
    return false;
  }

  return namesSuit(
    "present" in condition ? condition.present : condition.absent,
    suit,
  );
}

// Removes a suit from penalty effects. A blank keeps its other targets. An effect that counts the suit, or whose condition names it, no longer applies at all.
function withoutPenaltySuitWord(
  effects: readonly CardEffect[],
  suit: Suit,
): readonly CardEffect[] {
  return effects.flatMap((effect): readonly CardEffect[] => {
    if (effect.kind === "blank") {
      return [
        {
          ...effect,
          targets: effect.targets.filter((target) => !namesSuit(target, suit)),
        },
      ];
    }

    if (effect.kind === "points" && effect.per && namesSuit(effect.per, suit)) {
      return [];
    }

    if (effect.kind === "sum" && namesSuit(effect.of, suit)) {
      return [];
    }

    if (
      (effect.kind === "points" || effect.kind === "blankSelf") &&
      effect.when &&
      conditionNamesSuit(effect.when, suit)
    ) {
      return [];
    }

    return [effect];
  });
}

// Removes suit words from penalties, which is clearing part of a penalty. A clear with targets only reaches the cards they match; one without reaches every other card. Like other clearing, this looks at the full hand, so a card that is later blanked still clears.
function withoutClearedPenaltySuitWords(cards: readonly Card[]): readonly Card[] {
  return cards.map((card) => {
    const { penalty } = card;

    if (!penalty) {
      return card;
    }

    const effects = othersIn(cards, card)
      .flatMap((other) => other.bonus?.effects ?? [])
      .reduce(
        (remaining, effect) =>
          effect.kind === "clearPenaltySuitWord" &&
          (!effect.targets || effect.targets.some((target) => matches(card, target)))
            ? withoutPenaltySuitWord(remaining, effect.suit)
            : remaining,
        penalty.effects,
      );

    return { ...card, penalty: { ...penalty, effects } };
  });
}

// Checks if the specified card is blanked by any other card in the hand. Blanking is simultaneous, so this looks at the full hand, including cards that are themselves blanked.
function isBlanked(card: Card, cards: readonly Card[]): boolean {
  return othersIn(cards, card).some((other) =>
    effectsOf(other).some(
      (effect) =>
        effect.kind === "blank" &&
        effect.targets.some((target) => matches(card, target)),
    ),
  );
}


// Checks if the specified card blanks itself, based on the other cards left after blanks that target other cards.
function blanksItself(card: Card, others: readonly Card[]): boolean {
  return effectsOf(card).some(
    (effect) =>
      effect.kind === "blankSelf" && conditionHolds(effect.when, card, others),
  );
}

// Checks if the specified card and the other cards are all of different suits.
function allSuitsDiffer(card: Card, others: readonly Card[]): boolean {
  const suits = [card, ...others].map(({ suit }) => suit);

  return new Set(suits).size === suits.length;
}

// Checks if the specified effect condition holds true for the card that owns the effect, based on the other cards in the hand. A condition can require the presence or absence of a specific card or suit, that all or any of several conditions hold, or that the owner and the other cards are all of different suits.
function conditionHolds(
  condition: EffectCondition,
  card: Card,
  others: readonly Card[],
): boolean {
  if ("allOf" in condition) {
    return condition.allOf.every((part) => conditionHolds(part, card, others));
  }

  if ("anyOf" in condition) {
    return condition.anyOf.some((part) => conditionHolds(part, card, others));
  }

  if ("allSuitsDifferent" in condition) {
    return allSuitsDiffer(card, others);
  }

  return "present" in condition
    ? others.some((other) => matches(other, condition.present))
    : !others.some((other) => matches(other, condition.absent));
}


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
  const cleared = withoutClearedPenaltySuitWords(withoutClearedPenalties(cards));

  // Blanking takes place simultaneously
  const notBlankedByOthers = cleared.filter((card) => !isBlanked(card, cleared));
  const remaining = notBlankedByOthers.filter(
    (card) => !blanksItself(card, othersIn(notBlankedByOthers, card)),
  );

  return remaining.reduce((score, card) => {
    const others = othersIn(remaining, card);

    return effectsOf(card).reduce(
      (total, effect) => total + effectPoints(effect, card, others),
      score + card.baseStrength,
    );
  }, 0);
}
