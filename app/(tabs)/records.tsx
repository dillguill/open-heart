/**
 * Records list + document import — User Story 1 (T022, T024, T025).
 * Manual health-record entry lives in app/record/[id].tsx (T023).
 * Pamphlet world: humanized labels, differentiated document rows with a viewer.
 */
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Link, useFocusEffect, useRouter } from "expo-router";

import { useAppSession } from "../../src/hooks/useAppSession";
import { inferMimeType, isSupportedDocumentMimeType } from "../../src/lib/mimeTypes";
import { humanizeCategory, humanizeMetricType } from "../../src/lib/metricLabels";
import type { Category, DocumentRecord, HealthRecord } from "../../src/models/types";
import * as Repo from "../../src/repositories";
import { InsufficientStorageError } from "../../src/services/storage/fileStorage";
import { colors, fonts, radii, spacing, typeScale } from "../../src/theme/tokens";
import {
  ActivityIcon,
  ChevronRightIcon,
  FileIcon,
  PlusIcon,
} from "../../src/components/icons";
import { ChipRow, PrimaryButton, Screen, SecondaryButton } from "../../src/components/ui";

const CATEGORIES: Category[] = ["vitals", "labs", "medications", "conditions", "imaging", "notes"];

const CATEGORY_LABELS: Record<Category, string> = {
  vitals: "Vitals",
  labs: "Labs",
  medications: "Medications",
  conditions: "Conditions",
  imaging: "Imaging",
  notes: "Notes",
};

type FeedItem = { kind: "record"; item: HealthRecord } | { kind: "document"; item: DocumentRecord };

export default function RecordsScreen() {
  const session = useAppSession();
  const router = useRouter();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [importCategory, setImportCategory] = useState<Category>("labs");
  const [viewingDocument, setViewingDocument] = useState<DocumentRecord | null>(null);

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
    <Screen>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={feed}
        keyExtractor={(entry) => `${entry.kind}-${entry.item.id}`}
        ListHeaderComponent={
          <View>
            <Link href="/record/new" asChild>
              <PrimaryButton label="Add a record" icon={<PlusIcon size={18} color={colors.white} />} onPress={() => {}} />
            </Link>

            <Text style={styles.importLabel}>Import a document as</Text>
            <ChipRow
              options={CATEGORIES}
              labels={CATEGORY_LABELS}
              value={importCategory}
              onChange={setImportCategory}
            />
            <View style={styles.importRow}>
              <View style={styles.flex1}>
                <SecondaryButton label="Import file…" onPress={handleImportFromFiles} />
              </View>
              <View style={styles.flex1}>
                <SecondaryButton label="Take photo…" onPress={handleImportFromCamera} />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No records yet. Add a record or import a document to get started.
          </Text>
        }
        renderItem={({ item: entry }) =>
          entry.kind === "record" ? (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() =>
                router.push({ pathname: "/record/[id]", params: { id: entry.item.id } })
              }
              accessibilityRole="button"
            >
              <View style={styles.rowIcon}>
                <ActivityIcon size={18} color={colors.green} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{humanizeMetricType(entry.item.metricType)}</Text>
                <Text style={styles.rowSubtitle}>
                  {entry.item.value} {entry.item.unit ?? ""} · {humanizeCategory(entry.item.category)} ·{" "}
                  {new Date(entry.item.recordedAt).toLocaleDateString()}
                </Text>
              </View>
              <ChevronRightIcon size={18} color={colors.inkMuted} />
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => setViewingDocument(entry.item)}
              accessibilityRole="button"
            >
              <View style={styles.rowIcon}>
                <FileIcon size={18} color={colors.inkMuted} />
              </View>
              <View style={styles.rowBody}>
                <View style={styles.docTitleRow}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {entry.item.title}
                  </Text>
                  <View style={styles.pdfBadge}>
                    <Text style={styles.pdfBadgeText}>
                      {entry.item.mimeType === "application/pdf" ? "PDF" : "IMG"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.rowSubtitle}>
                  {humanizeCategory(entry.item.category)} ·{" "}
                  {new Date(entry.item.importedAt).toLocaleDateString()}
                </Text>
              </View>
              <ChevronRightIcon size={18} color={colors.inkMuted} />
            </Pressable>
          )
        }
      />

      {/* Lightweight document viewer */}
      <Modal
        visible={viewingDocument !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingDocument(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <FileIcon size={28} color={colors.green} />
            </View>
            <Text style={styles.modalTitle}>{viewingDocument?.title}</Text>
            <Text style={styles.modalMeta}>
              {viewingDocument ? humanizeCategory(viewingDocument.category) : ""} ·{" "}
              {viewingDocument
                ? new Date(viewingDocument.importedAt).toLocaleDateString()
                : ""}
            </Text>
            {viewingDocument?.notes ? (
              <Text style={styles.modalNotes}>{viewingDocument.notes}</Text>
            ) : null}
            <Text style={styles.modalHint}>
              In the native app this document opens from your device&rsquo;s protected storage.
            </Text>
            <PrimaryButton label="Close" onPress={() => setViewingDocument(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
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
  list: { flex: 1 },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  importLabel: {
    fontSize: typeScale.small,
    color: colors.inkMuted,
    fontWeight: "600",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  importRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg },
  flex1: { flex: 1 },
  emptyText: {
    textAlign: "center",
    color: colors.inkMuted,
    marginTop: spacing.xxl,
    fontSize: typeScale.body,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    backgroundColor: colors.white,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.paperDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontSize: typeScale.body, fontWeight: "600", color: colors.ink },
  rowSubtitle: { fontSize: typeScale.small, color: colors.inkMuted },
  docTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pdfBadge: {
    backgroundColor: colors.greenSoft,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  pdfBadgeText: { fontSize: 10, fontWeight: "700", color: colors.greenDeep },
  pressed: { opacity: 0.85 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 25, 21, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    maxWidth: 420,
    width: "100%",
    alignItems: "center",
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: typeScale.title,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
  },
  modalMeta: { fontSize: typeScale.small, color: colors.inkMuted },
  modalNotes: { fontSize: typeScale.body, color: colors.ink, textAlign: "center", lineHeight: 21 },
  modalHint: { fontSize: typeScale.small, color: colors.inkMuted, textAlign: "center", marginBottom: spacing.sm },
});
