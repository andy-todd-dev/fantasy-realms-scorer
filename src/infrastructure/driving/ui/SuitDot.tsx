import { View } from "react-native";
import type { Suit } from "../../../domain/card";
import { SUITS } from "./theme";

const SIZES = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
};

export function SuitDot({ suit, size = "md" }: { suit: Suit; size?: keyof typeof SIZES }) {
  return (
    <View
      // The ring keeps the dark suit colours, especially Army's black, visible on the dark theme.
      className={`rounded-full border border-suit-dot-ring ${SIZES[size]} ${SUITS[suit].colorClass}`}
    />
  );
}
