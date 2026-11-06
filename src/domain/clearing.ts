import { Card, CardEffect, Suit } from "./card";
import { matches, namesSuit, othersIn } from "./card-matching";
import { conditionNamesSuit } from "./conditions";

/*
  Rulebook: "A special kind of bonus is the ability to clear penalties or parts of penalties from other cards. A card
  that has had its penalty cleared still keeps its suit, base strength, bonus, and name. Clearing takes place before
  any penalties are applied."
*/

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
function withoutClearedPenaltySuitWords(
  cards: readonly Card[],
): readonly Card[] {
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
          (!effect.targets ||
            effect.targets.some((target) => matches(card, target)))
            ? withoutPenaltySuitWord(remaining, effect.suit)
            : remaining,
        penalty.effects,
      );

    return { ...card, penalty: { ...penalty, effects } };
  });
}

// Applies all clearing: whole penalties, then suit words from penalties.
export function withPenaltiesCleared(cards: readonly Card[]): readonly Card[] {
  return withoutClearedPenaltySuitWords(withoutClearedPenalties(cards));
}
