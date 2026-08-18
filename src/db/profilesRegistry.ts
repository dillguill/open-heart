/**
 * Lightweight registry of Profiles (id, display name, relationship, timestamps) — kept separate
 * from each profile's own SQLCipher database because a profile has to be listed (e.g. on the
 * app-lock / profile-switcher screen) before its own encrypted store can be opened.
 *
 * Stored as a single JSON blob in expo-secure-store, which is itself Keychain/Keystore-encrypted
 * at rest — the registry never needs its own SQLCipher database. Display names are visible before
 * biometric auth so the user can pick which profile to unlock (matching how the app-lock gate in
 * app/_layout.tsx works); each profile's actual health data still requires a fresh unlock via
 * src/services/auth/appLock.ts before src/db/connection.ts opens it, satisfying the constitution's
 * "profile isolation" requirement even though names are visible pre-auth.
 */
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

import type { NewProfile, Profile } from "../models/types";

const REGISTRY_KEY = "openheart.profiles";

async function readRegistry(): Promise<Profile[]> {
  const raw = await SecureStore.getItemAsync(REGISTRY_KEY);
  return raw ? (JSON.parse(raw) as Profile[]) : [];
}

async function writeRegistry(profiles: Profile[]): Promise<void> {
  await SecureStore.setItemAsync(REGISTRY_KEY, JSON.stringify(profiles), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

export async function listProfiles(): Promise<Profile[]> {
  return readRegistry();
}

export async function createProfile(input: NewProfile): Promise<Profile> {
  const profiles = await readRegistry();
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const profile: Profile = {
    id,
    displayName: input.displayName,
    relationship: input.relationship,
    dbFileRef: `profile-${id}.db`,
    createdAt: now,
    lastAccessedAt: now,
  };
  await writeRegistry([...profiles, profile]);
  return profile;
}

export async function removeProfile(profileId: string): Promise<void> {
  const profiles = await readRegistry();
  await writeRegistry(profiles.filter((profile) => profile.id !== profileId));
}

export async function touchProfile(profileId: string): Promise<void> {
  const profiles = await readRegistry();
  await writeRegistry(
    profiles.map((profile) =>
      profile.id === profileId ? { ...profile, lastAccessedAt: new Date().toISOString() } : profile,
    ),
  );
}
