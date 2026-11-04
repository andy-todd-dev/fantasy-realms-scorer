import { Card, CardEffect, CardMatcher, EffectCondition } from "./card";

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
  1. Clear penalties.
  2. Apply blanks that target other cards, all at once across the whole hand.
  3. Check self-blanks, all at once, against the cards left after step 2.
  4. Add up points using only the cards left after step 3.
*/

// Returns all effects of the specified card, including both bonus and penalty effects.
function effectsOf(card: Card): readonly CardEffect[] {
  return [...(card.bonus?.effects ?? []), ...(card.penalty?.effects ?? [])];
}

//  Checks if the card matches the specified matcher. A matcher can either specify a suit or a specific card ID.
function matches(card: Card, matcher: CardMatcher): boolean {
  return "suit" in matcher
    ? card.suit === matcher.suit
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
      effect.kind === "blankSelf" && conditionHolds(effect.when, others),
  );
}

// Checks if the specified effect condition holds true based on the other cards in the hand. A condition can require the presence or absence of a specific card or suit, or that all of several conditions hold.
function conditionHolds(
  condition: EffectCondition,
  others: readonly Card[],
): boolean {
  if ("allOf" in condition) {
    return condition.allOf.every((part) => conditionHolds(part, others));
  }

  return "present" in condition
    ? others.some((other) => matches(other, condition.present))
    : !others.some((other) => matches(other, condition.absent));
}


// Calculates the points contributed by a specific effect based on the other cards in the hand. 
function effectPoints(effect: CardEffect, others: readonly Card[]): number {
  if (effect.kind !== "points") {
    return 0;
  }

  if (effect.when && !conditionHolds(effect.when, others)) {
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
  const cleared = withoutClearedPenalties(cards);

  // Blanking takes place simultaneously
  const notBlankedByOthers = cleared.filter((card) => !isBlanked(card, cleared));
  const remaining = notBlankedByOthers.filter(
    (card) => !blanksItself(card, othersIn(notBlankedByOthers, card)),
  );

  return remaining.reduce((score, card) => {
    const others = othersIn(remaining, card);

    return effectsOf(card).reduce(
      (total, effect) => total + effectPoints(effect, others),
      score + card.baseStrength,
    );
  }, 0);
}
