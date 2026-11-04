import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
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
const knights: Card = { id: "knights", name: "Knights", suit: "army", baseStrength: 20 };
const cards = [king, queen, knights];

const eightCards: Card[] = Array.from({ length: 8 }, (_, index) => ({
  id: `card-${index}`,
  name: `Card ${index}`,
  suit: "beast",
  baseStrength: 1,
}));

const sumStrengths = async (cardIds: readonly CardId[]) =>
  cards
    .filter((card) => cardIds.includes(card.id))
    .reduce((score, card) => score + card.baseStrength, 0);

async function renderApp({
  scoreHand = sumStrengths,
  loadCards = async () => cards,
}: {
  scoreHand?: (cardIds: readonly CardId[]) => Promise<number>;
  loadCards?: () => Promise<Card[]>;
} = {}) {
  const store = createAppStore({
    addCardToHand: new AddCardToHandUseCase(),
    loadCards: { execute: loadCards },
    scoreHand: { execute: scoreHand },
  });
  const user = userEvent.setup();

  await render(<App store={store} />);
  await screen.findByTestId("hand-score");

  const press = (testID: string) => user.press(screen.getByTestId(testID));

  return {
    press,
    openPicker: () => press("pick-cards"),
    backToHand: () => press("back-to-hand"),
    tapCard: (cardId: CardId) => press(`card-tile-${cardId}`),
  };
}

const expectScore = (score: string) =>
  waitFor(() => expect(screen.getByTestId("hand-score")).toHaveTextContent(score));

describe("scoring", () => {
  it("requests a score for the empty hand on start", async () => {
    const scoreHand = jest.fn(sumStrengths);

    await renderApp({ scoreHand });

    await expectScore("0");
    expect(scoreHand).toHaveBeenCalledWith([]);
  });

  it("requests a new score each time the hand changes, from the picker", async () => {
    const scoreHand = jest.fn(sumStrengths);
    const { openPicker, backToHand, tapCard } = await renderApp({ scoreHand });

    await openPicker();
    await tapCard("king");
    await waitFor(() => expect(scoreHand).toHaveBeenLastCalledWith(["king"]));
    await tapCard("queen");
    await waitFor(() => expect(scoreHand).toHaveBeenLastCalledWith(["king", "queen"]));
    await backToHand();

    await expectScore("14");
  });

  it("doesn't request a score when only the screen changes", async () => {
    const scoreHand = jest.fn(sumStrengths);
    const { openPicker, backToHand } = await renderApp({ scoreHand });
    await expectScore("0");

    await openPicker();
    await backToHand();

    await expectScore("0");
    expect(scoreHand).toHaveBeenCalledTimes(1);
  });

  it("shows a placeholder when scoring fails", async () => {
    await renderApp({
      scoreHand: () => Promise.reject(new Error("no score")),
    });

    await expectScore("–");
  });
});

describe("the hand screen", () => {
  it("starts with an empty hand", async () => {
    await renderApp();

    expect(screen.getByText("No cards selected.")).toBeOnTheScreen();
    expect(screen.getByTestId("hand-count")).toHaveTextContent("0 of 7 cards");
  });

  it("disables the features that aren't implemented yet", async () => {
    const { openPicker, backToHand, tapCard } = await renderApp();

    await openPicker();
    await tapCard("king");
    await backToHand();

    expect(screen.getByTestId("new-hand")).toBeDisabled();
    expect(screen.getByTestId("show-calculation")).toBeDisabled();
    expect(screen.getByTestId("scan-hand")).toBeDisabled();
    expect(screen.getByTestId("remove-card-king")).toBeDisabled();
    expect(screen.getByTestId("pick-cards")).toBeEnabled();
  });
});

describe("picking cards", () => {
  it("groups the cards under their suits, leaving out suits with no cards", async () => {
    const { openPicker } = await renderApp();

    await openPicker();

    expect(screen.getByText("Army")).toBeOnTheScreen();
    expect(screen.getByText("Leader")).toBeOnTheScreen();
    expect(screen.queryByText("Flood")).toBeNull();
    expect(screen.getByTestId("card-tile-knights")).toBeOnTheScreen();
  });

  it("adds a tapped card to the hand and stays on the picker", async () => {
    const { openPicker, backToHand, tapCard } = await renderApp();

    await openPicker();

    expect(screen.getByTestId("card-tile-king")).not.toBeSelected();

    await tapCard("king");

    expect(screen.getByTestId("card-tile-king")).toBeSelected();
    expect(screen.getByTestId("hand-chip-king")).toHaveTextContent("King");
    expect(screen.getByTestId("hand-progress")).toHaveTextContent("1 of 7");

    await backToHand();

    expect(screen.getByTestId("hand-card-king")).toBeOnTheScreen();
    expect(screen.getByTestId("hand-count")).toHaveTextContent("1 of 7 cards");
  });

  it("can't remove a card until removal is implemented", async () => {
    const { openPicker, tapCard } = await renderApp();

    await openPicker();
    await tapCard("king");

    expect(screen.getByTestId("card-tile-king")).toBeDisabled();
    expect(screen.getByTestId("hand-chip-king")).toBeDisabled();
    expect(screen.getByTestId("card-tile-queen")).toBeEnabled();
  });

  it("disables scanning from the picker", async () => {
    const { openPicker } = await renderApp();

    await openPicker();

    expect(screen.getByTestId("pick-scan")).toBeDisabled();
  });

  it("counts down the cards still needed, down to the singular", async () => {
    const { openPicker, tapCard } = await renderApp({
      loadCards: async () => eightCards,
    });

    await openPicker();

    expect(screen.getByTestId("remaining-cards")).toHaveTextContent("Tap 7 more cards");

    for (const index of [0, 1, 2, 3, 4, 5]) {
      await tapCard(`card-${index}`);
    }

    expect(screen.getByTestId("remaining-cards")).toHaveTextContent("Tap 1 more card");
  });

  it("shows a disabled see score button at 7 cards, and still allows an 8th", async () => {
    const { openPicker, backToHand, tapCard } = await renderApp({
      loadCards: async () => eightCards,
    });

    await openPicker();

    expect(screen.queryByTestId("see-score")).toBeNull();

    for (const index of [0, 1, 2, 3, 4, 5, 6]) {
      await tapCard(`card-${index}`);
    }

    expect(screen.getByTestId("see-score")).toBeDisabled();
    expect(screen.queryByTestId("remaining-cards")).toBeNull();
    expect(screen.getByTestId("hand-progress")).toHaveTextContent("7 of 7");
    expect(screen.getByTestId("card-tile-card-7")).toBeEnabled();

    await tapCard("card-7");

    expect(screen.getByTestId("hand-progress")).toHaveTextContent("8 cards");
    expect(screen.getByTestId("see-score")).toBeDisabled();

    await backToHand();

    expect(screen.getByTestId("hand-count")).toHaveTextContent("8 cards");
  });

  it("explains when the cards failed to load", async () => {
    const { openPicker } = await renderApp({
      loadCards: () => Promise.reject(new Error("no cards")),
    });

    await openPicker();

    expect(await screen.findByText("Could not load cards.")).toBeOnTheScreen();
  });

  it("shows a loading message until the cards arrive", async () => {
    const { openPicker } = await renderApp({
      loadCards: () => new Promise(() => {}),
    });

    await openPicker();

    expect(screen.getByText("Loading cards...")).toBeOnTheScreen();
  });
});
