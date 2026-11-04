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

export type SuitMatcher = {
  readonly suit: Suit;
  readonly except?: readonly CardId[];
};

export type CardIdMatcher = { readonly cardId: CardId };

export type CardMatcher = SuitMatcher | CardIdMatcher;

export type EffectCondition =
  | { readonly present: CardMatcher }
  | { readonly absent: CardMatcher }
  | { readonly allOf: readonly EffectCondition[] }
  | { readonly anyOf: readonly EffectCondition[] }
  | { readonly allSuitsDifferent: true };

export type CardEffect =
  | {
      readonly kind: "points";
      readonly points: number;
      readonly per?: CardMatcher;
      readonly when?: EffectCondition;
    }
  | {
      readonly kind: "sum";
      readonly of: CardMatcher;
      readonly attribute: "baseStrength";
    }
  | {
      readonly kind: "baseStrengthRun";
      readonly tiers: readonly {
        readonly length: number;
        readonly points: number;
      }[];
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
    }
  | {
      readonly kind: "clearPenaltySuitWord";
      readonly suit: Suit;
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
