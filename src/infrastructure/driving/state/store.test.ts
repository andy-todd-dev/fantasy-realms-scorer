import { AddCardToHandUseCase } from "../../../application/add-card-to-hand.usecase";
import { ClearHandUseCase } from "../../../application/clear-hand.usecase";
import { RemoveCardFromHandUseCase } from "../../../application/remove-card-from-hand.usecase";
import type { Card, CardId } from "../../../domain/card";
import { loadCards } from "./cards-slice";
import { addCardToHand, clearHand, removeCardFromHand } from "./hand-slice";
import { screenOpened } from "./navigation-slice";
import { scoreHand } from "./score-slice";
import {
  selectCardSections,
  selectCardsStatus,
  selectHandCards,
  selectHandProgress,
  selectScore,
  selectScreen,
} from "./selectors";
import { createAppStore } from "./store";

const king: Card = {
  id: "king",
  name: "King",
  suit: "leader",
  baseStrength: 8,
};
const queen: Card = {
  id: "queen",
  name: "Queen",
  suit: "leader",
  baseStrength: 6,
};
const knights: Card = {
  id: "knights",
  name: "Knights",
  suit: "army",
  baseStrength: 20,
};

function createStore(
  loadCardsExecute: () => Promise<Card[]>,
  {
    scoreHandExecute = async () => 0,
  }: {
    scoreHandExecute?: (cardIds: readonly CardId[]) => Promise<number>;
  } = {},
) {
  return createAppStore({
    addCardToHand: new AddCardToHandUseCase(),
    clearHand: new ClearHandUseCase(),
    loadCards: { execute: loadCardsExecute },
    removeCardFromHand: new RemoveCardFromHandUseCase(),
    scoreHand: { execute: scoreHandExecute },
  });
}

async function createLoadedStore() {
  const store = createStore(async () => [king, queen, knights]);
  await store.dispatch(loadCards());
  return store;
}

describe("loading cards", () => {
  it("offers the loaded cards as unselected tiles", async () => {
    const store = await createLoadedStore();

    expect(selectCardsStatus(store.getState())).toBe("loaded");
    expect(selectCardSections(store.getState())).toEqual([
      {
        suit: "army",
        cards: [{ id: "knights", name: "Knights", selected: false }],
      },
      {
        suit: "leader",
        cards: [
          { id: "king", name: "King", selected: false },
          { id: "queen", name: "Queen", selected: false },
        ],
      },
    ]);
  });

  it("sets the failed status when loading fails", async () => {
    const store = createStore(() => Promise.reject(new Error("no cards")));

    await store.dispatch(loadCards());

    expect(selectCardsStatus(store.getState())).toBe("failed");
  });
});

describe("adding a card to the hand", () => {
  it("adds the card and marks its tile as selected", async () => {
    const store = await createLoadedStore();

    await store.dispatch(addCardToHand("king"));

    expect(selectHandCards(store.getState())).toEqual([king]);
    expect(selectCardSections(store.getState())[1].cards).toEqual([
      { id: "king", name: "King", selected: true },
      { id: "queen", name: "Queen", selected: false },
    ]);
  });

  it("keeps cards in the order they were added and ignores duplicates", async () => {
    const store = await createLoadedStore();

    await store.dispatch(addCardToHand("queen"));
    await store.dispatch(addCardToHand("king"));
    await store.dispatch(addCardToHand("queen"));

    expect(selectHandCards(store.getState())).toEqual([queen, king]);
  });
});

describe("removing a card from the hand", () => {
  it("removes the card, unselects its tile and keeps the order of the rest", async () => {
    const store = await createLoadedStore();
    await store.dispatch(addCardToHand("queen"));
    await store.dispatch(addCardToHand("king"));
    await store.dispatch(addCardToHand("knights"));

    await store.dispatch(removeCardFromHand("king"));

    expect(selectHandCards(store.getState())).toEqual([queen, knights]);
    expect(selectCardSections(store.getState())[1].cards).toEqual([
      { id: "king", name: "King", selected: false },
      { id: "queen", name: "Queen", selected: true },
    ]);
  });

  it("returns to the home screen when the last card is removed from the breakdown", async () => {
    const store = await createLoadedStore();
    await store.dispatch(addCardToHand("king"));
    store.dispatch(screenOpened("breakdown"));

    await store.dispatch(removeCardFromHand("king"));

    expect(selectHandCards(store.getState())).toEqual([]);
    expect(selectScreen(store.getState())).toBe("home");
  });

  it("stays on the breakdown while cards remain", async () => {
    const store = await createLoadedStore();
    await store.dispatch(addCardToHand("king"));
    await store.dispatch(addCardToHand("queen"));
    store.dispatch(screenOpened("breakdown"));

    await store.dispatch(removeCardFromHand("king"));

    expect(selectScreen(store.getState())).toBe("breakdown");
  });
});

describe("clearing the hand", () => {
  it("empties the hand and unselects every tile", async () => {
    const store = await createLoadedStore();
    await store.dispatch(addCardToHand("king"));
    await store.dispatch(addCardToHand("knights"));

    await store.dispatch(clearHand());

    expect(selectHandCards(store.getState())).toEqual([]);
    expect(
      selectCardSections(store.getState())
        .flatMap((section) => section.cards)
        .some((card) => card.selected),
    ).toBe(false);
  });
});

describe("scoring the hand", () => {
  it("has no score until one is requested", () => {
    const store = createStore(async () => []);

    expect(selectScore(store.getState())).toBeNull();
  });

  it("requests the score using the IDs of the cards in the hand", async () => {
    const scoreHandExecute = jest.fn(async (_: readonly CardId[]) => 14);
    const store = createStore(async () => [king, queen], { scoreHandExecute });

    await store.dispatch(addCardToHand("queen"));
    await store.dispatch(addCardToHand("king"));
    await store.dispatch(scoreHand());

    expect(scoreHandExecute).toHaveBeenCalledWith(["queen", "king"]);
    expect(selectScore(store.getState())).toBe(14);
  });

  it("keeps the current score while a new one is pending", async () => {
    const responses: ((score: number) => void)[] = [];
    const store = createStore(async () => [], {
      scoreHandExecute: () => new Promise((resolve) => responses.push(resolve)),
    });

    const first = store.dispatch(scoreHand());
    responses[0](8);
    await first;
    const second = store.dispatch(scoreHand());

    expect(selectScore(store.getState())).toBe(8);

    responses[1](14);
    await second;

    expect(selectScore(store.getState())).toBe(14);
  });

  it("ignores a response that arrives after a newer one", async () => {
    const responses: ((score: number) => void)[] = [];
    const store = createStore(async () => [], {
      scoreHandExecute: () => new Promise((resolve) => responses.push(resolve)),
    });

    const first = store.dispatch(scoreHand());
    const second = store.dispatch(scoreHand());
    responses[1](14);
    await second;
    responses[0](8);
    await first;

    expect(selectScore(store.getState())).toBe(14);
  });

  it("clears the score when scoring fails", async () => {
    const scoreHandExecute = jest
      .fn<Promise<number>, [readonly CardId[]]>()
      .mockResolvedValueOnce(8)
      .mockRejectedValueOnce(new Error("no score"));
    const store = createStore(async () => [], { scoreHandExecute });

    await store.dispatch(scoreHand());

    expect(selectScore(store.getState())).toBe(8);

    await store.dispatch(scoreHand());

    expect(selectScore(store.getState())).toBeNull();
  });
});

describe("navigation", () => {
  it("starts on the home screen and moves between screens", async () => {
    const store = await createLoadedStore();

    expect(selectScreen(store.getState())).toBe("home");

    store.dispatch(screenOpened("breakdown"));

    expect(selectScreen(store.getState())).toBe("breakdown");

    store.dispatch(screenOpened("home"));

    expect(selectScreen(store.getState())).toBe("home");
  });
});

describe("tracking progress towards a full hand", () => {
  const deck: Card[] = Array.from({ length: 8 }, (_, index) => ({
    id: `card-${index}`,
    name: `Card ${index}`,
    suit: "beast",
    baseStrength: 1,
  }));

  async function createStoreWithHandOf(size: number) {
    const store = createStore(async () => deck);
    await store.dispatch(loadCards());
    for (const card of deck.slice(0, size)) {
      await store.dispatch(addCardToHand(card.id));
    }
    return store;
  }

  it("prompts for cards when the hand is empty", async () => {
    const store = await createStoreWithHandOf(0);

    expect(selectHandProgress(store.getState())).toEqual({
      isEmpty: true,
      isComplete: false,
      pips: [false, false, false, false, false, false, false],
      countLabel: "Tap cards or scan",
      reviewLabel: "0 of 7 cards",
      pipsAccessibilityLabel: "0 of 7 cards. Show breakdown",
    });
  });

  it("counts towards 7 for a partial hand", async () => {
    const store = await createStoreWithHandOf(5);

    expect(selectHandProgress(store.getState())).toEqual({
      isEmpty: false,
      isComplete: false,
      pips: [true, true, true, true, true, false, false],
      countLabel: "5 of 7 cards",
      reviewLabel: "5 of 7 cards",
      pipsAccessibilityLabel: "5 of 7 cards. Show breakdown",
    });
  });

  it("is complete at 7 cards", async () => {
    const store = await createStoreWithHandOf(7);

    expect(selectHandProgress(store.getState())).toEqual({
      isEmpty: false,
      isComplete: true,
      pips: [true, true, true, true, true, true, true],
      countLabel: "7 cards ✓",
      reviewLabel: "7 cards · complete",
      pipsAccessibilityLabel: "7 cards. Show breakdown",
    });
  });

  it("allows an 8th card with an extra pip, and never says 8 of 7", async () => {
    const store = await createStoreWithHandOf(8);

    expect(selectHandProgress(store.getState())).toEqual({
      isEmpty: false,
      isComplete: true,
      pips: [true, true, true, true, true, true, true, true],
      countLabel: "8 cards ✓",
      reviewLabel: "8 cards · complete",
      pipsAccessibilityLabel: "8 cards. Show breakdown",
    });
  });
});

describe("ordering the card sections", () => {
  it("lists suits alphabetically, not in the catalogue's order", async () => {
    const mirage: Card = {
      id: "mirage",
      name: "Mirage",
      suit: "wild",
      baseStrength: 0,
    };
    const collector: Card = {
      id: "collector",
      name: "Collector",
      suit: "wizard",
      baseStrength: 7,
    };
    const store = createStore(async () => [collector, mirage, king, knights]);
    await store.dispatch(loadCards());

    expect(
      selectCardSections(store.getState()).map(({ suit }) => suit),
    ).toEqual(["army", "leader", "wild", "wizard"]);
  });

  it("lists cards alphabetically within a suit, not in the catalogue's order", async () => {
    const store = createStore(async () => [queen, king]);
    await store.dispatch(loadCards());

    expect(
      selectCardSections(store.getState())[0].cards.map(({ name }) => name),
    ).toEqual(["King", "Queen"]);
  });
});
