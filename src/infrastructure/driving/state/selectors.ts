import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

const selectCards = (state: RootState) => state.cards.items;
const selectOpenCardId = (state: RootState) => state.cardDetails.openCardId;

export const selectCardsStatus = (state: RootState) => state.cards.status;
export const selectHandCardIds = (state: RootState) => state.hand.cardIds;
export const selectScore = (state: RootState) => state.score.value;

export const selectCardOptions = createSelector(
  [selectCards, selectHandCardIds, selectOpenCardId],
  (cards, handCardIds, openCardId) =>
    cards.map((card) => ({
      ...card,
      canAddToHand: !handCardIds.includes(card.id),
      isDetailsOpen: card.id === openCardId,
    })),
);

export type CardOption = ReturnType<typeof selectCardOptions>[number];

export const selectHandCards = createSelector(
  [selectCards, selectHandCardIds],
  (cards, handCardIds) =>
    handCardIds.flatMap((cardId) => cards.filter((card) => card.id === cardId)),
);
