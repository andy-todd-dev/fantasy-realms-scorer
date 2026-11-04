import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { screenOpened } from "../state/navigation-slice";
import {
  selectHandCards,
  selectHandProgress,
  selectScore,
} from "../state/selectors";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { SuitDot } from "./SuitDot";
import { colors, fonts, SUITS } from "./theme";

// Shown where the score breakdown will go, until scoring reports more than a total.
const NO_VALUE = "–";

export function HandScreen() {
  const dispatch = useAppDispatch();
  const cards = useAppSelector(selectHandCards);
  const { longCountLabel } = useAppSelector(selectHandProgress);
  const score = useAppSelector(selectScore);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          Realm Scorer
        </Text>
        <Button
          testID="new-hand"
          label="New hand"
          variant="outline"
          icon="reset"
          iconSize={16}
          disabled
          style={styles.newHand}
          labelStyle={styles.newHandLabel}
        />
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreHeading}>Total score</Text>
        <View style={styles.scoreLine}>
          <Text testID="hand-score" style={styles.score}>
            {score ?? NO_VALUE}
          </Text>
          <Text testID="hand-count" style={styles.handCount}>
            {longCountLabel}
          </Text>
        </View>
        <View style={styles.subtotals}>
          <Text style={styles.subtotal}>Base {NO_VALUE}</Text>
          <Text style={styles.subtotal}>Bonuses {NO_VALUE}</Text>
          <Text style={styles.subtotal}>Penalties {NO_VALUE}</Text>
        </View>
        <Button
          testID="show-calculation"
          label="Show calculation"
          variant="subtle"
          icon="chevron"
          iconSize={18}
          iconPosition="end"
          disabled
          style={styles.showCalculation}
        />
      </View>

      <View style={styles.hand}>
        <View style={styles.handHeader}>
          <Text accessibilityRole="header" style={styles.handTitle}>
            Your hand
          </Text>
          <Text style={styles.handHint}>Points per card</Text>
        </View>
        <ScrollView contentContainerStyle={styles.handList}>
          {cards.length === 0 ? (
            <Text style={styles.empty}>No cards selected.</Text>
          ) : (
            cards.map((card) => (
              <View key={card.id} testID={`hand-card-${card.id}`} style={styles.row}>
                <SuitDot color={SUITS[card.suit].color} />
                <View style={styles.rowText}>
                  <Text style={styles.cardName}>{card.name}</Text>
                  <Text style={styles.cardSuit}>{SUITS[card.suit].label}</Text>
                </View>
                <Text style={styles.cardPoints}>{NO_VALUE}</Text>
                <Pressable
                  testID={`remove-card-${card.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${card.name}`}
                  disabled
                  style={styles.remove}
                >
                  <Icon name="close" size={18} color={colors.icon} />
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.actions}>
        <Button
          testID="scan-hand"
          label="Scan hand"
          variant="accent"
          icon="camera"
          iconSize={22}
          disabled
          style={styles.scan}
          labelStyle={styles.scanLabel}
        />
        <Button
          testID="pick-cards"
          label="Pick"
          variant="outline"
          icon="grid"
          onPress={() => dispatch(screenOpened("pickCards"))}
          style={styles.pick}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 0.44,
    color: colors.text,
  },
  newHand: { paddingHorizontal: 14, borderRadius: 22, gap: 6 },
  newHandLabel: { fontFamily: fonts.medium, fontSize: 14 },
  scoreCard: {
    marginTop: 8,
    marginHorizontal: 16,
    padding: 20,
    gap: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  scoreHeading: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    letterSpacing: 1.04,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  scoreLine: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 72,
    lineHeight: 80,
    color: colors.accent,
  },
  handCount: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  subtotals: { flexDirection: "row", gap: 16, marginTop: 8 },
  subtotal: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSoft },
  showCalculation: { marginTop: 14, borderRadius: 12 },
  hand: { flex: 1, minHeight: 0, paddingTop: 18, paddingHorizontal: 16 },
  handHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  handTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
  handHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  handList: { gap: 4, paddingBottom: 12 },
  empty: {
    paddingHorizontal: 4,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  row: {
    minHeight: 52,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.row,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowText: { flex: 1 },
  cardName: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  cardSuit: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  cardPoints: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontVariant: ["tabular-nums"],
    color: colors.text,
  },
  remove: {
    width: 44,
    height: 44,
    marginRight: -8,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.4,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  scan: { flex: 1, minHeight: 56, borderRadius: 14 },
  scanLabel: { fontSize: 16 },
  pick: { minHeight: 56, paddingHorizontal: 18, borderRadius: 14 },
});
