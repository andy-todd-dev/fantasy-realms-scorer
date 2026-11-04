import { View } from "react-native";
import { colors } from "./theme";

export function SuitDot({ color, size = 10 }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        // Keeps the dark suit colours, especially Army's black, visible on the dark theme.
        borderWidth: 1,
        borderColor: colors.suitDotRing,
      }}
    />
  );
}
