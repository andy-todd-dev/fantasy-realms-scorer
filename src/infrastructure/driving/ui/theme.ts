import type { Suit } from "../../../domain/card";

export const colors = {
  background: "#141821",
  surface: "#1E2430",
  surfaceBorder: "#2C3343",
  row: "#1A1F2A",
  subtle: "#2A3242",
  divider: "#232A38",
  outline: "#3A4252",
  chip: "#232A38",
  suitDotRing: "#8D95A3",
  text: "#EDE9E0",
  textSoft: "#C9CED8",
  textMuted: "#A9B0BD",
  icon: "#8D95A3",
  accent: "#E3B75B",
  onAccent: "#1A1408",
  selected: "#2E2A1E",
  onSelected: "#F3E4BE",
};

// Family names match the font files embedded by the expo-font plugin in app.json.
// Each weight is its own family, so styles set fontFamily rather than fontWeight.
export const fonts = {
  display: "Marcellus_400Regular",
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const SUITS: Record<Suit, { label: string; color: string }> = {
  army: { label: "Army", color: "#000000" },
  wizard: { label: "Wizard", color: "#EE7FB8" },
  leader: { label: "Leader", color: "#8E44C9" },
  beast: { label: "Beast", color: "#1E7B3A" },
  land: { label: "Land", color: "#8B5A2B" },
  flood: { label: "Flood", color: "#1F4FA8" },
  weather: { label: "Weather", color: "#7CC4EE" },
  flame: { label: "Flame", color: "#D93636" },
  weapon: { label: "Weapon", color: "#B4B8BE" },
  artifact: { label: "Artifact", color: "#E67E22" },
  wild: { label: "Wild", color: "#E6E8EA" },
};
