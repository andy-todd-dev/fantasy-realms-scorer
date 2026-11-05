import ChevronLeft from "lucide-react-native/icons/chevron-left";
import X from "lucide-react-native/icons/x";
import { useEffect } from "react";
import { BackHandler, ScrollView } from "react-native";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { screenOpened } from "../state/navigation-slice";
import { selectHandCards, selectHandProgress, selectScore } from "../state/selectors";
import { Box } from "./gluestack/box";
import { Button, ButtonIcon } from "./gluestack/button";
import { Card } from "./gluestack/card";
import { Divider } from "./gluestack/divider";
import { Heading } from "./gluestack/heading";
import { HStack } from "./gluestack/hstack";
import { Text } from "./gluestack/text";
import { VStack } from "./gluestack/vstack";
import { Screen } from "./Screen";
import { SuitDot } from "./SuitDot";
import { NO_VALUE, SUITS } from "./theme";

// NativeWind has no class for this on native, so it has to be a style.
const TABULAR_NUMBERS = { fontVariant: ["tabular-nums" as const] };

// Scoring only reports a total so far, so these figures are placeholders.
const STATS = ["Base", "Bonuses", "Penalties"];

export function BreakdownScreen() {
  const dispatch = useAppDispatch();
  const cards = useAppSelector(selectHandCards);
  const { isComplete, reviewLabel } = useAppSelector(selectHandProgress);
  const score = useAppSelector(selectScore) ?? NO_VALUE;

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      dispatch(screenOpened("home"));
      return true;
    });

    return () => subscription.remove();
  }, [dispatch]);

  return (
    <Screen>
      <HStack className="items-center gap-1 px-3 pt-4">
        <Button
          testID="back-to-cards"
          accessibilityLabel="Back to cards"
          variant="ghost"
          size="icon"
          onPress={() => dispatch(screenOpened("home"))}
        >
          <ButtonIcon as={ChevronLeft} className="h-5.5 w-5.5" />
        </Button>
        <VStack className="flex-1">
          <Heading testID="breakdown-title" size="xl" accessibilityRole="header">
            Your hand: {score}
          </Heading>
          <Text
            testID="breakdown-count"
            size="sm"
            className={isComplete ? "text-primary" : "text-muted-foreground"}
          >
            {reviewLabel}
          </Text>
        </VStack>
      </HStack>

      {/* Padding rather than gap, so that three tiles fill the row exactly. */}
      <HStack className="mx-3 mt-3">
        {STATS.map((label) => (
          <Box key={label} className="w-1/3 p-1">
            <Card className="gap-0.5 rounded-xl border-0 px-3 py-2.5">
              <Text size="xs" className="text-muted-foreground">{label}</Text>
              <Text className="font-body-semibold text-xl">{NO_VALUE}</Text>
            </Card>
          </Box>
        ))}
      </HStack>

      <ScrollView className="mt-2.5 flex-1" contentContainerClassName="gap-2 px-4 pb-3">
        {cards.map((card) => (
          <HStack
            key={card.id}
            testID={`breakdown-card-${card.id}`}
            className="items-center gap-2.5 rounded-2xl bg-muted py-1 pl-3.5 pr-1"
          >
            <SuitDot suit={card.suit} />
            <Text className="flex-1 font-body-semibold">
              {card.name}{" "}
              <Text size="xs" className="text-muted-foreground">{SUITS[card.suit].label}</Text>
            </Text>
            <Text size="lg" className="font-body-bold text-primary" style={TABULAR_NUMBERS}>
              {NO_VALUE}
            </Text>
            <Button
              testID={`remove-card-${card.id}`}
              accessibilityLabel={`Remove ${card.name} from hand`}
              variant="ghost"
              size="icon"
              isDisabled
            >
              <ButtonIcon as={X} className="h-4.5 w-4.5 text-icon" />
            </Button>
          </HStack>
        ))}
      </ScrollView>

      <Divider />
      <VStack className="gap-1 px-5 pb-4 pt-3.5">
        <HStack className="items-baseline justify-between">
          <Text className="text-subtle-foreground">Total</Text>
          <Text testID="breakdown-total" className="font-heading text-4xl text-primary">
            {score}
          </Text>
        </HStack>
        <Text size="xs" className="text-muted-foreground">Blanked cards: {NO_VALUE}</Text>
      </VStack>
    </Screen>
  );
}
