import Camera from "lucide-react-native/icons/camera";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import LayoutGrid from "lucide-react-native/icons/layout-grid";
import RotateCcw from "lucide-react-native/icons/rotate-ccw";
import X from "lucide-react-native/icons/x";
import { ScrollView } from "react-native";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { screenOpened } from "../state/navigation-slice";
import {
  selectHandCards,
  selectHandProgress,
  selectScore,
} from "../state/selectors";
import { Box } from "./gluestack/box";
import { Button, ButtonIcon, ButtonText } from "./gluestack/button";
import { Card } from "./gluestack/card";
import { Divider } from "./gluestack/divider";
import { Heading } from "./gluestack/heading";
import { HStack } from "./gluestack/hstack";
import { Text } from "./gluestack/text";
import { VStack } from "./gluestack/vstack";
import { Screen } from "./Screen";
import { SuitDot } from "./SuitDot";
import { SUITS } from "./theme";

// Shown where the score breakdown will go, until scoring reports more than a total.
const NO_VALUE = "–";

// NativeWind has no class for this on native, so it has to be a style.
const TABULAR_NUMBERS = { fontVariant: ["tabular-nums" as const] };

export function HandScreen() {
  const dispatch = useAppDispatch();
  const cards = useAppSelector(selectHandCards);
  const { longCountLabel } = useAppSelector(selectHandProgress);
  const score = useAppSelector(selectScore);

  return (
    <Screen>
      <HStack className="items-center justify-between px-5 pb-2 pt-5">
        <Heading size="xl" accessibilityRole="header" className="tracking-wide">
          Realm Scorer
        </Heading>
        <Button testID="new-hand" variant="outline" size="sm" isDisabled>
          <ButtonIcon as={RotateCcw} className="h-4 w-4" />
          <ButtonText>New hand</ButtonText>
        </Button>
      </HStack>

      <Card className="mx-4 mt-2 gap-1 p-5">
        <Text size="sm" className="font-body-semibold uppercase tracking-widest text-muted-foreground">
          Total score
        </Text>
        <HStack className="items-baseline justify-between">
          <Text testID="hand-score" className="font-heading text-7xl text-primary">
            {score ?? NO_VALUE}
          </Text>
          <Text testID="hand-count" size="sm" className="text-muted-foreground">
            {longCountLabel}
          </Text>
        </HStack>
        <HStack className="mt-2 gap-4">
          <Text size="sm" className="text-subtle-foreground">Base {NO_VALUE}</Text>
          <Text size="sm" className="text-subtle-foreground">Bonuses {NO_VALUE}</Text>
          <Text size="sm" className="text-subtle-foreground">Penalties {NO_VALUE}</Text>
        </HStack>
        <Button testID="show-calculation" variant="secondary" isDisabled className="mt-3.5">
          <ButtonText>Show calculation</ButtonText>
          <ButtonIcon as={ChevronRight} className="h-4.5 w-4.5" />
        </Button>
      </Card>

      <VStack className="min-h-0 flex-1 px-4 pt-4">
        <HStack className="items-baseline justify-between px-1 pb-2">
          <Heading size="md" accessibilityRole="header">
            Your hand
          </Heading>
          <Text size="sm" className="text-muted-foreground">Points per card</Text>
        </HStack>
        <ScrollView contentContainerClassName="gap-1 pb-3">
          {cards.length === 0 ? (
            <Text size="sm" className="px-1 py-3 text-muted-foreground">No cards selected.</Text>
          ) : (
            cards.map((card) => (
              <HStack
                key={card.id}
                testID={`hand-card-${card.id}`}
                className="min-h-14 items-center gap-3 rounded-xl bg-muted px-3"
              >
                <SuitDot suit={card.suit} />
                <Box className="flex-1">
                  <Text className="font-body-medium">{card.name}</Text>
                  <Text size="xs" className="text-muted-foreground">{SUITS[card.suit].label}</Text>
                </Box>
                <Text size="lg" className="font-body-semibold" style={TABULAR_NUMBERS}>{NO_VALUE}</Text>
                <Button
                  testID={`remove-card-${card.id}`}
                  accessibilityLabel={`Remove ${card.name}`}
                  variant="ghost"
                  size="icon"
                  isDisabled
                  className="-mr-2"
                >
                  <ButtonIcon as={X} className="h-4.5 w-4.5 text-icon" />
                </Button>
              </HStack>
            ))
          )}
        </ScrollView>
      </VStack>

      <Divider />
      <HStack className="gap-2.5 px-4 pb-7 pt-3">
        <Button testID="scan-hand" size="lg" isDisabled className="flex-1">
          <ButtonIcon as={Camera} className="h-5.5 w-5.5" />
          <ButtonText>Scan hand</ButtonText>
        </Button>
        <Button
          testID="pick-cards"
          variant="outline"
          size="lg"
          onPress={() => dispatch(screenOpened("pickCards"))}
        >
          <ButtonIcon as={LayoutGrid} className="h-5 w-5" />
          <ButtonText>Pick</ButtonText>
        </Button>
      </HStack>
    </Screen>
  );
}
