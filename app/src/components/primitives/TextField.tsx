import { CircleAlert, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import {
  borderWidth,
  colors,
  inputHeight,
  focusRingWidth,
  radius,
  rhythm,
  space,
  typography,
} from "@/theme";

import { Text } from "./Text";

export type TextFieldProps = Omit<
  TextInputProps,
  "style" | "placeholderTextColor"
> & {
  label?: string;
  /** Help text under the field, e.g. "Use at least 8 characters". */
  helper?: string;
  /**
   * Error message under the field, saying how to fix it (S-03). Shown with an
   * icon and a heavier outline so colour is never the only signal.
   */
  error?: string;
  leadingIcon?: LucideIcon;
  /** Unit shown inside the field's end, e.g. "kg". */
  unit?: string;
  testID?: string;
};

/**
 * DESIGN.md §6 text input: 48 dp, raised fill, 8 dp radius, strong outline.
 * Focus: cyan outline. Error: danger outline (2 dp) + icon + message.
 * When to validate (on leaving the field and on submit, S-03) is up to the screen.
 */
export function TextField({
  label,
  helper,
  error,
  leadingIcon: Icon,
  unit,
  onFocus,
  onBlur,
  editable = true,
  testID,
  ...input
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const thick = focused || !!error;
  const borderColor = error
    ? colors.danger
    : focused
      ? colors.focus
      : colors.borderStrong;

  return (
    <View style={styles.field}>
      {label && (
        <Text variant="label" nativeID={testID ? `${testID}-label` : undefined}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.box,
          {
            borderColor,
            borderWidth: thick ? focusRingWidth : borderWidth,
            // Keep the content still when the outline thickens.
            paddingHorizontal:
              space[4] - (thick ? focusRingWidth - borderWidth : 0),
          },
          !editable && styles.readOnly,
        ]}
      >
        {Icon && <Icon size={20} strokeWidth={2} color={colors.textMuted} />}
        <TextInput
          {...input}
          editable={editable}
          testID={testID}
          accessibilityLabel={input.accessibilityLabel ?? label}
          accessibilityHint={error ?? helper}
          allowFontScaling
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, !editable && { color: colors.textMuted }]}
        />
        {unit && (
          <Text tone="muted" variant="label">
            {unit}
          </Text>
        )}
      </View>
      {error ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <CircleAlert size={16} strokeWidth={2} color={colors.danger} />
          <Text variant="caption" tone="danger" style={styles.messageText}>
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text variant="caption" tone="muted">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: rhythm.inGroup },
  box: {
    minHeight: inputHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: rhythm.inline,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  readOnly: { backgroundColor: colors.surface },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    // The 48 dp box sets the height; the outline sits inside it, so focus and error never shift layout.
    paddingVertical: 0,
    alignSelf: "stretch",
    textAlign: "left",
    // Web preview only: the field draws its own cyan focus outline, so drop the browser's.
    outlineWidth: 0,
  },
  message: { flexDirection: "row", alignItems: "center", gap: space[1] },
  messageText: { flex: 1 },
});
