import { createSelector } from "@reduxjs/toolkit";
import { isCardInHand } from "../../../domain/hand";
import type { RootState } from "./store";

const selectCards = (state: RootState) => state.cards.items;
const selectHand = (state: RootState) => state.hand.cardIds;

export const selectCardsStatus = (state: RootState) => state.cards.status;

export const selectCardOptions = createSelector(
  [selectCards, selectHand],
  (cards, hand) =>
    cards.map((card) => ({
      ...card,
      isSelectable: !isCardInHand(hand, card.id),
    })),
);

export const selectHandCards = createSelector(
  [selectCards, selectHand],
  (cards, hand) =>
    hand.flatMap((cardId) => cards.filter((card) => card.id === cardId)),
);
