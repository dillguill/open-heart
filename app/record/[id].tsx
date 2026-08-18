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

const CATEGORIES: Category[] = ["vitals", "labs", "medications", "conditions", "imaging", "notes"];

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.chip, category === c && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>
        Metric (e.g. &ldquo;weight&rdquo;, &ldquo;blood_pressure_systolic&rdquo;)
      </Text>
      <TextInput style={styles.input} value={metricType} onChangeText={setMetricType} />

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

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={recordedAt} onChangeText={setRecordedAt} />

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Pressable style={styles.primaryButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.primaryButtonText}>{saving ? "Saving…" : "Save"}</Text>
      </Pressable>

      {existing && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete record</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 4 },
  label: { fontSize: 13, color: "#6B6B6B", marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  notesInput: { minHeight: 80, textAlignVertical: "top" },
  row2: { flexDirection: "row", gap: 12 },
  flex1: { flex: 1 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: "#F2F2F2" },
  chipActive: { backgroundColor: "#0B5D4A" },
  chipText: { fontSize: 13, color: "#333" },
  chipTextActive: { color: "white", fontWeight: "600" },
  primaryButton: {
    backgroundColor: "#0B5D4A",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  primaryButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  deleteButton: { padding: 14, alignItems: "center", marginTop: 8 },
  deleteButtonText: { color: "#B3261E", fontSize: 15, fontWeight: "600" },
});
