import type { CardIdMatcher } from "../../../domain/card";
import type { Deck } from "../../../domain/deck";
import {
  absent,
  allOf,
  allSuits,
  allSuitsDifferent,
  anyOf,
  baseStrengthRun,
  blank,
  blankSelf,
  CardDefinition,
  clearPenalty,
  clearPenaltySuitWord,
  except,
  points,
  present,
  suit,
  sum,
} from "./card-definitions";

type BaseCardId =
  | "beast-master"
  | "enchantress"
  | "king"
  | "queen"
  | "princess"
  | "empress"
  | "warlord"
  | "basilisk"
  | "unicorn"
  | "warhorse"
  | "hydra"
  | "knights"
  | "elven-archers"
  | "light-cavalry"
  | "rangers"
  | "mountain"
  | "cavern"
  | "forest"
  | "earth-elemental"
  | "bell-tower"
  | "swamp"
  | "great-flood"
  | "water-elemental"
  | "war-dirigible"
  | "magic-wand"
  | "smoke"
  | "blizzard"
  | "air-elemental"
  | "rainstorm"
  | "fire-elemental"
  | "forge"
  | "lightning"
  | "candle"
  | "protection-rune"
  | "world-tree"
  | "shield-of-keth"
  | "gem-of-order"
  | "wildfire"
  | "dwarvish-infantry"
  | "dragon"
  | "book-of-changes"
  | "sword-of-keth";

const card = (cardId: BaseCardId): CardIdMatcher => ({ cardId });

export const BASE_DECK: Deck = {
  id: "base",
  name: "Base game",
};

// Sample cards: values and wording are placeholders until the full list is added.
export const BASE_DECK_CARDS: Record<BaseCardId, CardDefinition> = {
  "beast-master": {
    name: "Beast Master",
    suit: "wizard",
    baseStrength: 9,
    bonus: {
      text: "+9 for each Beast. Clears the penalty on all Beasts.",
      effects: [points(9, { per: suit("beast") }), clearPenalty(suit("beast"))],
    },
  },
  enchantress: {
    name: "Enchantress",
    suit: "wizard",
    baseStrength: 5,
    bonus: {
      text: "+5 for each Land, Weather, Flood, and Flame.",
      effects: [
        points(5, { per: suit("land") }),
        points(5, { per: suit("weather") }),
        points(5, { per: suit("flood") }),
        points(5, { per: suit("flame") }),
      ],
    },
  },
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
  empress: {
    name: "Empress",
    suit: "leader",
    baseStrength: 15,
    bonus: {
      text: "+10 for each Army.",
      effects: [points(10, { per: suit("army") })],
    },
    penalty: {
      text: "-5 for each other Leader.",
      effects: [points(-5, { per: suit("leader") })],
    },
  },
  warlord: {
    name: "Warlord",
    suit: "leader",
    baseStrength: 4,
    bonus: {
      text: "The sum of the base strength of all Armies.",
      effects: [sum(suit("army"), "baseStrength")],
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
  warhorse: {
    name: "Warhorse",
    suit: "beast",
    baseStrength: 6,
    bonus: {
      text: "+14 with any Leader or Wizard.",
      effects: [
        points(14, {
          when: anyOf(present(suit("leader")), present(suit("wizard"))),
        }),
      ],
    },
  },
  hydra: {
    name: "Hydra",
    suit: "beast",
    baseStrength: 12,
    bonus: {
      text: "+28 with Swamp.",
      effects: [points(28, { when: present(card("swamp")) })],
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
  forest: {
    name: "Forest",
    suit: "land",
    baseStrength: 7,
    bonus: {
      text: "+12 for each Beast and Elven Archers.",
      effects: [
        points(12, { per: suit("beast") }),
        points(12, { per: card("elven-archers") }),
      ],
    },
  },
  "earth-elemental": {
    name: "Earth Elemental",
    suit: "land",
    baseStrength: 4,
    bonus: {
      text: "+15 for each other Land.",
      effects: [points(15, { per: suit("land") })],
    },
  },
  "bell-tower": {
    name: "Bell Tower",
    suit: "land",
    baseStrength: 8,
    bonus: {
      text: "+15 with any one Wizard.",
      effects: [points(15, { when: present(suit("wizard")) })],
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
  "great-flood": {
    name: "Great Flood",
    suit: "flood",
    baseStrength: 32,
    penalty: {
      text: "BLANKS all Armies, all Lands except Mountain, and all Flames except Lightning.",
      effects: [
        blank(
          suit("army"),
          except(suit("land"), card("mountain")),
          except(suit("flame"), card("lightning")),
        ),
      ],
    },
  },
  "water-elemental": {
    name: "Water Elemental",
    suit: "flood",
    baseStrength: 4,
    bonus: {
      text: "+15 for each other Flood.",
      effects: [points(15, { per: suit("flood") })],
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
  "magic-wand": {
    name: "Magic Wand",
    suit: "weapon",
    baseStrength: 1,
    bonus: {
      text: "+25 with any one Wizard.",
      effects: [points(25, { when: present(suit("wizard")) })],
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
  blizzard: {
    name: "Blizzard",
    suit: "weather",
    baseStrength: 30,
    penalty: {
      text: "BLANKS all Floods. -5 for each Army, Leader, Beast, and Flame.",
      effects: [
        blank(suit("flood")),
        points(-5, { per: suit("army") }),
        points(-5, { per: suit("leader") }),
        points(-5, { per: suit("beast") }),
        points(-5, { per: suit("flame") }),
      ],
    },
  },
  "air-elemental": {
    name: "Air Elemental",
    suit: "weather",
    baseStrength: 4,
    bonus: {
      text: "+15 for each other Weather.",
      effects: [points(15, { per: suit("weather") })],
    },
  },
  rainstorm: {
    name: "Rainstorm",
    suit: "weather",
    baseStrength: 8,
    bonus: {
      text: "+10 for each Flood.",
      effects: [points(10, { per: suit("flood") })],
    },
    penalty: {
      text: "BLANKS all Flames except Lightning.",
      effects: [blank(except(suit("flame"), card("lightning")))],
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
  candle: {
    name: "Candle",
    suit: "flame",
    baseStrength: 2,
    bonus: {
      text: "+100 with Book of Changes, Bell Tower, and any one Wizard.",
      effects: [
        points(100, {
          when: allOf(
            present(card("book-of-changes")),
            present(card("bell-tower")),
            present(suit("wizard")),
          ),
        }),
      ],
    },
  },
  "protection-rune": {
    name: "Protection Rune",
    suit: "artifact",
    baseStrength: 1,
    bonus: {
      text: "Clears the penalty on all cards.",
      effects: [clearPenalty(...allSuits)],
    },
  },
  "world-tree": {
    name: "World Tree",
    suit: "artifact",
    baseStrength: 2,
    bonus: {
      text: "+50 if every non-blanked card is a different suit.",
      effects: [points(50, { when: allSuitsDifferent })],
    },
  },
  "shield-of-keth": {
    name: "Shield of Keth",
    suit: "artifact",
    baseStrength: 4,
    bonus: {
      text: "+15 with any one Leader, or +40 with both Leader and Sword of Keth.",
      effects: [
        // The clauses are alternatives, so the two never add together.
        points(15, {
          when: allOf(present(suit("leader")), absent(card("sword-of-keth"))),
        }),
        points(40, {
          when: allOf(present(suit("leader")), present(card("sword-of-keth"))),
        }),
      ],
    },
  },
  "gem-of-order": {
    name: "Gem of Order",
    suit: "artifact",
    baseStrength: 5,
    bonus: {
      text: "+10 for a 3-card run, +30 for a 4-card run, +60 for a 5-card run, +100 for a 6-card run, +150 for a 7-card run. (This refers to the base strength numbers.)",
      effects: [
        baseStrengthRun([
          { length: 3, points: 10 },
          { length: 4, points: 30 },
          { length: 5, points: 60 },
          { length: 6, points: 100 },
          { length: 7, points: 150 },
        ]),
      ],
    },
  },
  // Placeholders: these exist only so that other cards' rules can name them: Wildfire for
  // Mountain, Dwarvish Infantry
  // and Dragon for Cavern, Book of Changes for Candle, Sword of Keth for Shield of Keth. Their suit and base strength are arbitrary,
  // not the printed values, and they have no rules yet. Replace them with the real card details
  // when those cards are added.
  wildfire: {
    name: "Wildfire",
    suit: "wild",
    baseStrength: 2,
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
  "book-of-changes": {
    name: "Book of Changes",
    suit: "wild",
    baseStrength: 3,
  },
  "sword-of-keth": {
    name: "Sword of Keth",
    suit: "wild",
    baseStrength: 5,
  },
};
