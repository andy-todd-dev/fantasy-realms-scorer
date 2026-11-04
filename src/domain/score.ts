import { Card, CardEffect, CardMatcher, EffectCondition } from "./card";

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

// Checks if the specified card is blanked by any other card in the hand. A card is considered blanked if any other card has a "blank" effect that targets it.
function isBlanked(card: Card, cards: readonly Card[]): boolean {
  return othersIn(cards, card).some((other) =>
    effectsOf(other).some(
      (effect) =>
        effect.kind === "blank" &&
        effect.targets.some((target) => matches(card, target)),
    ),
  );
}


// Checks if the specified effect condition holds true based on the other cards in the hand. A condition can either require the presence or absence of a specific card or suit.
function conditionHolds(
  condition: EffectCondition,
  others: readonly Card[],
): boolean {
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
  const remaining = cards.filter((card) => !isBlanked(card, cards));

  return remaining.reduce((score, card) => {
    const others = othersIn(remaining, card);

    return effectsOf(card).reduce(
      (total, effect) => total + effectPoints(effect, others),
      score + card.baseStrength,
    );
  }, 0);
}
