import type { CardMatcher } from "../../../domain/card";
import type { Deck } from "../../../domain/deck";
import {
  absent,
  allOf,
  blank,
  blankSelf,
  CardDefinition,
  clearPenalty,
  points,
  present,
  suit,
} from "./card-definitions";

type BaseCardId =
  | "king"
  | "queen"
  | "basilisk"
  | "knights"
  | "mountain"
  | "swamp"
  | "war-dirigible"
  | "smoke"
  | "wildfire";

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
  mountain: {
    name: "Mountain",
    suit: "land",
    baseStrength: 9,
    bonus: {
      text: "+50 with both Smoke and Wildfire. Clears the penalty on all Floods.",
      effects: [
        points(50, { when: allOf(present(card("smoke")), present(card("wildfire"))) }),
        clearPenalty(suit("flood")),
      ],
    },
  },
  swamp: {
    name: "Swamp",
    suit: "flood",
    baseStrength: 18,
    penalty: {
      text: "-3 for each Army and Flame.",
      effects: [
        points(-3, { per: suit("army") }),
        points(-3, { per: suit("flame") }),
      ],
    },
  },
  "war-dirigible": {
    name: "War Dirigible",
    suit: "weapon",
    baseStrength: 35,
    penalty: {
      text: "Blanked unless with at least one Army. Blanked with any Weather.",
      effects: [
        blankSelf({ when: absent(suit("army")) }),
        blankSelf({ when: present(suit("weather")) }),
      ],
    },
  },
  // Placeholders: Smoke and Wildfire exist only so that Mountain's bonus can name them.
  // Their suit and base strength are arbitrary, not the printed values, and they have no
  // rules yet. Replace them with the real card details when those cards are added.
  smoke: {
    name: "Smoke",
    suit: "wild",
    baseStrength: 1,
  },
  wildfire: {
    name: "Wildfire",
    suit: "wild",
    baseStrength: 2,
  },
};
