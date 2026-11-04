import { createSelector } from "@reduxjs/toolkit";
import type { Suit } from "../../../domain/card";
import type { RootState } from "./store";

// Display only: the target for a hand, not a limit. The Necromancer allows an 8th card.
const HAND_SIZE = 7;

// A Record, so that adding a suit without giving it a place is a type error.
const SUIT_ORDER: Record<Suit, number> = {
  army: 0,
  wizard: 1,
  leader: 2,
  beast: 3,
  land: 4,
  flood: 5,
  weather: 6,
  flame: 7,
  weapon: 8,
  artifact: 9,
  wild: 10,
};

const selectCards = (state: RootState) => state.cards.items;

export const selectCardsStatus = (state: RootState) => state.cards.status;
export const selectHandCardIds = (state: RootState) => state.hand.cardIds;
export const selectScore = (state: RootState) => state.score.value;
export const selectScreen = (state: RootState) => state.navigation.screen;

export const selectCardSections = createSelector(
  [selectCards, selectHandCardIds],
  (cards, handCardIds) =>
    [...new Set(cards.map((card) => card.suit))]
      .sort((a, b) => SUIT_ORDER[a] - SUIT_ORDER[b])
      .map((suit) => ({
        suit,
        cards: cards
          .filter((card) => card.suit === suit)
          .map(({ id, name }) => ({
            id,
            name,
            selected: handCardIds.includes(id),
          })),
      })),
);

export type CardSection = ReturnType<typeof selectCardSections>[number];
export type CardTile = CardSection["cards"][number];

export const selectHandProgress = createSelector(
  [selectHandCardIds],
  ({ length: count }) => {
    const isOverTarget = count > HAND_SIZE;

    return {
      count,
      remaining: Math.max(HAND_SIZE - count, 0),
      isComplete: count >= HAND_SIZE,
      countLabel: isOverTarget ? `${count} cards` : `${count} of ${HAND_SIZE}`,
      longCountLabel: isOverTarget
        ? `${count} cards`
        : `${count} of ${HAND_SIZE} cards`,
    };
  },
);

export const selectHandCards = createSelector(
  [selectCards, selectHandCardIds],
  (cards, handCardIds) =>
    handCardIds.flatMap((cardId) => cards.filter((card) => card.id === cardId)),
);
