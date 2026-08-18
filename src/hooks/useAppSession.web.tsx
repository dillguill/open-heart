/**
 * Web build of the app session hook — see useAppSession.tsx for why this split exists.
 * The demo has exactly one fixture profile, is always "unlocked" (there's no app-lock concept
 * for fixture data — see contracts/storage-repository.md's mock repository note), and its data
 * is ready immediately since it's just an in-memory array, never a database.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import * as Repo from "../repositories";
import type { NewProfile, Profile } from "../models/types";
import type { AppSessionValue } from "./appSessionTypes";

const AppSessionContext = createContext<AppSessionValue | null>(null);

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const refreshProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    try {
      const list = await Repo.listProfiles();
      setProfiles(list);
      // The demo has exactly one profile — select it immediately, no picker/unlock step.
      setActiveProfileId((current) => current ?? list[0]?.id ?? null);
    } finally {
      setLoadingProfiles(false);
    }
  }, []);

  const createProfile = useCallback(async (input: NewProfile) => {
    const profile = await Repo.createProfile(input);
    setProfiles((prev) => [...prev, profile]);
    return profile;
  }, []);

  const noop = useCallback(() => {}, []);

  const value = useMemo<AppSessionValue>(
    () => ({
      profiles,
      activeProfileId,
      isUnlocked: true,
      isDataReady: activeProfileId !== null,
      loadingProfiles,
      refreshProfiles,
      createProfile,
      selectProfile: noop,
      markUnlocked: noop,
      lock: noop,
    }),
    [profiles, activeProfileId, loadingProfiles, refreshProfiles, createProfile, noop],
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
