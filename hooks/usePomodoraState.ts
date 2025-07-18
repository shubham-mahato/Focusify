import { useReducer, useCallback } from "react";
import { TimerMode } from "../types/timer";
import {
  PomodoroState,
  PomodoroSettings,
  CycleAction,
  NextSession,
  SessionCompletionEvent,
  DEFAULT_POMODORO_SETTINGS,
  SESSION_MESSAGES,
} from "../types/pomodoro";
// Initial state
const initialState: PomodoroState = {
  sessionsCompleted: 0,
  currentCycle: 1,
  totalSessions: 0,
  isOnBreak: false,
  cycleCompleted: false,
};

// Reducer for pomodoro state
function pomodoroReducer(
  state: PomodoroState,
  action: CycleAction
): PomodoroState {
  switch (action.type) {
    case "SESSION_COMPLETED":
      const { mode } = action.payload;

      if (mode === "focus") {
        const newSessionsCompleted = state.sessionsCompleted + 1;
        const cycleCompleted = newSessionsCompleted >= 4;

        return {
          ...state,
          sessionsCompleted: cycleCompleted ? 0 : newSessionsCompleted,
          currentCycle: cycleCompleted
            ? state.currentCycle + 1
            : state.currentCycle,
          totalSessions: state.totalSessions + 1,
          isOnBreak: true,
          cycleCompleted,
        };
      }

      if (mode === "short-break" || mode === "long-break") {
        return {
          ...state,
          isOnBreak: false,
          cycleCompleted: false,
        };
      }

      return state;

    case "CYCLE_RESET":
      return initialState;

    case "NEW_DAY":
      return {
        ...initialState,
        currentCycle: 1,
        totalSessions: 0,
      };

    case "MANUAL_MODE_CHANGE":
      // When user manually changes mode, update break status
      const { mode: newMode } = action.payload;
      return {
        ...state,
        isOnBreak: newMode === "short-break" || newMode === "long-break",
        cycleCompleted: false,
      };

    default:
      return state;
  }
}

// Hook for managing pomodoro state
export function usePomodoroState(
  settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS
) {
  const [state, dispatch] = useReducer(pomodoroReducer, initialState);

  // Calculate next session
  const getNextSession = useCallback(
    (currentMode: TimerMode): NextSession => {
      const { sessionsCompleted, currentCycle } = state;

      if (currentMode === "focus") {
        const willCompleteCycle =
          sessionsCompleted + 1 >= settings.sessionsPerCycle;
        const nextMode = willCompleteCycle ? "long-break" : "short-break";
        const sessionNumber = sessionsCompleted + 1;

        return {
          mode: nextMode,
          sessionNumber,
          cycleNumber: currentCycle,
          isNewCycle: willCompleteCycle,
          message: willCompleteCycle
            ? SESSION_MESSAGES.CYCLE_COMPLETED
            : SESSION_MESSAGES.FOCUS_COMPLETED,
        };
      }

      if (currentMode === "short-break") {
        return {
          mode: "focus",
          sessionNumber: sessionsCompleted + 1,
          cycleNumber: currentCycle,
          isNewCycle: false,
          message: SESSION_MESSAGES.SHORT_BREAK_COMPLETED,
        };
      }

      if (currentMode === "long-break") {
        return {
          mode: "focus",
          sessionNumber: 1,
          cycleNumber: currentCycle,
          isNewCycle: true,
          message: SESSION_MESSAGES.LONG_BREAK_COMPLETED,
        };
      }

      return {
        mode: "focus",
        sessionNumber: 1,
        cycleNumber: 1,
        isNewCycle: false,
        message: "Let's start focusing!",
      };
    },
    [state, settings.sessionsPerCycle]
  );

  // Complete current session
  const completeSession = useCallback(
    (mode: TimerMode): SessionCompletionEvent => {
      const nextSession = getNextSession(mode);

      dispatch({ type: "SESSION_COMPLETED", payload: { mode } });

      return {
        completedMode: mode,
        nextMode: nextSession.mode,
        sessionNumber: nextSession.sessionNumber,
        cycleNumber: nextSession.cycleNumber,
        isNewCycle: nextSession.isNewCycle,
        totalSessionsToday:
          mode === "focus" ? state.totalSessions + 1 : state.totalSessions,
      };
    },
    [getNextSession, state.totalSessions]
  );

  // Reset cycle
  const resetCycle = useCallback(() => {
    dispatch({ type: "CYCLE_RESET" });
  }, []);

  // Handle manual mode change
  const handleModeChange = useCallback((mode: TimerMode) => {
    dispatch({ type: "MANUAL_MODE_CHANGE", payload: { mode } });
  }, []);

  // New day reset (could be called at midnight)
  const newDay = useCallback(() => {
    dispatch({ type: "NEW_DAY" });
  }, []);

  // Progress calculations
  const cycleProgress =
    (state.sessionsCompleted / settings.sessionsPerCycle) * 100;
  const nextSessionNumber = state.isOnBreak
    ? state.sessionsCompleted + 1
    : state.sessionsCompleted + 1;

  return {
    // State
    ...state,

    // Actions
    completeSession,
    resetCycle,
    handleModeChange,
    newDay,

    // Computed values
    cycleProgress,
    nextSessionNumber,
    getNextSession,

    // Settings
    settings,
  };
}
