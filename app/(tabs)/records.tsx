/**
 * Records list + document import — User Story 1 (T022, T024, T025).
 * Manual health-record entry lives in app/record/[id].tsx (T023).
 */
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Link, useFocusEffect, useRouter } from "expo-router";

import { useAppSession } from "../../src/hooks/useAppSession";
import { inferMimeType, isSupportedDocumentMimeType } from "../../src/lib/mimeTypes";
import type { Category, DocumentRecord, HealthRecord } from "../../src/models/types";
import * as Repo from "../../src/repositories";
import { InsufficientStorageError } from "../../src/services/storage/fileStorage";

const CATEGORIES: Category[] = ["vitals", "labs", "medications", "conditions", "imaging", "notes"];

type FeedItem = { kind: "record"; item: HealthRecord } | { kind: "document"; item: DocumentRecord };

export default function RecordsScreen() {
  const session = useAppSession();
  const router = useRouter();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [importCategory, setImportCategory] = useState<Category>("labs");

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

  /** Shared by both the file picker and the camera path — validates, warns on duplicates, imports. */
  const importPickedAsset = useCallback(
    async (uri: string, name: string, reportedMimeType?: string | null) => {
      const mimeType = inferMimeType(name, reportedMimeType);

      if (!isSupportedDocumentMimeType(mimeType)) {
        Alert.alert(
          "Unsupported file type",
          `"${name}" is a ${mimeType} file. Open Heart only supports PDF, JPG, and PNG documents.`,
        );
        return;
      }

      const duplicate = await Repo.findLikelyDuplicateDocument(profileId, name, mimeType);
      if (duplicate) {
        const proceed = await confirmAsync(
          "Possible duplicate",
          `A document named "${name}" was already imported on ${new Date(duplicate.importedAt).toLocaleDateString()}. Import it again anyway?`,
        );
        if (!proceed) return;
      }

      try {
        const bytes = await new File(uri).bytes();
        await Repo.importDocument(
          profileId,
          { title: name, category: importCategory, mimeType, originalFileName: name },
          bytes,
        );
        await load();
      } catch (error) {
        if (error instanceof InsufficientStorageError) {
          Alert.alert("Not enough storage", error.message);
        } else {
          Alert.alert("Import failed", error instanceof Error ? error.message : String(error));
        }
      }
    },
    [profileId, importCategory, load],
  );

  const handleImportFromFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/png"],
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    await importPickedAsset(asset.uri, asset.name, asset.mimeType);
  };

  const handleImportFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Camera access needed",
        "Enable camera access in your device settings to photograph a document.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    const name = asset.fileName ?? `photo-${Date.now()}.jpg`;
    await importPickedAsset(asset.uri, name, "image/jpeg");
  };

  const feed: FeedItem[] = [
    ...records.map((item): FeedItem => ({ kind: "record", item })),
    ...documents.map((item): FeedItem => ({ kind: "document", item })),
  ].sort((a, b) => {
    const aDate = a.kind === "record" ? a.item.recordedAt : a.item.importedAt;
    const bDate = b.kind === "record" ? b.item.recordedAt : b.item.importedAt;
    return bDate.localeCompare(aDate);
  });

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <Link href="/record/new" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>+ Add record</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.sectionLabel}>Import document as</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category}
            onPress={() => setImportCategory(category)}
            style={[styles.chip, importCategory === category && styles.chipActive]}
          >
            <Text style={[styles.chipText, importCategory === category && styles.chipTextActive]}>
              {category}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.importRow}>
        <Pressable style={[styles.secondaryButton, styles.flex1]} onPress={handleImportFromFiles}>
          <Text style={styles.secondaryButtonText}>Import file…</Text>
        </Pressable>
        <Pressable style={[styles.secondaryButton, styles.flex1]} onPress={handleImportFromCamera}>
          <Text style={styles.secondaryButtonText}>Take photo…</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        data={feed}
        keyExtractor={(entry) => `${entry.kind}-${entry.item.id}`}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No records yet. Add a record or import a document to get started.
          </Text>
        }
        renderItem={({ item: entry }) =>
          entry.kind === "record" ? (
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push({ pathname: "/record/[id]", params: { id: entry.item.id } })
              }
            >
              <Text style={styles.rowTitle}>{entry.item.metricType}</Text>
              <Text style={styles.rowSubtitle}>
                {entry.item.value} {entry.item.unit ?? ""} · {entry.item.category} ·{" "}
                {new Date(entry.item.recordedAt).toLocaleDateString()}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{entry.item.title}</Text>
              <Text style={styles.rowSubtitle}>
                {entry.item.category} · {new Date(entry.item.importedAt).toLocaleDateString()}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

function confirmAsync(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: "Import anyway", onPress: () => resolve(true) },
    ]);
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  actionsRow: { flexDirection: "row", marginBottom: 12 },
  sectionLabel: { fontSize: 13, color: "#6B6B6B", textTransform: "uppercase", marginTop: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 8 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F2F2F2",
  },
  chipActive: { backgroundColor: "#0B5D4A" },
  chipText: { fontSize: 13, color: "#333" },
  chipTextActive: { color: "white", fontWeight: "600" },
  primaryButton: {
    backgroundColor: "#0B5D4A",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  primaryButtonText: { color: "white", fontWeight: "600", fontSize: 15 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#0B5D4A",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: { color: "#0B5D4A", fontWeight: "600" },
  importRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  flex1: { flex: 1 },
  list: { flex: 1 },
  emptyText: { textAlign: "center", color: "#6B6B6B", marginTop: 32 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDD",
  },
  rowTitle: { fontSize: 16, fontWeight: "600" },
  rowSubtitle: { fontSize: 13, color: "#6B6B6B", marginTop: 2 },
});
