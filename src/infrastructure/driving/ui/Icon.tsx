import { Circle, Path, Rect, Svg } from "react-native-svg";

const glyphs = {
  back: <Path d="M15 6l-6 6 6 6" />,
  camera: (
    <>
      <Path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <Circle cx="12" cy="13" r="3.5" />
    </>
  ),
  check: <Path d="M5 12l5 5 9-10" />,
  chevron: <Path d="M9 6l6 6-6 6" />,
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  grid: (
    <>
      <Rect x="3" y="3" width="7" height="7" rx="1.5" />
      <Rect x="14" y="3" width="7" height="7" rx="1.5" />
      <Rect x="3" y="14" width="7" height="7" rx="1.5" />
      <Rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  reset: (
    <>
      <Path d="M3 12a9 9 0 1 0 3-6.7" />
      <Path d="M3 4v5h5" />
    </>
  ),
};

export type IconName = keyof typeof glyphs;

export function Icon({
  name,
  size,
  color,
  strokeWidth = 2,
}: {
  name: IconName;
  size: number;
  color: string;
  strokeWidth?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {glyphs[name]}
    </Svg>
  );
}
