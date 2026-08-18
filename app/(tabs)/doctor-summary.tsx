/** Placeholder — built out in User Story 3 (specs/001-personal-health-vault/tasks.md T031-T035). */
import { StyleSheet, Text, View } from "react-native";

export default function DoctorSummaryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        The doctor-ready summary view is coming in the next milestone.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  text: { fontSize: 16, color: "#6B6B6B", textAlign: "center" },
});
