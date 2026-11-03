import { SelectCardUseCase } from "../../../application/select-card.usecase";
import { Card } from "../../../domain/card";
import { loadCards } from "./cards-slice";
import { selectCard } from "./hand-slice";
import {
  selectCardOptions,
  selectCardsStatus,
  selectHandCards,
} from "./selectors";
import { createAppStore } from "./store";

const king: Card = { id: "king", name: "King" };
const queen: Card = { id: "queen", name: "Queen" };

async function createLoadedStore() {
  const store = createAppStore({
    loadCards: { execute: async () => [king, queen] },
    selectCard: new SelectCardUseCase(),
  });
  await store.dispatch(loadCards());
  return store;
}

describe("loading cards", () => {
  it("makes the loaded cards selectable", async () => {
    const store = await createLoadedStore();

    expect(selectCardsStatus(store.getState())).toBe("loaded");
    expect(selectCardOptions(store.getState())).toEqual([
      { ...king, isSelectable: true },
      { ...queen, isSelectable: true },
    ]);
  });

  it("sets the failed status when loading fails", async () => {
    const store = createAppStore({
      loadCards: { execute: () => Promise.reject(new Error("no cards")) },
      selectCard: new SelectCardUseCase(),
    });

    await store.dispatch(loadCards());

    expect(selectCardsStatus(store.getState())).toBe("failed");
  });
});

describe("selecting a card", () => {
  it("adds the card to the hand and makes it unselectable", async () => {
    const store = await createLoadedStore();

    await store.dispatch(selectCard("king"));

    expect(selectHandCards(store.getState())).toEqual([king]);
    expect(selectCardOptions(store.getState())).toEqual([
      { ...king, isSelectable: false },
      { ...queen, isSelectable: true },
    ]);
  });

  it("keeps cards in selection order and ignores duplicates", async () => {
    const store = await createLoadedStore();

    await store.dispatch(selectCard("queen"));
    await store.dispatch(selectCard("king"));
    await store.dispatch(selectCard("queen"));

    expect(selectHandCards(store.getState())).toEqual([queen, king]);
  });
});
