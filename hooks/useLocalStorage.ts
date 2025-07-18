import { useState, useEffect, useCallback } from "react";

// Generic localStorage hook
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
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
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
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
  const [timerState, setTimerState, clearTimerState] = useLocalStorage(
    "focusify-timer-state",
    {
      currentMode: "focus" as const,
      timeLeft: 1500, // 25 minutes
      isRunning: false,
      lastSaved: Date.now(),
    }
  );

  const [pomodoroState, setPomodoroState, clearPomodoroState] = useLocalStorage(
    "focusify-pomodoro-state",
    {
      sessionsCompleted: 0,
      currentCycle: 1,
      totalSessions: 0,
      isOnBreak: false,
      lastReset: Date.now(),
    }
  );

  const [preferences, setPreferences, clearPreferences] = useLocalStorage(
    "focusify-preferences",
    {
      autoStartNext: false,
      notificationsEnabled: true,
      soundEnabled: true,
      soundVolume: 0.7,
      theme: "default",
    }
  );

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
  const [sessions, setSessions, clearSessions] = useLocalStorage(
    "focusify-session-history",
    []
  );

  const addSession = useCallback(
    (session: {
      mode: string;
      duration: number;
      completedAt: number;
      interrupted: boolean;
    }) => {
      setSessions((prev: any[]) => [
        ...prev,
        {
          ...session,
          id: Date.now() + Math.random(),
        },
      ]);
    },
    [setSessions]
  );

  const getSessionsForDate = useCallback(
    (date: Date) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return sessions.filter((session: any) => {
        const sessionDate = new Date(session.completedAt);
        return sessionDate >= startOfDay && sessionDate <= endOfDay;
      });
    },
    [sessions]
  );

  const getTotalSessionsToday = useCallback(() => {
    const today = new Date();
    const todaySessions = getSessionsForDate(today);
    return todaySessions.filter(
      (session: any) => session.mode === "focus" && !session.interrupted
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
