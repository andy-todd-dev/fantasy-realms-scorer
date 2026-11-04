import type {
  Card,
  CardEffect,
  CardMatcher,
  EffectCondition,
  Suit,
} from "../../../domain/card";

export type CardDefinition = Omit<Card, "id">;

export const suit = (suitName: Suit): CardMatcher => ({ suit: suitName });

export const present = (matcher: CardMatcher): EffectCondition => ({
  present: matcher,
});

export const absent = (matcher: CardMatcher): EffectCondition => ({
  absent: matcher,
});

export const allOf = (...conditions: EffectCondition[]): EffectCondition => ({
  allOf: conditions,
});

export const anyOf = (...conditions: EffectCondition[]): EffectCondition => ({
  anyOf: conditions,
});

export const points = (
  amount: number,
  options: { per?: CardMatcher; when?: EffectCondition } = {},
): CardEffect => ({ kind: "points", points: amount, ...options });

export const blank = (...targets: CardMatcher[]): CardEffect => ({
  kind: "blank",
  targets,
});

export const blankSelf = ({ when }: { when: EffectCondition }): CardEffect => ({
  kind: "blankSelf",
  when,
});

export const clearPenalty = (...targets: CardMatcher[]): CardEffect => ({
  kind: "clearPenalty",
  targets,
});

export const clearPenaltySuitWord = (suitName: Suit): CardEffect => ({
  kind: "clearPenaltySuitWord",
  suit: suitName,
});
