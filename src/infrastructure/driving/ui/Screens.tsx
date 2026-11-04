import { useEffect } from "react";
import { StatusBar } from "react-native";
import { loadCards } from "../state/cards-slice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { scoreHand } from "../state/score-slice";
import { selectHandCardIds, selectScreen } from "../state/selectors";
import { HandScreen } from "./HandScreen";
import { PickCardsScreen } from "./PickCardsScreen";

export function Screens() {
  const dispatch = useAppDispatch();
  const screen = useAppSelector(selectScreen);
  const cardIds = useAppSelector(selectHandCardIds);

  useEffect(() => {
    dispatch(loadCards());
  }, [dispatch]);

  // Lives above the screens so it follows the hand, not which screen is showing.
  useEffect(() => {
    dispatch(scoreHand());
  }, [dispatch, cardIds]);

  return (
    <>
      <StatusBar barStyle="light-content" />
      {screen === "hand" ? <HandScreen /> : <PickCardsScreen />}
    </>
  );
}
