import { useEffect } from "react";
import { Text, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { scoreHand } from "../state/score-slice";
import {
  selectHandCardIds,
  selectHandCards,
  selectScore,
} from "../state/selectors";

export function Hand() {
  const dispatch = useAppDispatch();
  const cardIds = useAppSelector(selectHandCardIds);
  const cards = useAppSelector(selectHandCards);
  const score = useAppSelector(selectScore);

  useEffect(() => {
    dispatch(scoreHand());
  }, [dispatch, cardIds]);

  return (
    <View style={{ padding: 16, gap: 8, borderTopWidth: 1 }}>
      <Text style={{ fontWeight: "bold" }}>Your hand</Text>
      {cards.length === 0 ? (
        <Text>No cards selected.</Text>
      ) : (
        cards.map((card) => (
          <Text key={card.id} testID={`hand-card-${card.id}`}>
            {card.name}
          </Text>
        ))
      )}
      <Text testID="hand-score">Score: {score ?? "-"}</Text>
    </View>
  );
}
