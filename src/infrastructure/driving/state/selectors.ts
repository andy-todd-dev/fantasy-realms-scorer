import { createSelector } from "@reduxjs/toolkit";
import { isCardInHand } from "../../../domain/hand";
import type { RootState } from "./store";

const selectCards = (state: RootState) => state.cards.items;
const selectHand = (state: RootState) => state.hand.cardIds;
const selectOpenCardId = (state: RootState) => state.cardDetails.openCardId;

export const selectCardsStatus = (state: RootState) => state.cards.status;

export const selectCardOptions = createSelector(
  [selectCards, selectHand, selectOpenCardId],
  (cards, hand, openCardId) =>
    cards.map((card) => ({
      ...card,
      canAddToHand: !isCardInHand(hand, card.id),
      isDetailsOpen: card.id === openCardId,
    })),
);

export type CardOption = ReturnType<typeof selectCardOptions>[number];

export const selectHandCards = createSelector(
  [selectCards, selectHand],
  (cards, hand) =>
    hand.flatMap((cardId) => cards.filter((card) => card.id === cardId)),
);
