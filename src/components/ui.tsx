/**
 * Shared UI components for the Patient Education Pamphlet world.
 * Ruled section headers, callout boxes, chips, buttons, and tabular data tables.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, fonts, radii, spacing, typeScale } from "../theme/tokens";

/* ---------------------------------- Screen --------------------------------- */

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

/* ------------------------------ Section header ----------------------------- */

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* --------------------------------- Callout --------------------------------- */

type CalloutTone = "green" | "amber" | "error" | "neutral";

const CALLOUT_TONES: Record<CalloutTone, { bg: string; border: string; text: string }> = {
  green: { bg: colors.greenSoft, border: colors.green, text: colors.greenDeep },
  amber: { bg: colors.amberSoft, border: colors.amber, text: "#6B4A00" },
  error: { bg: colors.errorSoft, border: colors.error, text: colors.error },
  neutral: { bg: colors.paperDeep, border: colors.rule, text: colors.inkMuted },
};

export function Callout({
  tone = "neutral",
  title,
  children,
  icon,
}: {
  tone?: CalloutTone;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const t = CALLOUT_TONES[tone];
  return (
    <View style={[styles.callout, { backgroundColor: t.bg, borderColor: t.border }]}>
      {icon ? <View style={styles.calloutIcon}>{icon}</View> : null}
      <View style={styles.calloutBody}>
        {title ? <Text style={[styles.calloutTitle, { color: t.text }]}>{title}</Text> : null}
        <Text style={[styles.calloutText, { color: t.text }]}>{children}</Text>
      </View>
    </View>
  );
}

/* ---------------------------------- Chips ---------------------------------- */

export function ChipRow<T extends string>({
  options,
  labels,
  value,
  onChange,
}: {
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {labels[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* --------------------------------- Buttons --------------------------------- */

export function PrimaryButton({
  label,
  onPress,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
    >
      {icon ? <View style={styles.buttonIcon}>{icon}</View> : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      {icon ? <View style={styles.buttonIcon}>{icon}</View> : null}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

/* -------------------------------- Data table ------------------------------- */

export interface DataRow {
  label: string;
  value: string;
  meta?: string;
}

export function DataTable({ rows }: { rows: DataRow[] }) {
  return (
    <View style={styles.table}>
      {rows.map((row, index) => (
        <View
          key={`${row.label}-${index}`}
          style={[styles.tableRow, index > 0 && styles.tableRowBorder]}
        >
          <View style={styles.tableLabelCol}>
            <Text style={styles.tableLabel}>{row.label}</Text>
            {row.meta ? <Text style={styles.tableMeta}>{row.meta}</Text> : null}
          </View>
          <Text style={styles.tableValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

/* ---------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: typeScale.heading,
    fontWeight: "600",
    color: colors.ink,
  },
  sectionAction: {
    fontSize: typeScale.small,
    color: colors.green,
    fontWeight: "600",
  },
  callout: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  calloutIcon: { paddingTop: 1 },
  calloutBody: { flex: 1, gap: 2 },
  calloutTitle: {
    fontSize: typeScale.small,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  calloutText: { fontSize: typeScale.body, lineHeight: 21 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.paperDeep,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  chipActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  chipText: { fontSize: typeScale.small, color: colors.ink, fontWeight: "500" },
  chipTextActive: { color: colors.white, fontWeight: "600" },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  primaryButtonText: { color: colors.white, fontSize: 15, fontWeight: "600" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.green,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    gap: spacing.sm,
    backgroundColor: colors.paper,
  },
  secondaryButtonText: { color: colors.green, fontSize: 15, fontWeight: "600" },
  buttonIcon: { marginRight: 2 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  table: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  tableRowBorder: { borderTopWidth: 1, borderTopColor: colors.rule },
  tableLabelCol: { flex: 1, gap: 2 },
  tableLabel: { fontSize: typeScale.body, color: colors.ink, fontWeight: "600" },
  tableMeta: { fontSize: typeScale.small, color: colors.inkMuted },
  tableValue: {
    fontSize: typeScale.body,
    color: colors.ink,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});