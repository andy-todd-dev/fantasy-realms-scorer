import type { CardMatcher } from "../../../domain/card";
import type { Deck } from "../../../domain/deck";
import {
  absent,
  blank,
  CardDefinition,
  points,
  present,
  suit,
} from "./card-definitions";

type BaseCardId = "king" | "queen" | "basilisk" | "knights";

const card = (cardId: BaseCardId): CardMatcher => ({ cardId });

export const BASE_DECK: Deck = {
  id: "base",
  name: "Base game",
};

// Sample cards: values and wording are placeholders until the full list is added.
export const BASE_DECK_CARDS: Record<BaseCardId, CardDefinition> = {
  king: {
    name: "King",
    suit: "leader",
    baseStrength: 8,
    bonus: {
      text: "+5 for each Army. OR +20 for each Army if with Queen.",
      effects: [
        points(5, { per: suit("army"), when: absent(card("queen")) }),
        points(20, { per: suit("army"), when: present(card("queen")) }),
      ],
    },
  },
  queen: {
    name: "Queen",
    suit: "leader",
    baseStrength: 6,
    bonus: {
      text: "+5 for each Army. OR +20 for each Army if with King.",
      effects: [
        points(5, { per: suit("army"), when: absent(card("king")) }),
        points(20, { per: suit("army"), when: present(card("king")) }),
      ],
    },
  },
  basilisk: {
    name: "Basilisk",
    suit: "beast",
    baseStrength: 35,
    penalty: {
      text: "BLANKS all Armies, Leaders, and other Beasts.",
      effects: [blank(suit("army"), suit("leader"), suit("beast"))],
    },
  },
  knights: {
    name: "Knights",
    suit: "army",
    baseStrength: 20,
    penalty: {
      text: "-8 unless with at least one Leader.",
      effects: [points(-8, { when: absent(suit("leader")) })],
    },
  },
};
