import { Card } from "./card";
import { effectsOf, matches, othersIn } from "./card-matching";
import { anyTrue, conditionTruth, Truth } from "./conditions";

/*
  Rulebook: "A blanked card should be considered to have no name, no suit, no base strength, no bonuses, and no
  penalties, so it should have no effect on other cards at all."

  Rulebook Q&A: "Finally, apply all penalties, beginning with cards not blanked by any other cards."

  Rulebook Q&A example: "You have a Blizzard (blanks Floods), a Great Flood (blanks Flames and Lands), a Wildfire
  (blanks Lands), and Cavern (clears penalties on Weather). [...] If you did not have the Cavern, then the Flood would
  be blanked and the Blizzard and Wildfire would both be active." So a blanked card blanks nothing.

  Rulebook Q&A: "What happens if the Doppelgänger copies the Basilisk? If there is no card that clears their
  penalties, both cards will be blanked." So cards that blank each other are all blanked.
*/

// Checks if any of the other specified cards blanks the specified card.
function isBlanked(card: Card, cards: readonly Card[]): boolean {
  return othersIn(cards, card).some((other) =>
    effectsOf(other).some(
      (effect) =>
        effect.kind === "blank" &&
        effect.targets.some((target) => matches(card, target)),
    ),
  );
}

// Checks if the specified card blanks itself, based on the other cards that are settled in play and those that may yet be.
function blanksItself(
  card: Card,
  settled: readonly Card[],
  unsettled: readonly Card[],
): Truth {
  return anyTrue(
    effectsOf(card).flatMap((effect) =>
      effect.kind === "blankSelf"
        ? [
            conditionTruth(
              effect.when,
              card,
              othersIn(settled, card),
              othersIn(unsettled, card),
            ),
          ]
        : [],
    ),
  );
}

// Checks if another card blanks the specified card: true if a settled card does, false if no card that may still be in play does.
function blankedByOthers(
  card: Card,
  settled: readonly Card[],
  unsettled: readonly Card[],
): Truth {
  if (isBlanked(card, settled)) {
    return true;
  }

  return isBlanked(card, unsettled) ? undefined : false;
}

// Checks if the specified card is blanked, by another card or by itself, based on the other cards that are settled in play and those that may yet be.
function blanking(
  card: Card,
  settled: readonly Card[],
  unsettled: readonly Card[],
): Truth {
  return anyTrue([
    blankedByOthers(card, settled, unsettled),
    blanksItself(card, settled, unsettled),
  ]);
}

// Settles cards in rounds and returns those settled in play. Each round settles every card whose blanking no longer depends on unsettled cards: those not blanked join the settled cards, and blanked ones drop out, which may settle others in the next round. Cards never settled depend on each other, as in a loop of blanks, and are left out, so blanked.
function settleInPlay(
  settled: readonly Card[],
  unsettled: readonly Card[],
): readonly Card[] {
  const inPlay = unsettled.filter(
    (card) => blanking(card, settled, unsettled) === false,
  );
  const stillUnsettled = unsettled.filter(
    (card) => blanking(card, settled, unsettled) === undefined,
  );

  return stillUnsettled.length === unsettled.length
    ? settled
    : settleInPlay([...settled, ...inPlay], stillUnsettled);
}

// Removes blanked cards, keeping the rest in their original order. A blanked card neither blanks other cards nor counts toward their self-blanks. Cards that are never settled are blanked, as the rulebook does for two cards that blank each other.
export function withoutBlankedCards(cards: readonly Card[]): readonly Card[] {
  const inPlay = settleInPlay([], cards);

  return cards.filter((card) => inPlay.includes(card));
}
