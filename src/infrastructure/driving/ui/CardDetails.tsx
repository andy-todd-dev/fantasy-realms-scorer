import { Pressable, Text, View } from "react-native";
import { addCardToHand } from "../state/hand-slice";
import { useAppDispatch } from "../state/hooks";
import { CardOption } from "../state/selectors";

export function CardDetails({ card }: { card: CardOption }) {
  const dispatch = useAppDispatch();

  return (
    <View testID={`card-details-${card.id}`} style={{ padding: 16, gap: 8 }}>
      <Text style={{ textTransform: "capitalize" }}>Suit: {card.suit}</Text>
      <Text>Base strength: {card.baseStrength}</Text>
      {card.bonus && <Text>Bonus: {card.bonus.text}</Text>}
      {card.penalty && <Text>Penalty: {card.penalty.text}</Text>}
      <Pressable
        testID={`add-to-hand-${card.id}`}
        accessibilityRole="button"
        disabled={!card.canAddToHand}
        onPress={() => dispatch(addCardToHand(card.id))}
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 8,
          alignItems: "center",
          opacity: card.canAddToHand ? 1 : 0.4,
        }}
      >
        <Text>Add to hand</Text>
      </Pressable>
    </View>
  );
}
