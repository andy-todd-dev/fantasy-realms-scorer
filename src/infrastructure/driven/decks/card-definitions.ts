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

export const points = (
  amount: number,
  options: { per?: CardMatcher; when?: EffectCondition } = {},
): CardEffect => ({ kind: "points", points: amount, ...options });

export const blank = (...targets: CardMatcher[]): CardEffect => ({
  kind: "blank",
  targets,
});
