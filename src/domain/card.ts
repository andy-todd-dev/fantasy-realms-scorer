export type CardId = string;

export type Suit =
  | "army"
  | "leader"
  | "wizard"
  | "weapon"
  | "artifact"
  | "beast"
  | "land"
  | "weather"
  | "flood"
  | "flame"
  | "wild";

export type CardMatcher =
  | { readonly suit: Suit }
  | { readonly cardId: CardId };

export type EffectCondition =
  | { readonly present: CardMatcher }
  | { readonly absent: CardMatcher }
  | { readonly allOf: readonly EffectCondition[] };

export type CardEffect =
  | {
      readonly kind: "points";
      readonly points: number;
      readonly per?: CardMatcher;
      readonly when?: EffectCondition;
    }
  | {
      readonly kind: "blank";
      readonly targets: readonly CardMatcher[];
    }
  | {
      readonly kind: "blankSelf";
      readonly when: EffectCondition;
    }
  | {
      readonly kind: "clearPenalty";
      readonly targets: readonly CardMatcher[];
    };

export type CardAbility = {
  readonly text: string;
  readonly effects: readonly CardEffect[];
};

export type Card = {
  readonly id: CardId;
  readonly name: string;
  readonly suit: Suit;
  readonly baseStrength: number;
  readonly bonus?: CardAbility;
  readonly penalty?: CardAbility;
};
