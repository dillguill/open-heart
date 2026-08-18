/**
 * Doctor Summary — the at-a-glance view a clinician reads during a visit.
 * Moved out of the tabs (shape brief); reached from the Home callout.
 * Read-only and presentation-oriented (spec FR-005/FR-006).
 */
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { useAppSession } from "../src/hooks/useAppSession";
import { humanizeCategory, humanizeMetricType } from "../src/lib/metricLabels";
import type { DocumentRecord, HealthRecord } from "../src/models/types";
import * as Repo from "../src/repositories";
import { colors, fonts, radii, spacing, typeScale } from "../src/theme/tokens";
import { ArrowLeftIcon, HeartIcon, ShareIcon, ShieldIcon } from "../src/components/icons";
import { Callout, DataTable, Screen, SectionHeader } from "../src/components/ui";

export default function DoctorSummaryScreen() {
  const session = useAppSession();
  const router = useRouter();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  const profileId = session.activeProfileId!;
  const activeProfile = session.profiles.find((p) => p.id === profileId);

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

  const latestByCategory = (category: HealthRecord["category"]) => {
    const byMetric = new Map<string, HealthRecord>();
    for (const r of records) {
      if (r.category !== category) continue;
      const existing = byMetric.get(r.metricType);
      if (!existing || r.recordedAt > existing.recordedAt) byMetric.set(r.metricType, r);
    }
    return [...byMetric.values()].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  };

  const vitals = latestByCategory("vitals");
  const labs = latestByCategory("labs");
  const medications = latestByCategory("medications");
  const conditions = latestByCategory("conditions");
  const notes = latestByCategory("notes");

  const summaryRows = [
    ...vitals.map((r) => ({
      label: humanizeMetricType(r.metricType),
      value: `${r.value}${r.unit ? ` ${r.unit}` : ""}`,
      meta: new Date(r.recordedAt).toLocaleDateString(),
    })),
    ...labs.map((r) => ({
      label: humanizeMetricType(r.metricType),
      value: `${r.value}${r.unit ? ` ${r.unit}` : ""}`,
      meta: new Date(r.recordedAt).toLocaleDateString(),
    })),
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeftIcon size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Doctor Summary</Text>
        <Pressable
          onPress={() => router.push("/records")}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Share summary"
        >
          <ShareIcon size={20} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} style={styles.scrollView}>
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <HeartIcon size={24} color={colors.green} />
          </View>
          <View style={styles.profileBody}>
            <Text style={styles.profileName}>{activeProfile?.displayName ?? "Profile"}</Text>
            <Text style={styles.profileMeta}>
              {activeProfile?.relationship === "self" ? "Personal health record" : "Dependent's health record"}
            </Text>
          </View>
          <View style={styles.readyBadge}>
            <Text style={styles.readyBadgeText}>Ready for your visit</Text>
          </View>
        </View>

        {/* At a glance */}
        {summaryRows.length > 0 && (
          <>
            <SectionHeader title="At a glance" />
            <DataTable rows={summaryRows} />
          </>
        )}

        {/* Medications */}
        {medications.length > 0 && (
          <>
            <SectionHeader title="Current medications" />
            <DataTable
              rows={medications.map((r) => ({
                label: humanizeMetricType(r.metricType),
                value: String(r.value),
                meta: r.notes ?? new Date(r.recordedAt).toLocaleDateString(),
              }))}
            />
          </>
        )}

        {/* Conditions */}
        {conditions.length > 0 && (
          <>
            <SectionHeader title="Conditions" />
            <DataTable
              rows={conditions.map((r) => ({
                label: humanizeMetricType(r.metricType),
                value: String(r.value),
                meta: new Date(r.recordedAt).toLocaleDateString(),
              }))}
            />
          </>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <>
            <SectionHeader title="Documents" />
            <DataTable
              rows={documents.map((d) => ({
                label: d.title,
                value: humanizeCategory(d.category),
                meta: new Date(d.importedAt).toLocaleDateString(),
              }))}
            />
          </>
        )}

        {/* Notes */}
        {notes.length > 0 && (
          <>
            <SectionHeader title="Notes" />
            <DataTable
              rows={notes.map((r) => ({
                label: humanizeMetricType(r.metricType),
                value: String(r.value),
                meta: new Date(r.recordedAt).toLocaleDateString(),
              }))}
            />
          </>
        )}

        <Callout tone="green" icon={<ShieldIcon size={20} color={colors.green} />}>
          This summary is generated from records stored on this device. It is a personal health
          record for your own use and for sharing with a clinician — it is not a medical record
          from a hospital or clinic.
        </Callout>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    backgroundColor: colors.paper,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paperDeep,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: typeScale.heading,
    fontWeight: "600",
    color: colors.ink,
  },
  pressed: { opacity: 0.85 },
  scrollView: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.paperDeep,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBody: { flex: 1, gap: 2 },
  profileName: { fontFamily: fonts.display, fontSize: typeScale.title, fontWeight: "700", color: colors.ink },
  profileMeta: { fontSize: typeScale.small, color: colors.inkMuted },
  readyBadge: {
    backgroundColor: colors.green,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  readyBadgeText: { color: colors.white, fontSize: typeScale.micro, fontWeight: "700" },
});