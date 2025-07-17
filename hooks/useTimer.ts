"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type TimerMode = "focus" | "short-break" | "long-break";

const TIMER_DURATIONS = {
  focus: 25 * 60,
  "short-break": 5 * 60,
  "long-break": 15 * 60,
};

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  currentMode: TimerMode;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: TimerMode) => void;
}

export const useTimer = (initialMode: TimerMode = "focus"): UseTimerReturn => {
  // state for current Mode
  const [currentMode, setCurrentMode] = useState<TimerMode>(initialMode);
  // state for timer remaining
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[initialMode]);
  // state for running state
  const [isRunning, setIsRunning] = useState(false);

  //Ref to store Interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  //Timer Controls
  //Clear any existing Interval

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  //Start the Timer

  const start = useCallback(() => {
    if (!isRunning && timeLeft > 0) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev < 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isRunning, timeLeft]);

  //Pause the timer

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  //Reset Timer

  const reset = useCallback(() => {
    setIsRunning(false);
    clearTimer();
    setTimeLeft(TIMER_DURATIONS[currentMode]);
  }, [clearTimer, currentMode]);

  // Change Timer Mode

  const setMode = useCallback(
    (mode: TimerMode) => {
      setIsRunning(false);
      clearTimer();
      setCurrentMode(mode);
      setTimeLeft(TIMER_DURATIONS[mode]);
    },
    [clearTimer]
  );

  // clean up on unmount

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    timeLeft,
    currentMode,
    isRunning,
    start,
    reset,
    pause,
    setMode,
  };
};
