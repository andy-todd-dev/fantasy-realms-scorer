import { Pressable, ScrollView, Text, View } from "react-native";
import { cardDetailsToggled } from "../state/card-details-slice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectCardOptions, selectCardsStatus } from "../state/selectors";
import { CardDetails } from "./CardDetails";

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
    <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
      {cards.map((card) => (
        <View key={card.id}>
          <Pressable
            testID={`card-option-${card.id}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: card.isDetailsOpen }}
            onPress={() => dispatch(cardDetailsToggled(card.id))}
            style={{
              padding: 16,
              borderWidth: 1,
              borderRadius: 8,
              opacity: card.canAddToHand ? 1 : 0.4,
            }}
          >
            <Text>{card.name}</Text>
          </Pressable>
          {card.isDetailsOpen && <CardDetails card={card} />}
        </View>
      ))}
    </ScrollView>
  );
}
