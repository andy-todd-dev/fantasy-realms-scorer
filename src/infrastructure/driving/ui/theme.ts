import type { Suit } from "../../../domain/card";

// Shown where a score isn't available, or where scoring doesn't yet report the figure.
export const NO_VALUE = "–";

// Class names are written out in full because Tailwind only generates classes it can find as text.
export const SUITS: Record<Suit, { label: string; colorClass: string }> = {
  army: { label: "Army", colorClass: "bg-suit-army" },
  artifact: { label: "Artifact", colorClass: "bg-suit-artifact" },
  beast: { label: "Beast", colorClass: "bg-suit-beast" },
  flame: { label: "Flame", colorClass: "bg-suit-flame" },
  flood: { label: "Flood", colorClass: "bg-suit-flood" },
  land: { label: "Land", colorClass: "bg-suit-land" },
  leader: { label: "Leader", colorClass: "bg-suit-leader" },
  weapon: { label: "Weapon", colorClass: "bg-suit-weapon" },
  weather: { label: "Weather", colorClass: "bg-suit-weather" },
  wild: { label: "Wild", colorClass: "bg-suit-wild" },
  wizard: { label: "Wizard", colorClass: "bg-suit-wizard" },
};
