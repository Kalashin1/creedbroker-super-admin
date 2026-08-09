// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile, ensureUserProfile } from "../services/user.service";
import type { UserProfile } from "../types/user.types";
// import { useNavigate } from "react-router-dom";
import { SCREENS } from "../navigation/constants";
import {
  checkSessionTimeout,
  updateSessionActivity,
} from "../services/security.service";
import { toast } from "react-toastify";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  const refreshProfile = useCallback(async () => {
    if (
      !user &&
      !(
        location.pathname.includes(SCREENS.LOGIN) ||
        location.pathname.includes(SCREENS.REGISTER)
      )
    ) {
      setProfile(null);
      location.replace(SCREENS.LOGIN);
      return;
    } else if (user) {
      try {
        console.log("auth user", user);
        // 🆕 Fetch profile, or auto-create if missing
        let p = await getUserProfile(user.uid);
        if (!p) {
          console.log("Profile document missing, creating default...");
          p = await ensureUserProfile(user.uid, user.email || "");
        }
        setProfile(p);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setProfile(null);
      }
    }
  }, [user]);

  useEffect(() => {
    async function setUp() {
      await refreshProfile();
    }

    setUp();
  }, [refreshProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await refreshProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;

    const sessionId = localStorage.getItem("currentSessionId");
    if (!sessionId) return;

    // Update session activity every 5 minutes
    const activityInterval = setInterval(
      async () => {
        await updateSessionActivity(user.uid, sessionId);
      },
      5 * 60 * 1000,
    );

    // Check session timeout every minute
    const timeoutCheckInterval = setInterval(async () => {
      const isTimedOut = await checkSessionTimeout(user.uid, sessionId);
      if (isTimedOut) {
        localStorage.removeItem("currentSessionId");
        await signOut(auth);
        toast.error("Session expired due to inactivity");
        location.assign("/login");
      }
    }, 60 * 1000);

    return () => {
      clearInterval(activityInterval);
      clearInterval(timeoutCheckInterval);
    };
  }, [user]);

  // 🆕 Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Logout failed:", err);
      throw err;
    }
  };

  const value = useMemo(
    () => ({ user, profile, loading, refreshProfile, logout }),
    [user, profile, loading, refreshProfile],
  );

  return React.createElement(AuthContext.Provider, { value }, children);
};;

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
