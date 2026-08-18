import type { NewProfile, Profile } from "../models/types";

export interface AppSessionValue {
  profiles: Profile[];
  activeProfileId: string | null;
  /** True once authenticate() has succeeded for the currently selected profile. */
  isUnlocked: boolean;
  /** True once the active profile's data store is ready to read (opened DB on native, always true on web). */
  isDataReady: boolean;
  loadingProfiles: boolean;
  refreshProfiles: () => Promise<void>;
  createProfile: (input: NewProfile) => Promise<Profile>;
  selectProfile: (profileId: string) => void;
  markUnlocked: () => void;
  /** Locks the app again and releases the active profile's data store. */
  lock: () => void;
}
