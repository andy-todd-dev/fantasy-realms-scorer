import { act, render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { AddCardToHandUseCase } from "../../../application/add-card-to-hand.usecase";
import { ClearHandUseCase } from "../../../application/clear-hand.usecase";
import { RemoveCardFromHandUseCase } from "../../../application/remove-card-from-hand.usecase";
import type { Card, CardId } from "../../../domain/card";
import { createAppStore } from "../state/store";
import { App } from "./App";

jest.mock("react-native-safe-area-context", () =>
  jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

// Their native modules don't exist under Jest. Reanimated's mock needs Worklets, so mock that too.
jest.mock("react-native-worklets", () => jest.requireActual("react-native-worklets/lib/module/mock"));
jest.mock("react-native-reanimated", () => ({
  ...jest.requireActual("react-native-reanimated/mock"),
  // Missing from Reanimated's mock.
  useReducedMotion: () => false,
}));

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
    clearHand: new ClearHandUseCase(),
    loadCards: { execute: loadCards },
    removeCardFromHand: new RemoveCardFromHandUseCase(),
    scoreHand: { execute: scoreHand },
  });
  const user = userEvent.setup();

  await render(<App store={store} />);
  await screen.findByTestId("hand-score");

  const press = (testID: string) => user.press(screen.getByTestId(testID));

  return {
    press,
    showBreakdown: () => press("show-breakdown"),
    backToCards: () => press("back-to-cards"),
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

  it("updates the score each time a card is tapped", async () => {
    const scoreHand = jest.fn(sumStrengths);
    const { tapCard } = await renderApp({ scoreHand });

    await tapCard("king");
    await waitFor(() => expect(scoreHand).toHaveBeenLastCalledWith(["king"]));
    await expectScore("8");
    await tapCard("queen");
    await waitFor(() => expect(scoreHand).toHaveBeenLastCalledWith(["king", "queen"]));

    await expectScore("14");
  });

  it("doesn't request a score when only the screen changes", async () => {
    const scoreHand = jest.fn(sumStrengths);
    const { showBreakdown, backToCards, tapCard } = await renderApp({ scoreHand });

    await tapCard("king");
    await expectScore("8");
    expect(scoreHand).toHaveBeenCalledTimes(2);

    await showBreakdown();
    await backToCards();

    await expectScore("8");
    expect(scoreHand).toHaveBeenCalledTimes(2);
  });

  it("keeps the current score while a new one is in flight", async () => {
    const responses: ((score: number) => void)[] = [];
    const { tapCard } = await renderApp({
      scoreHand: () => new Promise((resolve) => responses.push(resolve)),
    });

    await act(async () => responses[0](0));
    await expectScore("0");
    await tapCard("king");

    expect(screen.getByTestId("hand-score")).toHaveTextContent("0");

    await act(async () => responses[1](8));

    await expectScore("8");
  });

  it("shows a placeholder when scoring fails", async () => {
    await renderApp({
      scoreHand: () => Promise.reject(new Error("no score")),
    });

    await expectScore("–");
  });
});

describe("the home screen", () => {
  it("opens on the card grid with an empty hand", async () => {
    await renderApp();

    expect(await screen.findByTestId("card-tile-king")).toBeOnTheScreen();
    expect(screen.getByTestId("hand-count")).toHaveTextContent("Tap cards or scan");
    expect(screen.queryByTestId("breakdown-total")).toBeNull();
  });

  it("disables the features that aren't implemented yet", async () => {
    const { tapCard } = await renderApp();

    await tapCard("king");

    expect(screen.getByTestId("scan-hand")).toBeDisabled();
  });

  it("clears the hand, and rescores", async () => {
    const scoreHand = jest.fn(sumStrengths);
    const { press, tapCard } = await renderApp({ scoreHand });

    expect(screen.getByTestId("clear-hand")).toBeDisabled();

    await tapCard("king");
    await tapCard("queen");
    await expectScore("14");

    expect(screen.getByTestId("clear-hand")).toBeEnabled();

    await press("clear-hand");

    expect(screen.getByTestId("card-tile-king")).not.toBeChecked();
    expect(screen.getByTestId("card-tile-queen")).not.toBeChecked();
    expect(screen.getByTestId("hand-count")).toHaveTextContent("Tap cards or scan");
    expect(screen.getByTestId("show-breakdown")).toBeDisabled();
    expect(screen.getByTestId("clear-hand")).toBeDisabled();
    await waitFor(() => expect(scoreHand).toHaveBeenLastCalledWith([]));
    await expectScore("0");
  });

  it("unselects a card when its tile is tapped again, and rescores", async () => {
    const scoreHand = jest.fn(sumStrengths);
    const { tapCard } = await renderApp({ scoreHand });

    await tapCard("king");
    await tapCard("queen");
    await expectScore("14");

    expect(screen.getByTestId("card-tile-king")).toBeEnabled();

    await tapCard("king");

    expect(screen.getByTestId("card-tile-king")).not.toBeChecked();
    expect(screen.getByTestId("card-tile-queen")).toBeChecked();
    expect(screen.getByTestId("hand-count")).toHaveTextContent("1 of 7 cards");
    await waitFor(() => expect(scoreHand).toHaveBeenLastCalledWith(["queen"]));
    await expectScore("6");
  });

  it("can't open the breakdown with an empty hand", async () => {
    await renderApp();

    expect(screen.getByTestId("show-breakdown")).toBeDisabled();
    expect(screen.getByTestId("hand-pips")).toBeDisabled();
  });

  it("groups the cards under their suits, leaving out suits with no cards", async () => {
    await renderApp();

    expect(await screen.findByText("Army")).toBeOnTheScreen();
    expect(screen.getByText("Leader")).toBeOnTheScreen();
    expect(screen.queryByText("Flood")).toBeNull();
    expect(screen.getByTestId("card-tile-knights")).toBeOnTheScreen();
  });

  it("marks a tapped card as selected and counts it", async () => {
    const { tapCard } = await renderApp();

    expect(await screen.findByTestId("card-tile-king")).not.toBeChecked();

    await tapCard("king");

    expect(screen.getByTestId("card-tile-king")).toBeChecked();
    expect(screen.getByTestId("hand-count")).toHaveTextContent("1 of 7 cards");
    expect(screen.getByTestId("hand-pips")).toHaveProp("accessibilityLabel", "1 of 7 cards. Show breakdown");
  });

  it("confirms a full hand at 7 cards, and still allows an 8th", async () => {
    const { tapCard } = await renderApp({
      loadCards: async () => eightCards,
    });

    for (const index of [0, 1, 2, 3, 4, 5, 6]) {
      await tapCard(`card-${index}`);
    }

    expect(screen.getByTestId("hand-count")).toHaveTextContent("7 cards ✓");
    expect(screen.getByTestId("card-tile-card-7")).toBeEnabled();

    await tapCard("card-7");

    expect(screen.getByTestId("hand-count")).toHaveTextContent("8 cards ✓");
  });

  it("explains when the cards failed to load", async () => {
    await renderApp({
      loadCards: () => Promise.reject(new Error("no cards")),
    });

    expect(await screen.findByText("Could not load cards.")).toBeOnTheScreen();
  });

  it("shows a loading message until the cards arrive", async () => {
    await renderApp({
      loadCards: () => new Promise(() => {}),
    });

    expect(screen.getByText("Loading cards...")).toBeOnTheScreen();
  });
});

describe("the breakdown screen", () => {
  it("opens from the button, listing the hand in the order it was picked", async () => {
    const { showBreakdown, tapCard } = await renderApp();

    await tapCard("queen");
    await tapCard("king");
    await expectScore("14");
    await showBreakdown();

    expect(screen.getByTestId("breakdown-title")).toHaveTextContent("Your hand: 14");
    expect(screen.getByTestId("breakdown-total")).toHaveTextContent("14");
    expect(screen.getByTestId("breakdown-count")).toHaveTextContent("2 of 7 cards");
    expect(
      screen.getAllByTestId(/^breakdown-card-/).map((row) => row.props.testID),
    ).toEqual(["breakdown-card-queen", "breakdown-card-king"]);
    expect(screen.queryByTestId("breakdown-card-knights")).toBeNull();
  });

  it("opens from the pips too", async () => {
    const { press, tapCard } = await renderApp();

    await tapCard("king");
    await press("hand-pips");

    expect(screen.getByTestId("breakdown-card-king")).toBeOnTheScreen();
  });

  it("returns to the cards with the hand intact", async () => {
    const { showBreakdown, backToCards, tapCard } = await renderApp();

    await tapCard("king");
    await showBreakdown();
    await backToCards();

    expect(screen.queryByTestId("breakdown-total")).toBeNull();
    expect(screen.getByTestId("card-tile-king")).toBeChecked();
  });

  it("marks a full hand as complete, and an 8th card with no 8 of 7", async () => {
    const { showBreakdown, backToCards, tapCard } = await renderApp({
      loadCards: async () => eightCards,
    });

    for (const index of [0, 1, 2, 3, 4, 5, 6]) {
      await tapCard(`card-${index}`);
    }
    await showBreakdown();

    expect(screen.getByTestId("breakdown-count")).toHaveTextContent("7 cards · complete");

    await backToCards();
    await tapCard("card-7");
    await showBreakdown();

    expect(screen.getByTestId("breakdown-count")).toHaveTextContent("8 cards · complete");
  });

  it("removes a card in place, and rescores", async () => {
    const { press, showBreakdown, tapCard } = await renderApp();

    await tapCard("king");
    await tapCard("queen");
    await expectScore("14");
    await showBreakdown();

    expect(screen.getByLabelText("Remove King from hand")).toBeOnTheScreen();

    await press("remove-card-king");

    expect(screen.queryByTestId("breakdown-card-king")).toBeNull();
    expect(screen.getByTestId("breakdown-card-queen")).toBeOnTheScreen();
    expect(screen.getByTestId("breakdown-count")).toHaveTextContent("1 of 7 cards");
    await waitFor(() => expect(screen.getByTestId("breakdown-total")).toHaveTextContent("6"));
  });

  it("returns to the grid when the last card is removed", async () => {
    const { press, showBreakdown, tapCard } = await renderApp();

    await tapCard("king");
    await showBreakdown();
    await press("remove-card-king");

    expect(screen.queryByTestId("breakdown-total")).toBeNull();
    expect(screen.getByTestId("card-tile-king")).not.toBeChecked();
    expect(screen.getByTestId("hand-count")).toHaveTextContent("Tap cards or scan");
    await expectScore("0");
  });

  it("shows placeholders for the figures scoring doesn't report yet", async () => {
    const { showBreakdown, tapCard } = await renderApp();

    await tapCard("king");
    await showBreakdown();

    expect(screen.getByText("Base")).toBeOnTheScreen();
    expect(screen.getByText("Bonuses")).toBeOnTheScreen();
    expect(screen.getByText("Penalties")).toBeOnTheScreen();
    expect(screen.getByText("Blanked cards: –")).toBeOnTheScreen();
  });

  it("shows a placeholder total when scoring fails", async () => {
    const { showBreakdown, tapCard } = await renderApp({
      scoreHand: () => Promise.reject(new Error("no score")),
    });

    await tapCard("king");
    await showBreakdown();

    expect(screen.getByTestId("breakdown-total")).toHaveTextContent("–");
    expect(screen.getByTestId("breakdown-card-king")).toBeOnTheScreen();
  });
});
