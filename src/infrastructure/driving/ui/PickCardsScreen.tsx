import { useEffect } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { Button } from "./Button";
import { Icon } from "./Icon";
import { SuitDot } from "./SuitDot";
import { colors, fonts, SUITS } from "./theme";

const COLUMNS = 3;

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
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          testID="back-to-hand"
          accessibilityRole="button"
          accessibilityLabel="Back to hand"
          onPress={() => dispatch(screenOpened("hand"))}
          style={styles.back}
        >
          <Icon name="back" size={22} color={colors.text} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>
          Pick your cards
        </Text>
        <Button
          testID="pick-scan"
          label="Scan"
          variant="outline"
          icon="camera"
          iconSize={16}
          disabled
          style={styles.scan}
          labelStyle={styles.scanLabel}
        />
      </View>
      <Text style={styles.hint}>Tap a card to add it. Tap again to remove it.</Text>

      <Grid />
      <Tray />
    </SafeAreaView>
  );
}

function Grid() {
  const status = useAppSelector(selectCardsStatus);
  const sections = useAppSelector(selectCardSections);

  if (status === "failed") {
    return <Text style={styles.status}>Could not load cards.</Text>;
  }

  if (status !== "loaded") {
    return <Text style={styles.status}>Loading cards...</Text>;
  }

  return (
    <ScrollView style={styles.grid} contentContainerStyle={styles.gridContent}>
      {sections.map((section) => (
        <Section key={section.suit} section={section} />
      ))}
    </ScrollView>
  );
}

function Section({ section: { suit, cards } }: { section: CardSection }) {
  const { label, color } = SUITS[suit];
  const rows = Array.from({ length: Math.ceil(cards.length / COLUMNS) }, (_, row) =>
    cards.slice(row * COLUMNS, (row + 1) * COLUMNS),
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <SuitDot color={color} />
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {label}
        </Text>
      </View>
      {rows.map((row) => (
        <View key={row[0].id} style={styles.row}>
          {row.map((card) => (
            <CardTile key={card.id} card={card} />
          ))}
          {/* Keeps the tiles in a short row the same width as the others. */}
          {Array.from({ length: COLUMNS - row.length }, (_, index) => (
            <View key={index} style={styles.tileSpacer} />
          ))}
        </View>
      ))}
    </View>
  );
}

function CardTile({ card: { id, name, selected } }: { card: CardTileData }) {
  const dispatch = useAppDispatch();

  return (
    <Pressable
      testID={`card-tile-${id}`}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: selected }}
      // Removing a card isn't implemented yet, so a selected tile can't be tapped.
      disabled={selected}
      onPress={() => dispatch(addCardToHand(id))}
      style={[styles.tile, selected && styles.tileSelected]}
    >
      <Text style={styles.tileName}>{name}</Text>
      {selected && (
        <View style={styles.tileCheck}>
          <Icon name="check" size={14} color={colors.accent} strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
}

function Tray() {
  const cards = useAppSelector(selectHandCards);
  const { remaining, isComplete, countLabel } = useAppSelector(selectHandProgress);

  return (
    <View style={styles.tray}>
      <View style={styles.trayHeader}>
        <Text accessibilityRole="header" style={styles.trayTitle}>
          Your hand
        </Text>
        <Text testID="hand-progress" style={styles.trayCount}>
          {countLabel}
        </Text>
      </View>
      <View style={styles.chips}>
        {cards.map((card) => (
          <Pressable
            key={card.id}
            testID={`hand-chip-${card.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${card.name}`}
            disabled
            hitSlop={{ top: 4, bottom: 4 }}
            style={styles.chip}
          >
            <SuitDot color={SUITS[card.suit].color} size={8} />
            <Text style={styles.chipName}>{card.name}</Text>
            <View style={styles.chipRemove}>
              <Icon name="close" size={14} color={colors.textMuted} strokeWidth={2.5} />
            </View>
          </Pressable>
        ))}
      </View>
      {isComplete ? (
        <Button
          testID="see-score"
          label="Hand complete: see score"
          variant="accent"
          disabled
          style={styles.seeScore}
          labelStyle={styles.seeScoreLabel}
        />
      ) : (
        <View style={styles.remaining}>
          <Text testID="remaining-cards" style={styles.remainingText}>
            Tap {remaining} more {remaining === 1 ? "card" : "cards"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, fontFamily: fonts.display, fontSize: 22, color: colors.text },
  scan: { paddingHorizontal: 12, borderRadius: 22, gap: 6 },
  scanLabel: { fontFamily: fonts.medium, fontSize: 14 },
  hint: {
    marginHorizontal: 20,
    marginBottom: 8,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  status: {
    flex: 1,
    padding: 20,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  grid: { flex: 1 },
  gridContent: { gap: 14, paddingHorizontal: 16, paddingBottom: 16 },
  section: { gap: 6 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.96,
    textTransform: "uppercase",
    color: colors.textSoft,
  },
  row: { flexDirection: "row", gap: 6 },
  tile: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 22,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.row,
    justifyContent: "center",
  },
  tileSelected: { borderColor: colors.accent, backgroundColor: colors.selected },
  tileSpacer: { flex: 1 },
  tileName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 16,
    color: colors.text,
  },
  tileCheck: { position: "absolute", top: 6, right: 6 },
  tray: {
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: colors.row,
  },
  trayHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  trayTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.text },
  trayCount: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.accent },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, minHeight: 36 },
  chip: {
    minHeight: 36,
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.chip,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipName: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  chipRemove: { opacity: 0.4 },
  seeScore: { minHeight: 52, borderRadius: 14 },
  seeScoreLabel: { fontSize: 16 },
  remaining: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  remainingText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },
});
