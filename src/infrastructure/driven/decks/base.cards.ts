import type { CardMatcher } from "../../../domain/card";
import type { Deck } from "../../../domain/deck";
import {
  absent,
  allOf,
  anyOf,
  blank,
  blankSelf,
  CardDefinition,
  clearPenalty,
  clearPenaltySuitWord,
  points,
  present,
  suit,
} from "./card-definitions";

type BaseCardId =
  | "king"
  | "queen"
  | "princess"
  | "basilisk"
  | "unicorn"
  | "knights"
  | "elven-archers"
  | "light-cavalry"
  | "rangers"
  | "mountain"
  | "cavern"
  | "swamp"
  | "war-dirigible"
  | "smoke"
  | "fire-elemental"
  | "forge"
  | "lightning"
  | "wildfire"
  | "empress"
  | "enchantress"
  | "rainstorm"
  | "dwarvish-infantry"
  | "dragon";

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
  princess: {
    name: "Princess",
    suit: "leader",
    baseStrength: 2,
    bonus: {
      text: "+8 for each Army, Wizard, and other Leader.",
      effects: [
        points(8, { per: suit("army") }),
        points(8, { per: suit("wizard") }),
        points(8, { per: suit("leader") }),
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
  unicorn: {
    name: "Unicorn",
    suit: "beast",
    baseStrength: 9,
    bonus: {
      text: "+30 with Princess, or +15 with Empress, Queen, or Enchantress.",
      effects: [
        points(30, { when: present(card("princess")) }),
        // The Princess clause takes precedence, so the two never add together.
        points(15, {
          when: allOf(
            absent(card("princess")),
            anyOf(
              present(card("empress")),
              present(card("queen")),
              present(card("enchantress")),
            ),
          ),
        }),
      ],
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
  "elven-archers": {
    name: "Elven Archers",
    suit: "army",
    baseStrength: 10,
    bonus: {
      text: "+5 if no Weather.",
      effects: [points(5, { when: absent(suit("weather")) })],
    },
  },
  "light-cavalry": {
    name: "Light Cavalry",
    suit: "army",
    baseStrength: 17,
    penalty: {
      text: "-2 for each Land.",
      effects: [points(-2, { per: suit("land") })],
    },
  },
  rangers: {
    name: "Rangers",
    suit: "army",
    baseStrength: 5,
    bonus: {
      text: '+10 for each Land. Clears the word "Army" from all penalties.',
      effects: [points(10, { per: suit("land") }), clearPenaltySuitWord("army")],
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
  cavern: {
    name: "Cavern",
    suit: "land",
    baseStrength: 6,
    bonus: {
      text: "+25 with Dwarvish Infantry or Dragon. Clears the penalty on all Weather.",
      effects: [
        points(25, {
          when: anyOf(present(card("dwarvish-infantry")), present(card("dragon"))),
        }),
        clearPenalty(suit("weather")),
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
  smoke: {
    name: "Smoke",
    suit: "weather",
    baseStrength: 27,
    penalty: {
      text: "Blanked unless with at least one Flame.",
      effects: [blankSelf({ when: absent(suit("flame")) })],
    },
  },
  "fire-elemental": {
    name: "Fire Elemental",
    suit: "flame",
    baseStrength: 4,
    bonus: {
      text: "+15 for each other Flame.",
      effects: [points(15, { per: suit("flame") })],
    },
  },
  forge: {
    name: "Forge",
    suit: "flame",
    baseStrength: 9,
    bonus: {
      text: "+9 for each Weapon and Artifact.",
      effects: [
        points(9, { per: suit("weapon") }),
        points(9, { per: suit("artifact") }),
      ],
    },
  },
  lightning: {
    name: "Lightning",
    suit: "flame",
    baseStrength: 11,
    bonus: {
      text: "+30 with Rainstorm.",
      effects: [points(30, { when: present(card("rainstorm")) })],
    },
  },
  // Placeholders: these exist only so that other cards' rules can name them: Wildfire for
  // Mountain, Empress and Enchantress for Unicorn, Rainstorm for Lightning, Dwarvish Infantry
  // and Dragon for Cavern. Their suit and base strength are arbitrary,
  // not the printed values, and they have no rules yet. Replace them with the real card details
  // when those cards are added.
  wildfire: {
    name: "Wildfire",
    suit: "wild",
    baseStrength: 2,
  },
  empress: {
    name: "Empress",
    suit: "wild",
    baseStrength: 3,
  },
  enchantress: {
    name: "Enchantress",
    suit: "wild",
    baseStrength: 4,
  },
  rainstorm: {
    name: "Rainstorm",
    suit: "wild",
    baseStrength: 5,
  },
  "dwarvish-infantry": {
    name: "Dwarvish Infantry",
    suit: "wild",
    baseStrength: 1,
  },
  dragon: {
    name: "Dragon",
    suit: "wild",
    baseStrength: 2,
  },
};
