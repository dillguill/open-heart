/** Placeholder — built out in User Story 2 (specs/001-personal-health-vault/tasks.md T026-T030). */
import { StyleSheet, Text, View } from "react-native";

export default function TrendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Trend charts are coming in the next milestone.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  text: { fontSize: 16, color: "#6B6B6B", textAlign: "center" },
});
