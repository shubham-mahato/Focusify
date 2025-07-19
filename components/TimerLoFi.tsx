"use client";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";

// --- FONT & CSS STYLES ---
// We'll inject these directly for this self-contained preview.
// In a real app, you'd add the font to your layout and CSS to globals.css.
const LofiThemeStyles = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="true"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <style>{`
      .font-plex-mono {
        font-family: 'IBM Plex Mono', monospace;
      }
      .scanline-overlay::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(
          rgba(18, 16, 16, 0) 50%,
          rgba(0, 0, 0, 0.25) 50%
        ), linear-gradient(
          90deg,
          rgba(255, 0, 0, 0.06),
          rgba(0, 255, 0, 0.02),
          rgba(0, 0, 255, 0.06)
        );
        background-size: 100% 4px, 3px 100%;
        pointer-events: none;
        animation: scanline-animation 0.2s linear infinite;
        opacity: 0.2;
      }
      @keyframes scanline-animation {
        0% { background-position: 0 0; }
        100% { background-position: 0 4px; }
      }
    `}</style>
  </>
);

// --- TYPE DEFINITIONS (from your project files) ---
export type TimerMode = "focus" | "short-break" | "long-break";
export const TIMER_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  "short-break": 5 * 60,
  "long-break": 15 * 60,
};
export interface ModeConfig {
  key: TimerMode;
  label: string;
}
export const MODE_CONFIGS: ModeConfig[] = [
  { key: "focus", label: "FOCUS" },
  { key: "short-break", label: "SHORT BREAK" },
  { key: "long-break", label: "LONG BREAK" },
];
export interface NextSession {
  mode: TimerMode;
  sessionNumber: number;
  cycleNumber: number;
}

// --- UTILITY FUNCTIONS (from timerUtils.ts) ---
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};
export const calculateProgress = (
  timeLeft: number,
  totalTime: number
): number => {
  if (totalTime === 0) return 0;
  return Math.round(((totalTime - timeLeft) / totalTime) * 100);
};
export const getModeDisplayName = (mode: TimerMode): string =>
  MODE_CONFIGS.find((c) => c.key === mode)?.label || "TIMER";
export const getModeDuration = (mode: TimerMode): number =>
  TIMER_DURATIONS[mode];

// --- HOOKS (from your project files, self-contained) ---
const usePomodoroState = () => {
  const [state, setState] = useState({
    sessionsCompleted: 0,
    currentCycle: 1,
    totalSessions: 0,
    isOnBreak: false,
  });
  const completeSession = useCallback((completedMode: TimerMode) => {
    if (completedMode === "focus") {
      setState((s) => {
        const newSessionsCompleted = s.sessionsCompleted + 1;
        if (newSessionsCompleted >= 4) {
          return {
            ...s,
            sessionsCompleted: 0,
            currentCycle: s.currentCycle + 1,
            isOnBreak: true,
          };
        }
        return {
          ...s,
          sessionsCompleted: newSessionsCompleted,
          isOnBreak: true,
        };
      });
    } else {
      setState((s) => ({ ...s, isOnBreak: false }));
    }
  }, []);
  const getNextSession = useCallback(
    (currentMode: TimerMode): NextSession => {
      if (currentMode === "focus") {
        const isLongBreak =
          (state.sessionsCompleted + 1) % 4 === 0 &&
          state.sessionsCompleted !== 0;
        return {
          mode: isLongBreak ? "long-break" : "short-break",
          sessionNumber: state.sessionsCompleted + 1,
          cycleNumber: state.currentCycle,
        };
      }
      return {
        mode: "focus",
        sessionNumber: state.sessionsCompleted + 1,
        cycleNumber: state.currentCycle,
      };
    },
    [state.sessionsCompleted, state.currentCycle]
  );
  const resetCycle = useCallback(
    () => setState((s) => ({ ...s, sessionsCompleted: 0, currentCycle: 1 })),
    []
  );
  const handleModeChange = useCallback(
    (mode: TimerMode) =>
      setState((s) => ({ ...s, isOnBreak: mode !== "focus" })),
    []
  );
  return {
    ...state,
    nextSessionNumber: state.sessionsCompleted + 1,
    completeSession,
    getNextSession,
    resetCycle,
    handleModeChange,
  };
};

export const useTimer = (initialMode: TimerMode = "focus") => {
  const [currentMode, setCurrentMode] = useState<TimerMode>(initialMode);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[initialMode]);
  const [isRunning, setIsRunning] = useState(false);
  const pomodoroState = usePomodoroState();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);
  const start = useCallback(() => {
    if (isRunning || timeLeft <= 0) return;
    setIsRunning(true);
    intervalRef.current = setInterval(
      () =>
        setTimeLeft((prev) =>
          prev <= 1 ? (handleSessionComplete(), 0) : prev - 1
        ),
      1000
    );
  }, [isRunning, timeLeft]);
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    clearTimer();
    const nextSession = pomodoroState.getNextSession(currentMode);
    pomodoroState.completeSession(currentMode);
    setCurrentMode(nextSession.mode);
    setTimeLeft(TIMER_DURATIONS[nextSession.mode]);
  }, [currentMode, pomodoroState, clearTimer]);
  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);
  const reset = useCallback(() => {
    setIsRunning(false);
    clearTimer();
    setTimeLeft(TIMER_DURATIONS[currentMode]);
  }, [clearTimer, currentMode]);
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
  useEffect(() => () => clearTimer(), [clearTimer]);
  return {
    timeLeft,
    isRunning,
    currentMode,
    start,
    pause,
    reset,
    setMode,
    ...pomodoroState,
  };
};

// --- UI COMPONENTS (THEMED) ---

const SegmentedProgressBar = ({
  progress,
  mode,
}: {
  progress: number;
  mode: TimerMode;
}) => {
  const totalSegments = 30;
  const activeSegments = Math.round((progress / 100) * totalSegments);
  const theme = {
    focus: "bg-amber-500",
    "short-break": "bg-cyan-500",
    "long-break": "bg-purple-500",
  };

  return (
    <div className="flex w-full gap-1.5 p-2 bg-black/30 border border-white/10 rounded-md">
      {Array.from({ length: totalSegments }).map((_, i) => (
        <div
          key={i}
          className={`h-6 w-full rounded-sm transition-colors duration-300 ${
            i < activeSegments ? theme[mode] : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
};

const LofiButton = ({
  onClick,
  children,
  className = "",
  disabled = false,
  ariaLabel,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={`font-plex-mono uppercase font-bold text-sm tracking-wider px-6 py-3 border-b-4 rounded-md transition-all duration-150
            transform active:translate-y-0.5 active:border-b-2 disabled:opacity-50 disabled:cursor-not-allowed
            ${className}`}
  >
    {children}
  </button>
);

// --- MAIN EXPORTED COMPONENT ---

export default function PomodoroTimer() {
  const timer = useTimer("focus");
  const totalTime = useMemo(
    () => getModeDuration(timer.currentMode),
    [timer.currentMode]
  );
  const progress = useMemo(
    () => calculateProgress(timer.timeLeft, totalTime),
    [timer.timeLeft, totalTime]
  );

  const theme = {
    focus: {
      bg: "bg-[#282c34]",
      text: "text-amber-400",
      button: "bg-amber-600 text-white border-amber-800 hover:bg-amber-500",
      modeSelector: "bg-amber-600/80",
    },
    "short-break": {
      bg: "bg-[#282c34]",
      text: "text-cyan-400",
      button: "bg-cyan-600 text-white border-cyan-800 hover:bg-cyan-500",
      modeSelector: "bg-cyan-600/80",
    },
    "long-break": {
      bg: "bg-[#282c34]",
      text: "text-purple-400",
      button: "bg-purple-600 text-white border-purple-800 hover:bg-purple-500",
      modeSelector: "bg-purple-600/80",
    },
  };
  const currentTheme = theme[timer.currentMode];

  return (
    <>
      <LofiThemeStyles />
      <div
        className={`min-h-screen w-full flex flex-col items-center justify-center p-4 font-plex-mono text-[#e6e6e6] transition-colors duration-500 ${currentTheme.bg}`}
      >
        <div className="absolute inset-0 scanline-overlay"></div>

        <header className="absolute top-5 flex items-center justify-center w-full">
          <div className="flex items-center p-1.5 bg-black/30 border border-white/10 rounded-md space-x-2">
            {MODE_CONFIGS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => timer.setMode(key)}
                disabled={timer.isRunning}
                className={`px-4 py-1.5 text-xs rounded-sm transition-colors duration-200 disabled:opacity-50
                            ${
                              timer.currentMode === key
                                ? `${currentTheme.modeSelector} text-white`
                                : "text-white/60 hover:bg-white/10"
                            }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <main className="z-10 flex flex-col items-center justify-center text-center gap-6 w-full max-w-lg">
          <div className="flex flex-col items-center">
            <h1
              className={`text-8xl font-bold ${currentTheme.text} transition-colors duration-500`}
            >
              {formatTime(timer.timeLeft)}
            </h1>
            <p className="text-white/60 text-sm tracking-widest">
              CYCLE {timer.currentCycle} &bull; SESSION{" "}
              {timer.sessionsCompleted + 1}/4
            </p>
          </div>

          <SegmentedProgressBar progress={progress} mode={timer.currentMode} />

          <div className="flex items-center gap-4">
            <LofiButton
              onClick={timer.isRunning ? timer.pause : timer.start}
              className={currentTheme.button}
              ariaLabel={timer.isRunning ? "Pause timer" : "Start timer"}
            >
              {timer.isRunning ? "Pause" : "Start"}
            </LofiButton>
            <LofiButton
              onClick={timer.reset}
              disabled={timer.isRunning}
              className="bg-black/30 text-white/70 border-black/50 hover:bg-black/40"
              ariaLabel="Reset timer"
            >
              Reset
            </LofiButton>
          </div>
        </main>

        <footer className="absolute bottom-5 text-center text-xs text-white/40 tracking-widest">
          <p>focusify // lofi edition</p>
        </footer>
      </div>
    </>
  );
}
