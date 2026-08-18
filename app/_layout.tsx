/**
 * Root layout: the app-lock gate + profile switcher (T016). Nothing under (tabs) or record/
 * renders until a profile is selected and biometric/passcode authentication succeeds — see
 * constitution FR-014 and src/services/auth/appLock.ts.
 *
 * ============================================================================
 * DIRECTION CONTRACT — The Patient Education Pamphlet (seed 50eeb628)
 * THESIS: Open Heart presents the user's health story the way a well-made
 *   patient education leaflet does — plain-language, reassuring, structured so
 *   anyone, especially a clinician, grasps the whole picture at a glance; it
 *   refuses the generic data-dashboard CRUD shell.
 * OWN-WORLD: paper-white ground, deep green #0B5D4A ink, amber disclosure
 *   accent, ruled section rules, callout boxes, tabular numerals, humanist
 *   sans body with a warm editorial serif display.
 * STORY: the visitor understands this is a private, trustworthy health vault —
 *   their whole story organized and readable, ready to show a doctor; data is
 *   safe, language is plain, sections read like the folds of a well-made leaflet.
 * FIRST VIEWPORT: home opens on a doctor-summary callout at the top; the rest
 *   of the page reads as a well-organized health summary — recent activity,
 *   trends preview — like the front page of a health leaflet.
 * FORM: The Patient Education Pamphlet, position 7 on the grounded list, seed
 *   key 50eeb628; raised by phosphor-terminal (AI as first-class transcript)
 *   and data-sublime (tabular numerals).
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the
 *   finish review, the verdict, DESIGN.md, and every shipping raster carrying
 *   its provenance.
 * ============================================================================
 */
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Head from "expo-router/head";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import * as AppLock from "../src/services/auth/appLock";
import { AppSessionProvider, useAppSession } from "../src/hooks/useAppSession";
import type { Relationship } from "../src/models/types";
import { colors, fonts, radii, spacing, typeScale } from "../src/theme/tokens";
import { HeartIcon, LockIcon, ShieldIcon } from "../src/components/icons";
import { PrimaryButton, SecondaryButton } from "../src/components/ui";

const DIRECTION_CONTRACT = `<!--
impeccable:direction 50eeb628
THESIS: Open Heart presents the user's health story the way a well-made patient education leaflet does — plain-language, reassuring, structured so anyone, especially a clinician, grasps the whole picture at a glance; it refuses the generic data-dashboard CRUD shell.
OWN-WORLD: paper-white ground, deep green #0B5D4A ink, amber disclosure accent, ruled section rules, callout boxes, tabular numerals, humanist sans body with a warm editorial serif display.
STORY: the visitor understands this is a private, trustworthy health vault — their whole story organized and readable, ready to show a doctor; data is safe, language is plain, sections read like the folds of a well-made leaflet.
FIRST VIEWPORT: home opens on a doctor-summary callout at the top; the rest of the page reads as a well-organized health summary — recent activity, trends preview — like the front page of a health leaflet.
FORM: The Patient Education Pamphlet, position 7 on the grounded list, seed key 50eeb628; raised by phosphor-terminal (AI as first-class transcript) and data-sublime (tabular numerals).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
-->`;

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Head>
        <title>Open Heart</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <AppSessionProvider>
        <AppLockGate>
          {Platform.OS === "web" && <DemoBanner />}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="doctor-summary" options={{ headerShown: false }} />
            <Stack.Screen name="record/[id]" options={{ headerShown: false }} />
          </Stack>
        </AppLockGate>
      </AppSessionProvider>
    </SafeAreaProvider>
  );
}

/** Emits the direction contract as a real HTML comment in the DOM so it survives the build. */
function DirectionContractMark() {
  if (Platform.OS !== "web") return null;
  return <div dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} style={{ display: "none" }} />;
}

function DemoBanner() {
  return (
    <View style={styles.demoBanner}>
      <View style={styles.demoBannerIcon}>
        <ShieldIcon size={16} color={colors.white} />
      </View>
      <Text style={styles.demoBannerText}>
        Portfolio demo — sample data only, not a real health record. The native iOS/Android app
        uses on-device encryption and biometric lock; neither exists in this browser build.
      </Text>
    </View>
  );
}

function AppLockGate({ children }: { children: React.ReactNode }) {
  const session = useAppSession();

  useEffect(() => {
    void session.refreshProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session.loadingProfiles) {
    return <CenteredMessage>{<ActivityIndicator color={colors.green} />}</CenteredMessage>;
  }

  if (!session.activeProfileId) {
    return <ProfilePicker />;
  }

  if (!session.isUnlocked) {
    return <UnlockScreen />;
  }

  if (!session.isDataReady) {
    return <CenteredMessage>{<ActivityIndicator color={colors.green} />}</CenteredMessage>;
  }

  return (
    <>
      <DirectionContractMark />
      {children}
    </>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.centered}>
      <View>{children}</View>
    </SafeAreaView>
  );
}

function ProfilePicker() {
  const session = useAppSession();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const relationship: Relationship = session.profiles.length === 0 ? "self" : "dependent";
    const profile = await session.createProfile({ displayName: newName.trim(), relationship });
    setNewName("");
    setCreating(false);
    session.selectProfile(profile.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandMark}>
        <HeartIcon size={28} color={colors.green} />
      </View>
      <Text style={styles.title}>Open Heart</Text>
      <Text style={styles.subtitle}>Your health story, kept private on your device.</Text>

      <View style={styles.profileList}>
        {session.profiles.map((profile) => (
          <Pressable
            key={profile.id}
            style={({ pressed }) => [styles.profileRow, pressed && styles.pressed]}
            onPress={() => session.selectProfile(profile.id)}
            accessibilityRole="button"
          >
            <View>
              <Text style={styles.profileName}>{profile.displayName}</Text>
              <Text style={styles.profileMeta}>
                {profile.relationship === "self" ? "Your own records" : "Dependent's records"}
              </Text>
            </View>
            <LockIcon size={18} color={colors.inkMuted} />
          </Pressable>
        ))}
      </View>

      {creating ? (
        <View style={styles.createRow}>
          <TextInput
            autoFocus
            placeholder="Profile name"
            placeholderTextColor={colors.inkMuted}
            value={newName}
            onChangeText={setNewName}
            style={styles.input}
          />
          <PrimaryButton label="Create" onPress={handleCreate} />
        </View>
      ) : (
        <SecondaryButton
          label={session.profiles.length === 0 ? "Create your profile" : "Add a dependent profile"}
          onPress={() => setCreating(true)}
        />
      )}
    </SafeAreaView>
  );
}

function UnlockScreen() {
  const session = useAppSession();
  const activeProfile = session.profiles.find((p) => p.id === session.activeProfileId);

  const handleUnlock = async () => {
    const capability = await AppLock.getAppLockCapability();
    if (!capability.available) {
      Alert.alert(
        "App lock unavailable",
        capability.reason === "no_hardware"
          ? "This device has no biometric/passcode hardware available."
          : "Set a device passcode or enroll biometrics in your device settings to use Open Heart.",
      );
      return;
    }
    const result = await AppLock.authenticate(
      `Unlock ${activeProfile?.displayName ?? "your profile"}`,
    );
    if (result.success) {
      session.markUnlocked();
    }
  };

  useEffect(() => {
    void handleUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.activeProfileId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandMark}>
        <LockIcon size={28} color={colors.green} />
      </View>
      <Text style={styles.title}>{activeProfile?.displayName}</Text>
      <Text style={styles.subtitle}>Locked — your records stay private until you unlock.</Text>
      <PrimaryButton label="Unlock" onPress={handleUnlock} />
      <SecondaryButton label="Switch profile" onPress={() => session.lock()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  demoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.green,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  demoBannerIcon: { paddingTop: 1 },
  demoBannerText: { color: colors.white, fontSize: typeScale.micro, lineHeight: 16, flex: 1 },
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.lg,
    justifyContent: "center",
    backgroundColor: colors.paper,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
  },
  brandMark: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: typeScale.display,
    fontWeight: "700",
    textAlign: "center",
    color: colors.ink,
  },
  subtitle: {
    fontSize: typeScale.body,
    color: colors.inkMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  profileList: { gap: spacing.sm, marginBottom: spacing.sm },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.paperDeep,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  profileName: { fontSize: typeScale.body, fontWeight: "600", color: colors.ink },
  profileMeta: { fontSize: typeScale.small, color: colors.inkMuted, marginTop: 2 },
  createRow: { gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typeScale.body,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  pressed: { opacity: 0.85 },
});
