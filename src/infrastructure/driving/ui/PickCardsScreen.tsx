import Camera from "lucide-react-native/icons/camera";
import Check from "lucide-react-native/icons/check";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import X from "lucide-react-native/icons/x";
import type { LucideProps } from "lucide-react-native";
import { useEffect } from "react";
import { BackHandler, ScrollView } from "react-native";
import { addCardToHand } from "../state/hand-slice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { screenOpened } from "../state/navigation-slice";
import {
  CardSection,
  CardTile as CardTileData,
  selectCardSections,
  selectCardsStatus,
  selectHandCards,
  selectHandProgress,
} from "../state/selectors";
import { Box } from "./gluestack/box";
import { Button, ButtonIcon, ButtonText } from "./gluestack/button";
import { Divider } from "./gluestack/divider";
import { Heading } from "./gluestack/heading";
import { HStack } from "./gluestack/hstack";
import { Icon } from "./gluestack/icon";
import { Pressable } from "./gluestack/pressable";
import { Text } from "./gluestack/text";
import { VStack } from "./gluestack/vstack";
import { Screen } from "./Screen";
import { SuitDot } from "./SuitDot";
import { SUITS } from "./theme";

// Gluestack's Icon doesn't type strokeWidth, so these heavier weights from the design are set here.
const HeavyCheck = (props: LucideProps) => <Check {...props} strokeWidth={3} />;
const HeavyX = (props: LucideProps) => <X {...props} strokeWidth={2.5} />;

export function PickCardsScreen() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      dispatch(screenOpened("hand"));
      return true;
    });

    return () => subscription.remove();
  }, [dispatch]);

  return (
    <Screen>
      <HStack className="items-center gap-1 px-3 pb-1.5 pt-4">
        <Button
          testID="back-to-hand"
          accessibilityLabel="Back to hand"
          variant="ghost"
          size="icon"
          onPress={() => dispatch(screenOpened("hand"))}
        >
          <ButtonIcon as={ChevronLeft} className="h-5.5 w-5.5" />
        </Button>
        <Heading size="xl" accessibilityRole="header" className="flex-1">
          Pick your cards
        </Heading>
        <Button testID="pick-scan" variant="outline" size="sm" isDisabled className="px-3">
          <ButtonIcon as={Camera} className="h-4 w-4" />
          <ButtonText>Scan</ButtonText>
        </Button>
      </HStack>
      <Text size="sm" className="mx-5 mb-2 text-muted-foreground">
        Tap a card to add it. Tap again to remove it.
      </Text>

      <Grid />
      <Tray />
    </Screen>
  );
}

function Grid() {
  const status = useAppSelector(selectCardsStatus);
  const sections = useAppSelector(selectCardSections);

  if (status === "failed") {
    return <Text size="sm" className="flex-1 p-5 text-muted-foreground">Could not load cards.</Text>;
  }

  if (status !== "loaded") {
    return <Text size="sm" className="flex-1 p-5 text-muted-foreground">Loading cards...</Text>;
  }

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-3.5 px-4 pb-4">
      {sections.map((section) => (
        <Section key={section.suit} section={section} />
      ))}
    </ScrollView>
  );
}

function Section({ section: { suit, cards } }: { section: CardSection }) {
  return (
    <VStack className="gap-1.5">
      <HStack className="items-center gap-2">
        <SuitDot suit={suit} />
        <Text
          accessibilityRole="header"
          size="xs"
          className="font-body-semibold uppercase tracking-widest text-subtle-foreground"
        >
          {SUITS[suit].label}
        </Text>
      </HStack>
      {/* Padding rather than gap, so that three tiles fill each row exactly, and a short row keeps its widths. */}
      <Box className="-m-[3px] flex-row flex-wrap">
        {cards.map((card) => (
          <Box key={card.id} className="w-1/3 p-[3px]">
            <CardTile card={card} />
          </Box>
        ))}
      </Box>
    </VStack>
  );
}

function CardTile({ card: { id, name, selected } }: { card: CardTileData }) {
  const dispatch = useAppDispatch();

  return (
    <Pressable
      testID={`card-tile-${id}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled: selected }}
      // Removing a card isn't implemented yet, so a selected tile can't be tapped.
      disabled={selected}
      onPress={() => dispatch(addCardToHand(id))}
      className={
        selected
          ? "min-h-12 justify-center rounded-lg border-[1.5px] border-primary bg-accent px-2 py-1.5 data-[disabled=true]:opacity-100"
          : "min-h-12 justify-center rounded-lg border-[1.5px] border-border bg-muted px-2 py-1.5"
      }
    >
      <Text size="sm" className="pr-3.5 font-body-medium leading-tight">{name}</Text>
      {selected && (
        <Box className="absolute right-1.5 top-1.5">
          <Icon as={HeavyCheck} className="h-3.5 w-3.5 text-primary" />
        </Box>
      )}
    </Pressable>
  );
}

function Tray() {
  const cards = useAppSelector(selectHandCards);
  const { remaining, isComplete, countLabel } = useAppSelector(selectHandProgress);

  return (
    <>
      <Divider />
      <VStack className="gap-2.5 bg-muted px-4 pb-7 pt-3">
        <HStack className="items-baseline justify-between">
          <Heading size="md" accessibilityRole="header">
            Your hand
          </Heading>
          <Text testID="hand-progress" size="sm" className="font-body-semibold text-primary">
            {countLabel}
          </Text>
        </HStack>
        <HStack className="min-h-9 flex-wrap gap-1.5">
          {cards.map((card) => (
            <Pressable
              key={card.id}
              testID={`hand-chip-${card.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${card.name}`}
              disabled
              hitSlop={{ top: 4, bottom: 4 }}
              className="min-h-9 flex-row items-center gap-1.5 rounded-full border border-input bg-chip pl-2.5 pr-2 data-[disabled=true]:opacity-100"
            >
              <SuitDot suit={card.suit} size="sm" />
              <Text size="sm" className="font-body-medium">{card.name}</Text>
              <Box className="opacity-40">
                <Icon as={HeavyX} className="h-3.5 w-3.5 text-muted-foreground" />
              </Box>
            </Pressable>
          ))}
        </HStack>
        {isComplete ? (
          <Button testID="see-score" size="lg" isDisabled>
            <ButtonText>Hand complete: see score</ButtonText>
          </Button>
        ) : (
          <Box className="min-h-14 items-center justify-center rounded-2xl border border-dashed border-input">
            <Text testID="remaining-cards" className="text-muted-foreground">
              Tap {remaining} more {remaining === 1 ? "card" : "cards"}
            </Text>
          </Box>
        )}
      </VStack>
    </>
  );
}
