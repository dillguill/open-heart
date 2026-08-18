/**
 * Home — the main entry to the app (shape brief, specs/002-home-restructure).
 * Opens with a doctor-summary callout at the top; the rest of the page reads as
 * a summary of the user's health story: recent activity and a trends preview.
 */
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { useAppSession } from "../../src/hooks/useAppSession";
import { humanizeCategory, humanizeMetricType } from "../../src/lib/metricLabels";
import type { DocumentRecord, HealthRecord } from "../../src/models/types";
import * as Repo from "../../src/repositories";
import { colors, fonts, radii, spacing, typeScale } from "../../src/theme/tokens";
import {
  ActivityIcon,
  ChevronRightIcon,
  FileIcon,
  HeartIcon,
  ShieldIcon,
} from "../../src/components/icons";
import { Callout, DataTable, Screen, SectionHeader } from "../../src/components/ui";

type FeedItem = { kind: "record"; item: HealthRecord } | { kind: "document"; item: DocumentRecord };

export default function HomeScreen() {
  const session = useAppSession();
  const router = useRouter();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  const profileId = session.activeProfileId!;

  const load = useCallback(async () => {
    const [r, d] = await Promise.all([
      Repo.listHealthRecords(profileId),
      Repo.listDocuments(profileId),
    ]);
    setRecords(r);
    setDocuments(d);
  }, [profileId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const feed: FeedItem[] = useMemo(
    () =>
      [
        ...records.map((item): FeedItem => ({ kind: "record", item })),
        ...documents.map((item): FeedItem => ({ kind: "document", item })),
      ]
        .sort((a, b) => {
          const aDate = a.kind === "record" ? a.item.recordedAt : a.item.importedAt;
          const bDate = b.kind === "record" ? b.item.recordedAt : b.item.importedAt;
          return bDate.localeCompare(aDate);
        })
        .slice(0, 5),
    [records, documents],
  );

  /** Latest vitals for the at-a-glance table. */
  const latestVitals = useMemo(() => {
    const byMetric = new Map<string, HealthRecord>();
    for (const r of records) {
      if (r.category !== "vitals" && r.category !== "labs") continue;
      const existing = byMetric.get(r.metricType);
      if (!existing || r.recordedAt > existing.recordedAt) byMetric.set(r.metricType, r);
    }
    return [...byMetric.values()]
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
      .slice(0, 4);
  }, [records]);

  /** Simple bar sparkline for a metric's recent readings (no chart dependency). */
  const trendPreview = useMemo(() => {
    const metric = "weight";
    const points = records
      .filter((r) => r.metricType === metric && typeof r.value === "number")
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
      .slice(-8);
    return { metric, points };
  }, [records]);

  const maxValue = Math.max(...trendPreview.points.map((p) => Number(p.value)), 1);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} style={styles.scrollView}>
        {/* Doctor summary callout — the focal moment */}
        <Pressable
          onPress={() => router.push("/doctor-summary")}
          style={({ pressed }) => [styles.summaryCallout, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open doctor summary"
        >
          <View style={styles.summaryCalloutIcon}>
            <HeartIcon size={26} color={colors.white} />
          </View>
          <View style={styles.summaryCalloutBody}>
            <Text style={styles.summaryCalloutTitle}>Your health at a glance</Text>
            <Text style={styles.summaryCalloutText}>
              A clear, organized summary of your records — made to show a doctor.
            </Text>
          </View>
          <ChevronRightIcon size={22} color={colors.white} />
        </Pressable>

        {/* Privacy promise */}
        <Callout tone="green" icon={<ShieldIcon size={20} color={colors.green} />}>
          Private by default — your records live on your device, encrypted and locked behind
          biometrics. Nothing is shared unless you choose to.
        </Callout>

        {/* At-a-glance vitals */}
        {latestVitals.length > 0 && (
          <>
            <SectionHeader title="At a glance" action="View records" onAction={() => router.push("/records")} />
            <DataTable
              rows={latestVitals.map((r) => ({
                label: humanizeMetricType(r.metricType),
                value: `${r.value}${r.unit ? ` ${r.unit}` : ""}`,
                meta: new Date(r.recordedAt).toLocaleDateString(),
              }))}
            />
          </>
        )}

        {/* Trends preview */}
        {trendPreview.points.length >= 2 && (
          <>
            <SectionHeader title="Trends" action="View trends" onAction={() => router.push("/trends")} />
            <View style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <View style={styles.trendTitleRow}>
                  <ActivityIcon size={18} color={colors.green} />
                  <Text style={styles.trendTitle}>{humanizeMetricType(trendPreview.metric)}</Text>
                </View>
                <Text style={styles.trendRange}>
                  {new Date(trendPreview.points[0].recordedAt).toLocaleDateString()} –{" "}
                  {new Date(trendPreview.points[trendPreview.points.length - 1].recordedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.barChart}>
                {trendPreview.points.map((p, i) => {
                  const h = Math.max(8, (Number(p.value) / maxValue) * 72);
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
          </>
        )}

        {/* Recent activity */}
        <SectionHeader title="Recent activity" action="View all" onAction={() => router.push("/records")} />
        {feed.length === 0 ? (
          <Text style={styles.emptyText}>
            No records yet. Add a record or import a document to get started.
          </Text>
        ) : (
          <View style={styles.feed}>
            {feed.map((entry) => {
              const isRecord = entry.kind === "record";
              const title = isRecord
                ? humanizeMetricType(entry.item.metricType)
                : entry.item.title;
              const meta = isRecord
                ? `${entry.item.value}${entry.item.unit ? ` ${entry.item.unit}` : ""} · ${humanizeCategory(
                    entry.item.category,
                  )} · ${new Date(entry.item.recordedAt).toLocaleDateString()}`
                : `${humanizeCategory(entry.item.category)} · ${new Date(
                    entry.item.importedAt,
                  ).toLocaleDateString()}`;
              return (
                <Pressable
                  key={`${entry.kind}-${entry.item.id}`}
                  style={({ pressed }) => [styles.feedRow, pressed && styles.pressed]}
                  onPress={() =>
                    isRecord
                      ? router.push({ pathname: "/record/[id]", params: { id: entry.item.id } })
                      : router.push("/records")
                  }
                  accessibilityRole="button"
                >
                  <View style={styles.feedIcon}>
                    {isRecord ? (
                      <ActivityIcon size={18} color={colors.green} />
                    ) : (
                      <FileIcon size={18} color={colors.inkMuted} />
                    )}
                  </View>
                  <View style={styles.feedBody}>
                    <Text style={styles.feedTitle}>{title}</Text>
                    <Text style={styles.feedMeta}>{meta}</Text>
                  </View>
                  <ChevronRightIcon size={18} color={colors.inkMuted} />
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
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
  summaryCallout: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.green,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  summaryCalloutIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCalloutBody: { flex: 1, gap: 2 },
  summaryCalloutTitle: {
    fontFamily: fonts.display,
    color: colors.white,
    fontSize: typeScale.title,
    fontWeight: "700",
  },
  summaryCalloutText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: typeScale.small,
    lineHeight: 18,
  },
  pressed: { opacity: 0.9 },
  trendCard: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  trendHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  trendTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  trendTitle: { fontSize: typeScale.body, fontWeight: "600", color: colors.ink },
  trendRange: { fontSize: typeScale.small, color: colors.inkMuted },
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
  feed: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  feedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  feedIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.paperDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  feedBody: { flex: 1, gap: 2 },
  feedTitle: { fontSize: typeScale.body, fontWeight: "600", color: colors.ink },
  feedMeta: { fontSize: typeScale.small, color: colors.inkMuted },
  emptyText: {
    textAlign: "center",
    color: colors.inkMuted,
    marginTop: spacing.xxl,
    fontSize: typeScale.body,
  },
});