//  lib/timerUtils.ts

// Format seconds into MM:SS

export const formatTimer = (seconds: number): string => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec
    .toString()
    .padStart(2, "0")}`;
};
 
export const formatReadableTimer = (seconds: number): string => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  if (min === 0) {
    return `${sec}${sec === 0 ? "second" : "seconds"}`;
  }
  if (sec === 0) {
    return `${min} ${min === 1 ? "minute" : "minutes"}`;
  }

  return `${min}m ${sec}s`;
};

// Calculate Progress Percentage
export const calculateProgress = (
  timeLeft: number,
  totalTime: number
): number => {
  if (totalTime === 0) return 0;
  const elapsed = totalTime - timeLeft;
  return Math.round((elapsed / totalTime) * 100);
};

//Get color based on timer mode

export const getModeColor = (
  mode: "focus" | "short-break" | "long-break"
): string => {
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

export const getModeDisplayName = (
  mode: "focus" | "short-break" | "long-break"
): string => {
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

// Get mode time duration

export const getModeDuration = (
  mode: "focus" | "short-duration" | "long-duration"
): number => {
  switch (mode) {
    case "focus":
      return 25 * 60;
    case "short-duration":
      return 5 * 60;
    case "long-duration":
      return 15 * 60;
    default:
      return 25 * 60;
  }
};
