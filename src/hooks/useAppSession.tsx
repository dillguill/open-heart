/**
 * Native app-wide session state: which Profile is active, whether the app-lock gate has been
 * passed, and whether that profile's SQLCipher database has finished opening. Consumed by
 * app/_layout.tsx (the gate itself) and by every screen via the useAppSession() hook.
 *
 * index.web.ts (this file's web counterpart) implements the same AppSessionValue shape without
 * ever touching op-sqlite/expo-secure-store, so the same _layout.tsx and screens work on web.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { closeProfileDatabase, openProfileDatabase } from "../db/connection";
import * as ProfilesRegistry from "../db/profilesRegistry";
import type { NewProfile } from "../models/types";
import type { AppSessionValue } from "./appSessionTypes";

const AppSessionContext = createContext<AppSessionValue | null>(null);

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<AppSessionValue["profiles"]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  // Tracks which profile's DB has finished opening, rather than a plain boolean, so this never
  // needs to reset itself to false from inside an effect (react-hooks/set-state-in-effect).
  const [openedForProfileId, setOpenedForProfileId] = useState<string | null>(null);

  const refreshProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    try {
      const list = await ProfilesRegistry.listProfiles();
      setProfiles(list);
    } finally {
      setLoadingProfiles(false);
    }
  }, []);

  const createProfile = useCallback(async (input: NewProfile) => {
    const profile = await ProfilesRegistry.createProfile(input);
    setProfiles((prev) => [...prev, profile]);
    return profile;
  }, []);

  const selectProfile = useCallback((profileId: string) => {
    setActiveProfileId(profileId);
    setIsUnlocked(false);
  }, []);

  const markUnlocked = useCallback(() => {
    setIsUnlocked(true);
    const profileId = activeProfileId;
    if (profileId) {
      void ProfilesRegistry.touchProfile(profileId);
      void openProfileDatabase(profileId).then(() => setOpenedForProfileId(profileId));
    }
  }, [activeProfileId]);

  const lock = useCallback(() => {
    if (activeProfileId) {
      closeProfileDatabase(activeProfileId);
    }
    setIsUnlocked(false);
    setActiveProfileId(null);
  }, [activeProfileId]);

  const isDataReady = openedForProfileId !== null && openedForProfileId === activeProfileId;

  const value = useMemo<AppSessionValue>(
    () => ({
      profiles,
      activeProfileId,
      isUnlocked,
      isDataReady,
      loadingProfiles,
      refreshProfiles,
      createProfile,
      selectProfile,
      markUnlocked,
      lock,
    }),
    [
      profiles,
      activeProfileId,
      isUnlocked,
      isDataReady,
      loadingProfiles,
      refreshProfiles,
      createProfile,
      selectProfile,
      markUnlocked,
      lock,
    ],
  );

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession(): AppSessionValue {
  const context = useContext(AppSessionContext);
  if (!context) {
    throw new Error("useAppSession must be used within an AppSessionProvider");
  }
  return context;
}
