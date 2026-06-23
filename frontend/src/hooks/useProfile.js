import { useState, useEffect } from "react";

const STORAGE_KEY = "aether_user_profile";

const DEFAULT_PROFILE = {
  name: "",
  role: "",
  email: "",
  avatar: "",
};

/**
 * Shared hook — reads/writes the user profile from localStorage.
 * Any component using this hook will reflect changes immediately.
 */
export function useProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Keep state in sync across tabs / updates
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : DEFAULT_PROFILE;
          setProfile({ ...DEFAULT_PROFILE, ...updated });
        } catch {/* ignore */}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveProfile = (updates) => {
    const next = { ...profile, ...updates };
    setProfile(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // Dispatch custom event so other components on the same tab update too
    window.dispatchEvent(new CustomEvent("aether-profile-update", { detail: next }));
  };

  return { profile, saveProfile };
}
