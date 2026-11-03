import { AddCardToHandUseCase } from "../../../application/add-card-to-hand.usecase";
import type { Card, CardId } from "../../../domain/card";
import { cardDetailsToggled } from "./card-details-slice";
import { loadCards } from "./cards-slice";
import { addCardToHand } from "./hand-slice";
import { scoreHand } from "./score-slice";
import {
  selectCardOptions,
  selectCardsStatus,
  selectHandCards,
  selectScore,
} from "./selectors";
import { createAppStore } from "./store";

const king: Card = { id: "king", name: "King", suit: "leader", baseStrength: 8 };
const queen: Card = { id: "queen", name: "Queen", suit: "leader", baseStrength: 6 };

const closedOption = { canAddToHand: true, isDetailsOpen: false };

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
    loadCards: { execute: loadCardsExecute },
    scoreHand: { execute: scoreHandExecute },
  });
}

async function createLoadedStore() {
  const store = createStore(async () => [king, queen]);
  await store.dispatch(loadCards());
  return store;
}

describe("loading cards", () => {
  it("offers the loaded cards with their details closed", async () => {
    const store = await createLoadedStore();

    expect(selectCardsStatus(store.getState())).toBe("loaded");
    expect(selectCardOptions(store.getState())).toEqual([
      { ...king, ...closedOption },
      { ...queen, ...closedOption },
    ]);
  });

  it("sets the failed status when loading fails", async () => {
    const store = createStore(() => Promise.reject(new Error("no cards")));

    await store.dispatch(loadCards());

    expect(selectCardsStatus(store.getState())).toBe("failed");
  });
});

describe("toggling card details", () => {
  it("opens the card's details without changing the hand", async () => {
    const store = await createLoadedStore();

    store.dispatch(cardDetailsToggled("king"));

    expect(selectCardOptions(store.getState())).toEqual([
      { ...king, canAddToHand: true, isDetailsOpen: true },
      { ...queen, ...closedOption },
    ]);
    expect(selectHandCards(store.getState())).toEqual([]);
  });

  it("closes the details when the same card is toggled again", async () => {
    const store = await createLoadedStore();

    store.dispatch(cardDetailsToggled("king"));
    store.dispatch(cardDetailsToggled("king"));

    expect(selectCardOptions(store.getState())).toEqual([
      { ...king, ...closedOption },
      { ...queen, ...closedOption },
    ]);
  });

  it("keeps only one card open at a time", async () => {
    const store = await createLoadedStore();

    store.dispatch(cardDetailsToggled("king"));
    store.dispatch(cardDetailsToggled("queen"));

    expect(selectCardOptions(store.getState())).toEqual([
      { ...king, ...closedOption },
      { ...queen, canAddToHand: true, isDetailsOpen: true },
    ]);
  });
});

describe("adding a card to the hand", () => {
  it("adds the card and stops it being added again", async () => {
    const store = await createLoadedStore();

    await store.dispatch(addCardToHand("king"));

    expect(selectHandCards(store.getState())).toEqual([king]);
    expect(selectCardOptions(store.getState())).toEqual([
      { ...king, canAddToHand: false, isDetailsOpen: false },
      { ...queen, ...closedOption },
    ]);
  });

  it("leaves the card's details open", async () => {
    const store = await createLoadedStore();

    store.dispatch(cardDetailsToggled("king"));
    await store.dispatch(addCardToHand("king"));

    expect(selectCardOptions(store.getState())[0]).toEqual({
      ...king,
      canAddToHand: false,
      isDetailsOpen: true,
    });
  });

  it("keeps cards in the order they were added and ignores duplicates", async () => {
    const store = await createLoadedStore();

    await store.dispatch(addCardToHand("queen"));
    await store.dispatch(addCardToHand("king"));
    await store.dispatch(addCardToHand("queen"));

    expect(selectHandCards(store.getState())).toEqual([queen, king]);
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
