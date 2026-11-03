import { render, screen, userEvent } from "@testing-library/react-native";
import { AddCardToHandUseCase } from "../../../application/add-card-to-hand.usecase";
import type { Card, CardId } from "../../../domain/card";
import { createAppStore } from "../state/store";
import { App } from "./App";

jest.mock("react-native-safe-area-context", () =>
  jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

// The first render loads all of React Native, which takes over 5s without a Jest cache.
jest.setTimeout(30000);

const king: Card = { id: "king", name: "King", suit: "leader", baseStrength: 8 };
const queen: Card = { id: "queen", name: "Queen", suit: "leader", baseStrength: 6 };
const cards = [king, queen];

const sumStrengths = async (cardIds: readonly CardId[]) =>
  cards
    .filter((card) => cardIds.includes(card.id))
    .reduce((score, card) => score + card.baseStrength, 0);

async function renderApp({
  scoreHand = sumStrengths,
}: {
  scoreHand?: (cardIds: readonly CardId[]) => Promise<number>;
} = {}) {
  const store = createAppStore({
    addCardToHand: new AddCardToHandUseCase(),
    loadCards: { execute: async () => cards },
    scoreHand: { execute: scoreHand },
  });
  const user = userEvent.setup();

  await render(<App store={store} />);
  await screen.findByTestId("card-option-king");

  return {
    user,
    openCard: (cardId: CardId) =>
      user.press(screen.getByTestId(`card-option-${cardId}`)),
    pressAdd: (cardId: CardId) =>
      user.press(screen.getByTestId(`add-to-hand-${cardId}`)),
  };
}

describe("scoring", () => {
  it("requests a score for the empty hand on start", async () => {
    const scoreHand = jest.fn(sumStrengths);

    await renderApp({ scoreHand });

    expect(await screen.findByText("Score: 0")).toBeOnTheScreen();
    expect(scoreHand).toHaveBeenCalledWith([]);
  });

  it("requests a new score each time the hand changes", async () => {
    const scoreHand = jest.fn(sumStrengths);
    const { openCard, pressAdd } = await renderApp({ scoreHand });

    await openCard("king");
    await pressAdd("king");

    expect(await screen.findByText("Score: 8")).toBeOnTheScreen();
    expect(scoreHand).toHaveBeenLastCalledWith(["king"]);

    await openCard("queen");
    await pressAdd("queen");

    expect(await screen.findByText("Score: 14")).toBeOnTheScreen();
    expect(scoreHand).toHaveBeenLastCalledWith(["king", "queen"]);
  });

  it("doesn't request a score when the hand hasn't changed", async () => {
    const scoreHand = jest.fn(sumStrengths);
    const { openCard } = await renderApp({ scoreHand });
    await screen.findByText("Score: 0");

    await openCard("king");

    expect(scoreHand).toHaveBeenCalledTimes(1);
  });

  it("shows a placeholder when scoring fails", async () => {
    await renderApp({
      scoreHand: () => Promise.reject(new Error("no score")),
    });

    expect(await screen.findByText("Score: -")).toBeOnTheScreen();
  });
});

describe("adding a card", () => {
  it("shows the card in the hand and stops it being added again", async () => {
    const { openCard, pressAdd } = await renderApp();

    await openCard("king");

    expect(screen.getByTestId("add-to-hand-king")).toBeEnabled();

    await pressAdd("king");

    expect(await screen.findByTestId("hand-card-king")).toBeOnTheScreen();
    expect(screen.getByTestId("add-to-hand-king")).toBeDisabled();
  });

  it("leaves other cards available to add", async () => {
    const { openCard, pressAdd } = await renderApp();

    await openCard("king");
    await pressAdd("king");
    await screen.findByTestId("hand-card-king");
    await openCard("queen");

    expect(screen.getByTestId("add-to-hand-queen")).toBeEnabled();
  });
});
