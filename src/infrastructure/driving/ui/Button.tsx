import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import { Icon, IconName } from "./Icon";
import { colors, fonts } from "./theme";

const variants = {
  accent: { backgroundColor: colors.accent, foreground: colors.onAccent },
  outline: { borderColor: colors.outline, borderWidth: 1, foreground: colors.text },
  subtle: { backgroundColor: colors.subtle, foreground: colors.text },
};

type ButtonProps = {
  label: string;
  variant: keyof typeof variants;
  icon?: IconName;
  iconSize?: number;
  iconPosition?: "start" | "end";
  disabled?: boolean;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function Button({
  label,
  variant,
  icon,
  iconSize = 20,
  iconPosition = "start",
  disabled = false,
  onPress,
  testID,
  accessibilityLabel,
  style,
  labelStyle,
}: ButtonProps) {
  const { foreground, ...surface } = variants[variant];
  const iconElement = icon && (
    <Icon name={icon} size={iconSize} color={foreground} />
  );

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        surface,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {iconPosition === "start" && iconElement}
      <Text style={[styles.label, { color: foreground }, labelStyle]}>{label}</Text>
      {iconPosition === "end" && iconElement}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
  label: { fontFamily: fonts.semiBold, fontSize: 15 },
});
