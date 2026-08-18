/**
 * Per-profile SQLCipher database lifecycle. Each Profile gets its own database file and its own
 * encryption key entry in the OS Keychain/Keystore (via expo-secure-store), so switching profiles
 * means opening a distinct encrypted store — see constitution "Data Handling: profile isolation"
 * and specs/001-personal-health-vault/data-model.md.
 *
 * The encryption key itself is never gated behind expo-secure-store's own `requireAuthentication`
 * option: the biometric/passcode prompt is owned by src/services/auth/appLock.ts, which must
 * succeed before this module is ever called. Layering a second OS prompt here would just be a
 * redundant, confusing gate on top of the one the app already controls.
 */
import { open, type DB } from "@op-engineering/op-sqlite";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

import { runMigrations } from "./schema";

const DB_KEY_PREFIX = "openheart.dbkey.";

function dbFileName(profileId: string): string {
  return `profile-${profileId}.db`;
}

async function getOrCreateEncryptionKey(profileId: string): Promise<string> {
  const secureStoreKey = `${DB_KEY_PREFIX}${profileId}`;
  const existing = await SecureStore.getItemAsync(secureStoreKey);
  if (existing) {
    return existing;
  }

  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const newKey = Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  await SecureStore.setItemAsync(secureStoreKey, newKey, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
  return newKey;
}

const openConnections = new Map<string, DB>();

/**
 * Opens (or returns the already-open) SQLCipher connection for a profile, running schema
 * migrations on first open. Callers should have already passed the app-lock gate.
 */
export async function openProfileDatabase(profileId: string): Promise<DB> {
  const cached = openConnections.get(profileId);
  if (cached) {
    return cached;
  }

  const encryptionKey = await getOrCreateEncryptionKey(profileId);
  const db = open({
    name: dbFileName(profileId),
    encryptionKey,
  });

  await runMigrations(db);
  openConnections.set(profileId, db);
  return db;
}

/** Closes a profile's connection, e.g. when switching to a different profile. */
export function closeProfileDatabase(profileId: string): void {
  const db = openConnections.get(profileId);
  if (db) {
    db.close();
    openConnections.delete(profileId);
  }
}

export function closeAllProfileDatabases(): void {
  for (const profileId of Array.from(openConnections.keys())) {
    closeProfileDatabase(profileId);
  }
}

/** Closes and permanently deletes a profile's database file — used by deleteProfile (FR-007). */
export async function deleteProfileDatabase(profileId: string): Promise<void> {
  const db = openConnections.get(profileId) ?? open({ name: dbFileName(profileId) });
  db.close();
  db.delete();
  openConnections.delete(profileId);
  await SecureStore.deleteItemAsync(`${DB_KEY_PREFIX}${profileId}`);
}
