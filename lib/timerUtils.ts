import { TimerMode, TIMER_DURATIONS } from "../types/timer";

// Format seconds into MM:SS format
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// Format seconds into a more readable format (e.g., "25 minutes")
export const formatReadableTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) {
    return `${secs} ${secs === 1 ? "second" : "seconds"}`;
  }

  if (secs === 0) {
    return `${mins} ${mins === 1 ? "minute" : "minutes"}`;
  }

  return `${mins}m ${secs}s`;
};

// Calculate progress percentage (0-100)
export const calculateProgress = (
  timeLeft: number,
  totalTime: number
): number => {
  if (totalTime === 0) return 0;
  const elapsed = totalTime - timeLeft;
  return Math.round((elapsed / totalTime) * 100);
};

// Get color based on timer mode
export const getModeColor = (mode: TimerMode): string => {
  switch (mode) {
    case "focus":
      return "text-focus-active";
    case "short-break":
      return "text-focus-break";
    case "long-break":
      return "text-focus-complete";
    default:
      return "text-white";
  }
};

// Get mode display name
export const getModeDisplayName = (mode: TimerMode): string => {
  switch (mode) {
    case "focus":
      return "Focus Time";
    case "short-break":
      return "Short Break";
    case "long-break":
      return "Long Break";
    default:
      return "Timer";
  }
};

// Get mode duration in seconds
export const getModeDuration = (mode: TimerMode): number => {
  return TIMER_DURATIONS[mode];
};
