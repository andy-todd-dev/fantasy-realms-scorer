import { useCallback, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from "react-native-reanimated";

// Moves a header with the scroll: away when scrolling down, back as soon as scrolling up. All on the
// UI thread, and only React state when the header's measured height changes, not per frame.
export function useHideOnScroll() {
  const reducedMotion = useReducedMotion();
  const [headerHeight, setHeaderHeight] = useState(0);
  const height = useSharedValue(0);
  const lastOffset = useSharedValue(0);
  const hiddenBy = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    // Overscroll isn't real scrolling, and bouncing back from it mustn't move the header.
    const maxOffset = event.contentSize.height - event.layoutMeasurement.height;
    const offset = Math.max(Math.min(event.contentOffset.y, maxOffset), 0);
    const change = offset - lastOffset.get();

    lastOffset.set(offset);

    if (!reducedMotion) {
      // Never more than the offset, so the header is fully back by the time the top is reached.
      hiddenBy.set(
        Math.max(Math.min(hiddenBy.get() + change, height.get()), 0),
      );
    }
  });

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -hiddenBy.get() }],
  }));

  const onHeaderLayout = useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
      height.set(layout.height);
      setHeaderHeight(layout.height);
    },
    [height],
  );

  return { headerHeight, headerStyle, onHeaderLayout, onScroll };
}
