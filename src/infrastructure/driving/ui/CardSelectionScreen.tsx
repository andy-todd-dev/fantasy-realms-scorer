import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadCards } from "../state/cards-slice";
import { useAppDispatch } from "../state/hooks";
import { CardList } from "./CardList";
import { Hand } from "./Hand";

export function CardSelectionScreen() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadCards());
  }, [dispatch]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <CardList />
      </View>
      <Hand />
    </SafeAreaView>
  );
}
