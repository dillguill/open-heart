import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useAppSession } from "../../src/hooks/useAppSession";

export default function SettingsScreen() {
  const session = useAppSession();
  const activeProfile = session.profiles.find((p) => p.id === session.activeProfileId);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Active profile</Text>
      <Text style={styles.value}>{activeProfile?.displayName ?? "—"}</Text>

      {Platform.OS !== "web" && (
        <Pressable style={styles.lockButton} onPress={() => session.lock()}>
          <Text style={styles.lockButtonText}>Lock now / switch profile</Text>
        </Pressable>
      )}

      <Text style={styles.note}>
        AI provider configuration and multi-profile management are coming in the next milestone.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  label: { fontSize: 13, color: "#6B6B6B", textTransform: "uppercase", marginTop: 16 },
  value: { fontSize: 18, fontWeight: "600" },
  lockButton: {
    marginTop: 24,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
  },
  lockButtonText: { color: "#B3261E", fontSize: 15, fontWeight: "600" },
  note: { marginTop: 32, fontSize: 14, color: "#6B6B6B" },
});
