import { useState, useEffect, useRef, useCallback } from "react";
import { TimerMode, TIMER_DURATIONS, UseTimerReturn } from "../types/timer";
import { usePomodoroState } from "./usePomodoroState";
import { DEFAULT_POMODORO_SETTINGS, NextSession } from "../types/pomodoro";

interface ExtendedUseTimerReturn extends UseTimerReturn {
  // Pomodoro state
  sessionsCompleted: number;
  currentCycle: number;
  totalSessions: number;
  isOnBreak: boolean;
  cycleProgress: number;
  nextSessionNumber: number;

  // Auto-transition
  autoStartNext: boolean;
  setAutoStartNext: (enabled: boolean) => void;

  // Cycle management
  resetCycle: () => void;
  getNextSession: (mode: TimerMode) => NextSession;
}

export const useTimer = (
  initialMode: TimerMode = "focus"
): ExtendedUseTimerReturn => {
  // Timer state
  const [currentMode, setCurrentMode] = useState<TimerMode>(initialMode);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[initialMode]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoStartNext, setAutoStartNext] = useState(
    DEFAULT_POMODORO_SETTINGS.autoStartNext
  );

  // Pomodoro cycle management
  const pomodoroState = usePomodoroState();

  // Ref to store interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer interval
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle session completion
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    clearTimer();

    // Get next session info
    const completionEvent = pomodoroState.completeSession(currentMode);
    const nextSession = pomodoroState.getNextSession(currentMode);

    // Show completion notification (placeholder for now)
    console.log("Session completed:", completionEvent);
    console.log("Next session:", nextSession);

    // Auto-transition to next mode
    setCurrentMode(nextSession.mode);
    setTimeLeft(TIMER_DURATIONS[nextSession.mode]);

    // Auto-start next session if enabled
    if (autoStartNext) {
      setTimeout(() => {
        setIsRunning(true);
        intervalRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleSessionComplete();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 3000); // 3 second delay before auto-start
    }
  }, [currentMode, autoStartNext, pomodoroState, clearTimer]);

  // Start timer
  const start = useCallback(() => {
    if (!isRunning && timeLeft > 0) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isRunning, timeLeft, handleSessionComplete]);

  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  // Reset timer
  const reset = useCallback(() => {
    setIsRunning(false);
    clearTimer();
    setTimeLeft(TIMER_DURATIONS[currentMode]);
  }, [clearTimer, currentMode]);

  // Change timer mode
  const setMode = useCallback(
    (mode: TimerMode) => {
      setIsRunning(false);
      clearTimer();
      setCurrentMode(mode);
      setTimeLeft(TIMER_DURATIONS[mode]);
      pomodoroState.handleModeChange(mode);
    },
    [clearTimer, pomodoroState]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    // Timer state
    timeLeft,
    isRunning,
    currentMode,

    // Timer controls
    start,
    pause,
    reset,
    setMode,

    // Pomodoro state
    sessionsCompleted: pomodoroState.sessionsCompleted,
    currentCycle: pomodoroState.currentCycle,
    totalSessions: pomodoroState.totalSessions,
    isOnBreak: pomodoroState.isOnBreak,
    cycleProgress: pomodoroState.cycleProgress,
    nextSessionNumber: pomodoroState.nextSessionNumber,

    // Auto-transition
    autoStartNext,
    setAutoStartNext,

    // Cycle management
    resetCycle: pomodoroState.resetCycle,
    getNextSession: pomodoroState.getNextSession,
  };
};
