import { styled } from "nativewind";
import type { ReactNode } from "react";
import { SafeAreaView, type Edges } from "react-native-safe-area-context";

// A third-party component, so NativeWind needs telling how to apply className to it.
const StyledSafeAreaView = styled(SafeAreaView, { className: "style" });

export function Screen({ children, edges }: { children: ReactNode; edges?: Edges }) {
  return (
    <StyledSafeAreaView edges={edges} className="flex-1 bg-background">
      {children}
    </StyledSafeAreaView>
  );
}
