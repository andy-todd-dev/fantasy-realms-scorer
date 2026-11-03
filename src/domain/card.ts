export type CardId = string;

export type Suit =
  | "army"
  | "leader"
  | "wizard"
  | "weapon"
  | "artefact"
  | "beast"
  | "land"
  | "weather"
  | "flood"
  | "flame"
  | "wild";

export type CardEffect = {
  readonly text: string;
};

export type Card = {
  readonly id: CardId;
  readonly name: string;
  readonly suit: Suit;
  readonly baseStrength: number;
  readonly bonus?: CardEffect;
  readonly penalty?: CardEffect;
};
