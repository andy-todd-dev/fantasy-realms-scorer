import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

// Display only: the target for a hand, not a limit. The Necromancer allows an 8th card.
const HAND_SIZE = 7;

const selectCards = (state: RootState) => state.cards.items;

export const selectCardsStatus = (state: RootState) => state.cards.status;
export const selectHandCardIds = (state: RootState) => state.hand.cardIds;
export const selectScore = (state: RootState) => state.score.value;
export const selectScreen = (state: RootState) => state.navigation.screen;

export const selectCardSections = createSelector(
  [selectCards, selectHandCardIds],
  (cards, handCardIds) =>
    [...new Set(cards.map((card) => card.suit))]
      .sort((a, b) => a.localeCompare(b))
      .map((suit) => ({
        suit,
        cards: cards
          .filter((card) => card.suit === suit)
          .sort((a, b) => a.name.localeCompare(b.name))
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
    const isComplete = count >= HAND_SIZE;
    const countText = isComplete
      ? `${count} cards`
      : `${count} of ${HAND_SIZE} cards`;

    return {
      isEmpty: count === 0,
      isComplete,
      // One entry per slot, true when filled. A hand over the target gets extra slots.
      pips: Array.from(
        { length: Math.max(HAND_SIZE, count) },
        (_, index) => index < count,
      ),
      countLabel:
        count === 0
          ? "Tap cards or scan"
          : isComplete
            ? `${countText} ✓`
            : countText,
      reviewLabel: isComplete ? `${countText} · complete` : countText,
      pipsAccessibilityLabel: `${countText}. Show breakdown`,
    };
  },
);

export const selectHandCards = createSelector(
  [selectCards, selectHandCardIds],
  (cards, handCardIds) =>
    handCardIds.flatMap((cardId) => cards.filter((card) => card.id === cardId)),
);
