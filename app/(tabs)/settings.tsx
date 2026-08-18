import { Platform, StyleSheet, Text, View } from "react-native";

import { useAppSession } from "../../src/hooks/useAppSession";
import { colors, fonts, radii, spacing, typeScale } from "../../src/theme/tokens";
import { LockIcon, ShieldIcon } from "../../src/components/icons";
import { Callout, PrimaryButton, Screen, SectionHeader } from "../../src/components/ui";

export default function SettingsScreen() {
  const session = useAppSession();
  const activeProfile = session.profiles.find((p) => p.id === session.activeProfileId);

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <ShieldIcon size={22} color={colors.green} />
          </View>
          <View style={styles.profileBody}>
            <Text style={styles.profileLabel}>Active profile</Text>
            <Text style={styles.profileValue}>{activeProfile?.displayName ?? "—"}</Text>
          </View>
        </View>

        {Platform.OS !== "web" && (
          <View style={styles.lockSection}>
            <SectionHeader title="Security" />
            <PrimaryButton label="Lock now / switch profile" onPress={() => session.lock()} icon={<LockIcon size={18} color={colors.white} />} />
          </View>
        )}

        <SectionHeader title="Coming next" />
        <Callout tone="neutral">
          AI provider configuration and multi-profile management are in the next milestone.
        </Callout>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
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
    borderRadius: radii.md,
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
  profileBody: { gap: 2 },
  profileLabel: { fontSize: typeScale.small, color: colors.inkMuted, textTransform: "uppercase", letterSpacing: 0.4 },
  profileValue: { fontSize: typeScale.title, fontWeight: "700", color: colors.ink, fontFamily: fonts.display },
  lockSection: { marginTop: spacing.sm },
});
