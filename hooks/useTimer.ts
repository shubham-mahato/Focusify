"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { TimerMode, TIMER_DURATIONS, UseTimerReturn } from "../types/timer";

export const useTimer = (initialMode: TimerMode = "focus"): UseTimerReturn => {
  // State for current mode
  const [currentMode, setCurrentMode] = useState<TimerMode>(initialMode);

  // State for time remaining
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[initialMode]);

  // State for running status
  const [isRunning, setIsRunning] = useState(false);

  // Ref to store interval ID (won't cause re-renders)
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing interval
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start the timer
  const start = useCallback(() => {
    if (!isRunning && timeLeft > 0) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isRunning, timeLeft]);

  // Pause the timer
  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  // Reset the timer
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
    },
    [clearTimer]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    timeLeft,
    isRunning,
    currentMode,
    start,
    pause,
    reset,
    setMode,
  };
};
