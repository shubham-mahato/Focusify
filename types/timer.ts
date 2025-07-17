// Timer modes - single source of truth
export type TimerMode = "focus" | "short-break" | "long-break";

// Timer durations in seconds
export const TIMER_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60, // 25 minutes
  "short-break": 5 * 60, // 5 minutes
  "long-break": 15 * 60, // 15 minutes
} as const;

// Timer state interface
export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  currentMode: TimerMode;
}

// Timer controls interface
export interface TimerControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: TimerMode) => void;
}

// Complete timer hook return type
export interface UseTimerReturn extends TimerState, TimerControls {}

// Mode configuration for UI
export interface ModeConfig {
  key: TimerMode;
  label: string;
  duration: string;
  description: string;
}

export const MODE_CONFIGS: ModeConfig[] = [
  {
    key: "focus",
    label: "Focus",
    duration: "25min",
    description: "Deep work session",
  },
  {
    key: "short-break",
    label: "Short Break",
    duration: "5min",
    description: "Quick rest",
  },
  {
    key: "long-break",
    label: "Long Break",
    duration: "15min",
    description: "Extended rest",
  },
];
