/**
 * Trends — User Story 2. Charts for repeated metrics over a selectable range.
 * Built from fixture data with lightweight bar charts (no chart dependency).
 */
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { useAppSession } from "../../src/hooks/useAppSession";
import { humanizeMetricType } from "../../src/lib/metricLabels";
import type { HealthRecord } from "../../src/models/types";
import * as Repo from "../../src/repositories";
import { colors, fonts, radii, spacing, typeScale } from "../../src/theme/tokens";
import { ActivityIcon } from "../../src/components/icons";
import { ChipRow, Screen, SectionHeader } from "../../src/components/ui";

type RangeKey = "all" | "3m" | "6m" | "1y";

const RANGES: Record<RangeKey, string> = {
  all: "All time",
  "3m": "3 months",
  "6m": "6 months",
  "1y": "1 year",
};

const RANGE_MS: Record<RangeKey, number | null> = {
  all: null,
  "3m": 90 * 24 * 60 * 60 * 1000,
  "6m": 180 * 24 * 60 * 60 * 1000,
  "1y": 365 * 24 * 60 * 60 * 1000,
};

export default function TrendsScreen() {
  const session = useAppSession();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [range, setRange] = useState<RangeKey>("all");
  const [now, setNow] = useState(() => Date.now());

  const profileId = session.activeProfileId!;

  const load = useCallback(async () => {
    setNow(Date.now());
    setRecords(await Repo.listHealthRecords(profileId));
  }, [profileId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const series = useMemo(() => {
    const cutoff = RANGE_MS[range] ? now - RANGE_MS[range]! : 0;
    const byMetric = new Map<string, HealthRecord[]>();
    for (const r of records) {
      if (typeof r.value !== "number") continue;
      if (cutoff && new Date(r.recordedAt).getTime() < cutoff) continue;
      const list = byMetric.get(r.metricType) ?? [];
      list.push(r);
      byMetric.set(r.metricType, list);
    }
    return [...byMetric.entries()]
      .map(([metric, points]) => ({
        metric,
        points: points.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)),
      }))
      .filter((s) => s.points.length >= 2)
      .sort((a, b) => b.points.length - a.points.length);
  }, [records, range, now]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} style={styles.scrollView}>
        <Text style={styles.rangeLabel}>Time range</Text>
        <ChipRow options={["all", "3m", "6m", "1y"] as const} labels={RANGES} value={range} onChange={setRange} />

        {series.length === 0 ? (
          <View style={styles.empty}>
            <ActivityIcon size={28} color={colors.green} />
            <Text style={styles.emptyTitle}>Not enough data yet</Text>
            <Text style={styles.emptyText}>
              Add at least two readings of the same metric to see a trend here.
            </Text>
          </View>
        ) : (
          series.map((s) => <TrendChart key={s.metric} series={s} />)
        )}
      </ScrollView>
    </Screen>
  );
}

function TrendChart({ series }: { series: { metric: string; points: HealthRecord[] } }) {
  const values = series.points.map((p) => Number(p.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const unit = series.points[0].unit;

  return (
    <View style={styles.chartCard}>
      <SectionHeader title={humanizeMetricType(series.metric)} />
      <View style={styles.chartStats}>
        <View>
          <Text style={styles.chartStatLabel}>Latest</Text>
          <Text style={styles.chartStatValue}>
            {values[values.length - 1]}
            {unit ? ` ${unit}` : ""}
          </Text>
        </View>
        <View>
          <Text style={styles.chartStatLabel}>Range</Text>
          <Text style={styles.chartStatValue}>
            {min}–{max}
            {unit ? ` ${unit}` : ""}
          </Text>
        </View>
        <View>
          <Text style={styles.chartStatLabel}>Readings</Text>
          <Text style={styles.chartStatValue}>{values.length}</Text>
        </View>
      </View>
      <View style={styles.barChart}>
        {series.points.map((p, i) => {
          const h = 8 + ((Number(p.value) - min) / span) * 72;
          return (
            <View key={i} style={styles.barCol}>
              <View style={[styles.bar, { height: h }]} />
              <Text style={styles.barLabel}>
                {new Date(p.recordedAt).toLocaleDateString(undefined, { month: "short" })}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  rangeLabel: {
    fontSize: typeScale.small,
    color: colors.inkMuted,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xxl,
    padding: spacing.xl,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: typeScale.heading,
    fontWeight: "600",
    color: colors.ink,
  },
  emptyText: { fontSize: typeScale.body, color: colors.inkMuted, textAlign: "center", lineHeight: 21 },
  chartCard: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  chartStats: {
    flexDirection: "row",
    gap: spacing.xxl,
    marginBottom: spacing.lg,
  },
  chartStatLabel: { fontSize: typeScale.small, color: colors.inkMuted },
  chartStatValue: {
    fontSize: typeScale.title,
    fontWeight: "700",
    color: colors.ink,
    fontVariant: ["tabular-nums"],
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    height: 96,
  },
  barCol: { flex: 1, alignItems: "center", gap: 4, height: 96, justifyContent: "flex-end" },
  bar: {
    width: "100%",
    maxWidth: 28,
    borderRadius: 4,
    backgroundColor: colors.green,
    opacity: 0.85,
  },
  barLabel: { fontSize: 10, color: colors.inkMuted },
});
