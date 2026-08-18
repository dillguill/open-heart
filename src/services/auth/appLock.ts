/**
 * Biometric/passcode app-lock service. Gates every screen behind a successful authentication
 * before any profile's SQLCipher database is opened (src/db/connection.ts) — see constitution
 * "Data Handling: OS-level encryption + app lock" and FR-014.
 */
import * as LocalAuthentication from "expo-local-authentication";

export type AppLockCapability =
  { available: true } | { available: false; reason: "no_hardware" | "not_enrolled" };

export async function getAppLockCapability(): Promise<AppLockCapability> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return { available: false, reason: "no_hardware" };
  }
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    return { available: false, reason: "not_enrolled" };
  }
  return { available: true };
}

export interface AuthenticateResult {
  success: boolean;
  /** Populated only when success is false; see expo-local-authentication's LocalAuthenticationError. */
  error?: string;
}

export async function authenticate(promptMessage: string): Promise<AuthenticateResult> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    disableDeviceFallback: false,
    cancelLabel: "Cancel",
  });
  return result.success ? { success: true } : { success: false, error: result.error };
}
