/**
 * Root layout: the app-lock gate + profile switcher (T016). Nothing under (tabs) or record/
 * renders until a profile is selected and biometric/passcode authentication succeeds — see
 * constitution FR-014 and src/services/auth/appLock.ts.
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
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import * as AppLock from "../src/services/auth/appLock";
import { AppSessionProvider, useAppSession } from "../src/hooks/useAppSession";
import type { Relationship } from "../src/models/types";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppSessionProvider>
        <AppLockGate>
          {Platform.OS === "web" && <DemoBanner />}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="record/[id]" options={{ headerShown: true, title: "Record" }} />
          </Stack>
        </AppLockGate>
      </AppSessionProvider>
    </SafeAreaProvider>
  );
}

function DemoBanner() {
  return (
    <View style={styles.demoBanner}>
      <Text style={styles.demoBannerText}>
        Portfolio demo — sample data only, not a real health record. The native iOS/Android app uses
        on-device encryption and biometric lock; neither exists in this browser build.
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
    return <CenteredMessage>{<ActivityIndicator />}</CenteredMessage>;
  }

  if (!session.activeProfileId) {
    return <ProfilePicker />;
  }

  if (!session.isUnlocked) {
    return <UnlockScreen />;
  }

  if (!session.isDataReady) {
    return <CenteredMessage>{<ActivityIndicator />}</CenteredMessage>;
  }

  return <>{children}</>;
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
      <Text style={styles.title}>Open Heart</Text>
      <Text style={styles.subtitle}>Choose a profile to unlock</Text>

      {session.profiles.map((profile) => (
        <Pressable
          key={profile.id}
          style={styles.profileRow}
          onPress={() => session.selectProfile(profile.id)}
        >
          <Text style={styles.profileName}>{profile.displayName}</Text>
          <Text style={styles.profileMeta}>
            {profile.relationship === "self" ? "You" : "Dependent"}
          </Text>
        </Pressable>
      ))}

      {creating ? (
        <View style={styles.createRow}>
          <TextInput
            autoFocus
            placeholder="Profile name"
            value={newName}
            onChangeText={setNewName}
            style={styles.input}
          />
          <Pressable style={styles.primaryButton} onPress={handleCreate}>
            <Text style={styles.primaryButtonText}>Create</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.secondaryButton} onPress={() => setCreating(true)}>
          <Text style={styles.secondaryButtonText}>
            {session.profiles.length === 0 ? "Create your profile" : "Add a dependent profile"}
          </Text>
        </Pressable>
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
      <Text style={styles.title}>{activeProfile?.displayName}</Text>
      <Text style={styles.subtitle}>Locked</Text>
      <Pressable style={styles.primaryButton} onPress={handleUnlock}>
        <Text style={styles.primaryButtonText}>Unlock</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => session.lock()}>
        <Text style={styles.secondaryButtonText}>Switch profile</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  demoBanner: { backgroundColor: "#0B5D4A", padding: 10 },
  demoBannerText: { color: "white", fontSize: 12, textAlign: "center" },
  container: { flex: 1, padding: 24, gap: 16, justifyContent: "center" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#6B6B6B", textAlign: "center", marginBottom: 16 },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#F2F2F2",
    marginBottom: 8,
  },
  profileName: { fontSize: 16, fontWeight: "600" },
  profileMeta: { fontSize: 14, color: "#6B6B6B" },
  createRow: { gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#0B5D4A",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  secondaryButton: { padding: 14, borderRadius: 10, alignItems: "center" },
  secondaryButtonText: { color: "#0B5D4A", fontSize: 15, fontWeight: "600" },
});
