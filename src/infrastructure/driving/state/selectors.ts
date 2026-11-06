import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

// Display only: the target for a hand, not a limit. The Necromancer allows an 8th card.
const HAND_SIZE = 7;

const selectCards = (state: RootState) => state.cards.items;

export const selectCardsStatus = (state: RootState) => state.cards.status;
export const selectHandCardIds = (state: RootState) => state.hand.cardIds;
const selectHandScore = (state: RootState) => state.score.value;
export const selectScore = (state: RootState) =>
  state.score.value?.total ?? null;
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

const MINUS = "\u2212";

const signed = (points: number) =>
  points > 0 ? `+${points}` : points < 0 ? `${MINUS}${-points}` : "0";

// Bonus or penalty points for a card row, left out when there are none.
const signedIfAny = (points: number) => (points === 0 ? null : signed(points));

// The hand score split up for display. Cards are listed highest-scoring first; a card not yet scored, while a new score is in flight, comes last with no figures.
export const selectBreakdown = createSelector(
  [selectHandCards, selectHandScore],
  (cards, handScore) => {
    const rows = cards
      .map(({ id, name, suit }) => {
        const cardScore = handScore?.cards.find(
          (scored) => scored.cardId === id,
        );

        return {
          id,
          name,
          suit,
          blanked: cardScore?.blanked ?? false,
          points: cardScore?.total ?? null,
          figures: cardScore && {
            total: String(cardScore.total),
            base: String(cardScore.base),
            bonus: signedIfAny(cardScore.bonus),
            penalty: signedIfAny(cardScore.penalty),
          },
        };
      })
      // Stable, so ties keep hand order. Unscored cards rank as -Infinity, and two of them give NaN, which || 0 treats as a tie.
      .sort((a, b) => (b.points ?? -Infinity) - (a.points ?? -Infinity) || 0);

    const blankedNames = rows
      .filter(({ blanked }) => blanked)
      .map(({ name }) => name);

    return {
      stats: handScore && {
        base: String(handScore.base),
        bonus: signed(handScore.bonus),
        penalty: signed(handScore.penalty),
      },
      rows,
      sum:
        handScore &&
        `${handScore.base} + ${handScore.bonus} ${MINUS} ${-handScore.penalty}`,
      blanked: blankedNames.length > 0 ? blankedNames.join(", ") : "none",
    };
  },
);

export type BreakdownRow = ReturnType<typeof selectBreakdown>["rows"][number];
