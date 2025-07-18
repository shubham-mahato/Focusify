import { TimerMode } from "./timer";

// Pomodoro cycle state
export interface PomodoroState {
  sessionsCompleted: number; // Completed focus sessions in current cycle
  currentCycle: number; // Current cycle number (1, 2, 3, ...)
  totalSessions: number; // Total focus sessions completed today
  isOnBreak: boolean; // Currently on break vs focus
  cycleCompleted: boolean; // Just completed a full cycle (4 sessions + long break)
}

// Pomodoro settings
export interface PomodoroSettings {
  sessionsPerCycle: number; // Default: 4 focus sessions per cycle
  autoStartNext: boolean; // Auto-start next session after break
  autoStartBreaks: boolean; // Auto-start breaks after focus
  longBreakAfter: number; // Long break after N sessions (default: 4)
}

// Session completion event
export interface SessionCompletionEvent {
  completedMode: TimerMode;
  nextMode: TimerMode;
  sessionNumber: number;
  cycleNumber: number;
  isNewCycle: boolean;
  totalSessionsToday: number;
}

// Cycle actions
export type CycleAction =
  | { type: "SESSION_COMPLETED"; payload: { mode: TimerMode } }
  | { type: "CYCLE_RESET" }
  | { type: "SETTINGS_UPDATED"; payload: Partial<PomodoroSettings> }
  | { type: "NEW_DAY" }
  | { type: "MANUAL_MODE_CHANGE"; payload: { mode: TimerMode } };

// Next session calculation
export interface NextSession {
  mode: TimerMode;
  sessionNumber: number;
  cycleNumber: number;
  isNewCycle: boolean;
  message: string;
}

// Default settings
export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  sessionsPerCycle: 4,
  autoStartNext: false,
  autoStartBreaks: false,
  longBreakAfter: 4,
};

// Session messages
export const SESSION_MESSAGES = {
  FOCUS_COMPLETED: "Great focus session! Time for a break.",
  SHORT_BREAK_COMPLETED: "Break over! Ready for another focus session?",
  LONG_BREAK_COMPLETED: "Long break finished! Starting a new cycle.",
  CYCLE_COMPLETED: "Cycle complete! You've earned a long break.",
} as const;
