"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const WARNING_BEFORE_TIMEOUT_MS = 30 * 1000; // Warning shown in the last 30 seconds
const STORAGE_KEY = "beacon_last_activity_time";

interface IdleContextType {
  resetTimer: () => void;
  secondsRemaining: number | null;
}

const IdleContext = createContext<IdleContextType>({
  resetTimer: () => {},
  secondsRemaining: null,
});

export const useIdle = () => useContext(IdleContext);

export default function IdleLogoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const isLoggingOutRef = useRef(false);

  const performLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Auto-logout error:", err);
    } finally {
      router.push("/login?reason=timeout");
      router.refresh();
    }
  }, [router]);

  const resetTimer = useCallback(() => {
    if (isLoggingOutRef.current) return;
    const now = Date.now();
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, now.toString());
    }
    setSecondsRemaining(null);
  }, []);

  const checkActivity = useCallback(() => {
    if (isLoggingOutRef.current) return;
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    const lastActivity = stored ? parseInt(stored, 10) : Date.now();
    const now = Date.now();
    const elapsed = now - lastActivity;

    if (elapsed >= INACTIVITY_TIMEOUT_MS) {
      performLogout();
      return;
    }

    const timeLeftMs = INACTIVITY_TIMEOUT_MS - elapsed;
    if (timeLeftMs <= WARNING_BEFORE_TIMEOUT_MS) {
      setSecondsRemaining(Math.max(1, Math.ceil(timeLeftMs / 1000)));
    } else {
      setSecondsRemaining(null);
    }
  }, [performLogout]);

  useEffect(() => {
    // Initialize timestamp if not already set
    if (typeof window !== "undefined") {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      }
    }

    // Activity event listeners
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    let throttleTimer: NodeJS.Timeout | null = null;
    const handleUserActivity = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          resetTimer();
          throttleTimer = null;
        }, 1000);
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Check interval every 2 seconds
    const interval = setInterval(() => {
      checkActivity();
    }, 2000);

    // Immediate check when tab becomes visible again or regains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkActivity();
      }
    };

    const handleFocus = () => {
      checkActivity();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handleFocus);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handleFocus);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [resetTimer, checkActivity]);

  return (
    <IdleContext.Provider value={{ resetTimer, secondsRemaining }}>
      {children}

      {/* Inactivity Security Warning Banner / Modal (during the last 30s) */}
      {secondsRemaining !== null && secondsRemaining > 0 && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm w-full bg-surface-container-highest dark:bg-[#182030] border-2 border-amber-500/80 shadow-2xl rounded-2xl p-4 text-slate-900 dark:text-white backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl animate-pulse">timer</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>Inactivity Warning</span>
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  {secondsRemaining}s
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                You have been inactive. For your security, you will be automatically logged out in {secondsRemaining} seconds.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetTimer}
                  className="w-full py-1.5 px-3 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary-container transition-colors shadow-sm"
                >
                  Stay Signed In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </IdleContext.Provider>
  );
}
