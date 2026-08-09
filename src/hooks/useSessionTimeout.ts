import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { toast } from "react-toastify";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export const useSessionTimeout = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (!user || !settings?.sessionTimeout) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(
      async () => {
        await signOut(auth);
        toast.error("Session expired due to inactivity. Please log in again.");
        navigate("/login");
      },
      // settings.sessionTimeout * 60 * 1000,
      60 * 60 * 1000
    ); // Convert minutes to milliseconds
  }, [user, settings?.sessionTimeout, navigate]);

  useEffect(() => {
    if (!user || !settings?.sessionTimeout) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer on mount

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, settings?.sessionTimeout, resetTimer]);
};
