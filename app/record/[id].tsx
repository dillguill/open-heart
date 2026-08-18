/**
 * Manual Health Record entry/detail — User Story 1 (T023). Create mode when id === "new".
 * AI explanation UI (User Story 4) is added to this same screen in a later milestone.
 */
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAppSession } from "../../src/hooks/useAppSession";
import type { Category, HealthRecord } from "../../src/models/types";
import * as Repo from "../../src/repositories";
import { colors, fonts, radii, spacing, typeScale } from "../../src/theme/tokens";
import { ArrowLeftIcon } from "../../src/components/icons";
import { ChipRow, PrimaryButton, Screen } from "../../src/components/ui";

const CATEGORIES: Category[] = ["vitals", "labs", "medications", "conditions", "imaging", "notes"];

const CATEGORY_LABELS: Record<Category, string> = {
  vitals: "Vitals",
  labs: "Labs",
  medications: "Medications",
  conditions: "Conditions",
  imaging: "Imaging",
  notes: "Notes",
};

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const session = useAppSession();
  const profileId = session.activeProfileId!;

  const [existing, setExisting] = useState<HealthRecord | null>(null);
  const [category, setCategory] = useState<Category>("vitals");
  const [metricType, setMetricType] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [recordedAt, setRecordedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    void Repo.getHealthRecord(profileId, id).then((record) => {
      if (!record) return;
      setExisting(record);
      setCategory(record.category);
      setMetricType(record.metricType);
      setValue(String(record.value));
      setUnit(record.unit ?? "");
      setRecordedAt(record.recordedAt.slice(0, 10));
      setNotes(record.notes ?? "");
    });
  }, [id, isNew, profileId]);

  const handleSave = async () => {
    if (!metricType.trim() || !value.trim()) {
      Alert.alert("Missing information", "Please enter at least a metric name and a value.");
      return;
    }
    const recordedAtIso = new Date(`${recordedAt}T00:00:00`).toISOString();
    if (new Date(recordedAtIso).getTime() > Date.now()) {
      Alert.alert("Invalid date", "The recorded date can't be in the future.");
      return;
    }

    setSaving(true);
    try {
      const numericValue = Number(value);
      const parsedValue =
        Number.isFinite(numericValue) && value.trim() !== "" ? numericValue : value;

      if (isNew) {
        await Repo.createHealthRecord(profileId, {
          category,
          metricType: metricType.trim(),
          value: parsedValue,
          unit: unit.trim() || undefined,
          recordedAt: recordedAtIso,
          notes: notes.trim() || undefined,
          source: "manual",
        });
      } else if (existing) {
        await Repo.updateHealthRecord(profileId, existing.id, {
          category,
          metricType: metricType.trim(),
          value: parsedValue,
          unit: unit.trim() || undefined,
          recordedAt: recordedAtIso,
          notes: notes.trim() || undefined,
        });
      }
      router.back();
    } catch (error) {
      Alert.alert("Couldn't save", error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert("Delete record", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await Repo.deleteHealthRecord(profileId, existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeftIcon size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>{isNew ? "Add a record" : "Record"}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Category</Text>
        <ChipRow options={CATEGORIES} labels={CATEGORY_LABELS} value={category} onChange={setCategory} />

        <Text style={styles.label}>Metric name</Text>
        <Text style={styles.hint}>e.g. Blood pressure (systolic), weight, glucose</Text>
        <TextInput
          style={styles.input}
          value={metricType}
          onChangeText={setMetricType}
          placeholder="e.g. weight"
          placeholderTextColor={colors.inkMuted}
        />

        <View style={styles.row2}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Value</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="default"
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Unit (optional)</Text>
            <TextInput style={styles.input} value={unit} onChangeText={setUnit} />
          </View>
        </View>

        <Text style={styles.label}>Date</Text>
        <TextInput style={styles.input} value={recordedAt} onChangeText={setRecordedAt} />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <PrimaryButton label={saving ? "Saving…" : "Save record"} onPress={handleSave} disabled={saving} />

        {existing && (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete record</Text>
          </Pressable>
        )}
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
  backButton: {
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
  headerSpacer: { width: 40 },
  pressed: { opacity: 0.85 },
  scrollView: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
    gap: 2,
  },
  label: { fontSize: typeScale.small, color: colors.ink, fontWeight: "600", marginTop: spacing.lg, marginBottom: 4 },
  hint: { fontSize: typeScale.small, color: colors.inkMuted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typeScale.body,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  notesInput: { minHeight: 80, textAlignVertical: "top" },
  row2: { flexDirection: "row", gap: spacing.md },
  flex1: { flex: 1 },
  deleteButton: { padding: 14, alignItems: "center", marginTop: spacing.sm },
  deleteButtonText: { color: colors.error, fontSize: typeScale.body, fontWeight: "600" },
});
