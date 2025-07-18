"use client";
import { useState, useCallback } from "react";
import { TimerMode } from "../types/timer";

// Session interface
interface Session {
  id: string | number;
  mode: TimerMode;
  duration: number;
  completedAt: number;
  interrupted: boolean;
}

// Timer state interface
interface TimerStateStorage {
  currentMode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  lastSaved: number;
}

// Pomodoro state interface
interface PomodoroStateStorage {
  sessionsCompleted: number;
  currentCycle: number;
  totalSessions: number;
  isOnBreak: boolean;
  lastReset: number;
}

// Preferences interface
interface PreferencesStorage {
  autoStartNext: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  theme: string;
}

// Generic localStorage hook
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if we're in the browser
      if (typeof window === "undefined") {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Set value in both state and localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((currentValue) => {
          const valueToStore =
            value instanceof Function ? value(currentValue) : value;

          // Only access localStorage in browser
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }

          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  ); // Remove storedValue from dependencies

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      // Only access localStorage in browser
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Specific hooks for timer data
export function useTimerStorage() {
  const [timerState, setTimerState, clearTimerState] =
    useLocalStorage<TimerStateStorage>("focusify-timer-state", {
      currentMode: "focus",
      timeLeft: 1500, // 25 minutes
      isRunning: false,
      lastSaved: Date.now(),
    });

  const [pomodoroState, setPomodoroState, clearPomodoroState] =
    useLocalStorage<PomodoroStateStorage>("focusify-pomodoro-state", {
      sessionsCompleted: 0,
      currentCycle: 1,
      totalSessions: 0,
      isOnBreak: false,
      lastReset: Date.now(),
    });

  const [preferences, setPreferences, clearPreferences] =
    useLocalStorage<PreferencesStorage>("focusify-preferences", {
      autoStartNext: false,
      notificationsEnabled: true,
      soundEnabled: true,
      soundVolume: 0.7,
      theme: "default",
    });

  // Clear all stored data
  const clearAllData = useCallback(() => {
    clearTimerState();
    clearPomodoroState();
    clearPreferences();
  }, [clearTimerState, clearPomodoroState, clearPreferences]);

  return {
    timerState,
    setTimerState,
    pomodoroState,
    setPomodoroState,
    preferences,
    setPreferences,
    clearAllData,
  };
}

// Session history storage
export function useSessionHistory() {
  const [sessions, setSessions, clearSessions] = useLocalStorage<Session[]>(
    "focusify-session-history",
    []
  );

  const addSession = useCallback(
    (sessionData: {
      mode: TimerMode;
      duration: number;
      completedAt: number;
      interrupted: boolean;
    }) => {
      setSessions((prev: Session[]) => [
        ...prev,
        {
          ...sessionData,
          id: Date.now() + Math.random(),
        },
      ]);
    },
    [setSessions]
  );

  const getSessionsForDate = useCallback(
    (date: Date): Session[] => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return sessions.filter((session: Session) => {
        const sessionDate = new Date(session.completedAt);
        return sessionDate >= startOfDay && sessionDate <= endOfDay;
      });
    },
    [sessions]
  );

  const getTotalSessionsToday = useCallback((): number => {
    const today = new Date();
    const todaySessions = getSessionsForDate(today);
    return todaySessions.filter(
      (session: Session) => session.mode === "focus" && !session.interrupted
    ).length;
  }, [getSessionsForDate]);

  return {
    sessions,
    addSession,
    getSessionsForDate,
    getTotalSessionsToday,
    clearSessions,
  };
}
