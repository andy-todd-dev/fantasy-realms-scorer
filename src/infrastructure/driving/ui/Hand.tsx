import { Text, View } from "react-native";
import { useAppSelector } from "../state/hooks";
import { selectHandCards } from "../state/selectors";

export function Hand() {
  const cards = useAppSelector(selectHandCards);

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
    </View>
  );
}
