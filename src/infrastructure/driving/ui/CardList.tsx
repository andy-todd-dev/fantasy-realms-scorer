import { Pressable, Text, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectCard } from "../state/hand-slice";
import { selectCardOptions, selectCardsStatus } from "../state/selectors";

export function CardList() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectCardsStatus);
  const cards = useAppSelector(selectCardOptions);

  if (status === "failed") {
    return <Text style={{ padding: 16 }}>Could not load cards.</Text>;
  }

  if (status !== "loaded") {
    return <Text style={{ padding: 16 }}>Loading cards...</Text>;
  }

  return (
    <View style={{ padding: 16, gap: 8 }}>
      {cards.map((card) => (
        <Pressable
          key={card.id}
          testID={`card-option-${card.id}`}
          accessibilityRole="button"
          disabled={!card.isSelectable}
          onPress={() => dispatch(selectCard(card.id))}
          style={{
            padding: 16,
            borderWidth: 1,
            borderRadius: 8,
            opacity: card.isSelectable ? 1 : 0.4,
          }}
        >
          <Text>{card.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}
