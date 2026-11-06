import { CardId } from "./card";

export type Hand = readonly CardId[];

export function isCardInHand(hand: Hand, cardId: CardId): boolean {
  return hand.includes(cardId);
}

export function addCardToHand(hand: Hand, cardId: CardId): Hand {
  return isCardInHand(hand, cardId) ? hand : [...hand, cardId];
}

export function removeCardFromHand(hand: Hand, cardId: CardId): Hand {
  return isCardInHand(hand, cardId) ? hand.filter((id) => id !== cardId) : hand;
}

export function emptyHand(): Hand {
  return [];
}
