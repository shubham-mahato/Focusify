"use client";

import {
  useState,
  memo,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useTimer } from "../hooks/useTimer";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { usePerformanceTracking } from "../hooks/usePerformance";
import {
  formatTime,
  calculateProgress,
  getModeDisplayName,
  getModeDuration,
} from "../lib/timerUtils";
import ModeSelector from "./ModeSelector";
import ProgressCircle from "./ProgressCircle";

// Lazy load heavy components
const TaskPanel = lazy(() => import("./TaskPanel"));
const FocusMode = lazy(() => import("./FocusMode"));
const KeyboardShortcutsHelp = lazy(() => import("./KeyboardShortcutsHelp"));

// Loading fallback component
const ComponentLoader = memo(() => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
  </div>
));
ComponentLoader.displayName = "ComponentLoader";

// Memoized session counter for performance
const SessionCounter = memo<{
  currentCycle: number;
  sessionsCompleted: number;
  cycleProgress: number;
  totalSessions: number;
}>(({ currentCycle, sessionsCompleted, cycleProgress, totalSessions }) => (
  <div className="mb-6 text-center" role="status" aria-live="polite">
    <div className="text-white/80 text-lg font-medium mb-2">
      Cycle {currentCycle} • Session {sessionsCompleted + 1}/4
    </div>
    <div className="w-full max-w-xs mx-auto bg-white/20 rounded-full h-2">
      <div
        className="bg-focus-complete h-2 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${cycleProgress}%` }}
        role="progressbar"
        aria-valuenow={cycleProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Cycle progress: ${Math.round(cycleProgress)}%`}
      />
    </div>
    <div className="text-white/60 text-sm mt-2">
      Total sessions today: {totalSessions}
    </div>
  </div>
));
SessionCounter.displayName = "SessionCounter";

// Memoized timer controls for performance
const TimerControls = memo<{
  isRunning: boolean;
  timeLeft: number;
  onStartPause: () => void;
  onReset: () => void;
  onToggleTasks: () => void;
  onToggleSettings: () => void;
}>(
  ({
    isRunning,
    timeLeft,
    onStartPause,
    onReset,
    onToggleTasks,
    onToggleSettings,
  }) => (
    <div className="control-buttons">
      <button
        className={`glass-button ${
          isRunning ? "bg-focus-pause" : "bg-focus-active"
        } ${timeLeft === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={onStartPause}
        disabled={timeLeft === 0}
        aria-label={isRunning ? "Pause timer" : "Start timer"}
      >
        <span className="flex items-center gap-2">
          {isRunning ? (
            <>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Start
            </>
          )}
        </span>
      </button>

      <button
        className="glass-button"
        onClick={onReset}
        aria-label="Reset timer"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          Reset
        </span>
      </button>

      <button
        className="glass-button"
        onClick={onToggleTasks}
        aria-label="Toggle task panel"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Tasks
        </span>
      </button>

      <button
        className="glass-button"
        onClick={onToggleSettings}
        aria-label="Open settings"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          Settings
        </span>
      </button>
    </div>
  )
);
TimerControls.displayName = "TimerControls";

// Settings panel placeholder component
const SettingsPanel = memo<{
  isOpen: boolean;
  onClose: () => void;
}>(({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-morphism p-6 rounded-xl max-w-md w-full">
        <h2 className="text-white text-xl font-semibold mb-4">Settings</h2>
        <p className="text-white/70 mb-4">
          Settings panel optimized for performance!
        </p>
        <button onClick={onClose} className="w-full glass-button">
          Close
        </button>
      </div>
    </div>
  );
});
SettingsPanel.displayName = "SettingsPanel";

function OptimizedTimer() {
  const [showTasks, setShowTasks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  // Performance monitoring
  usePerformanceTracking("OptimizedTimer");

  // Core timer functionality with destructuring for stable references
  const timer = useTimer();
  const { isRunning, pause, start, reset, setMode, timeLeft, currentMode } =
    timer;

  // Memoized calculations to prevent recalculation
  const { progress, nextSessionNumber } = useMemo(
    () => ({
      totalTime: getModeDuration(currentMode),
      progress: calculateProgress(timeLeft, getModeDuration(currentMode)),
      nextSessionNumber: timer.nextSessionNumber || 1,
    }),
    [currentMode, timeLeft, timer.nextSessionNumber]
  );

  // Optimized callbacks with proper dependencies
  const handleStartPause = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  const handleToggleTasks = useCallback(() => {
    setShowTasks((prev) => !prev);
  }, []);

  const handleToggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  const handleToggleHelp = useCallback(() => {
    setShowHelp((prev) => !prev);
  }, []);

  const handleToggleFocusMode = useCallback(() => {
    setFocusMode((prev) => !prev);
  }, []);

  const handleCloseModals = useCallback(() => {
    setShowTasks(false);
    setShowSettings(false);
    setShowHelp(false);
    setFocusMode(false);
  }, []);

  // Keyboard shortcuts with optimized callbacks
  useKeyboardShortcuts({
    onStartPause: handleStartPause,
    onReset: reset,
    onModeChange: setMode,
    onToggleTaskPanel: handleToggleTasks,
    onToggleSettings: handleToggleSettings,
    onCloseModals: handleCloseModals,
    onShowHelp: handleToggleHelp,
    disabled: focusMode,
  });

  return (
    <>
      <div className="study-layout" id="main-content">
        {/* App Title */}
        <div className="app-title">
          <h1>focusify</h1>
          <div className="text-sm opacity-75 mt-2">
            your productivity companion
          </div>
        </div>

        {/* Memoized Session Counter */}
        <SessionCounter
          currentCycle={timer.currentCycle || 1}
          sessionsCompleted={timer.sessionsCompleted || 0}
          cycleProgress={timer.cycleProgress || 0}
          totalSessions={timer.totalSessions || 0}
        />

        {/* Mode Selection */}
        <ModeSelector
          currentMode={currentMode}
          onModeChange={setMode}
          disabled={isRunning}
        />

        {/* Current Mode Display */}
        <div className="text-center mb-4">
          <div className="text-white/80 text-lg font-medium">
            {getModeDisplayName(currentMode)}
          </div>
          {timer.isOnBreak && (
            <div className="text-white/60 text-sm mt-1">
              Next: Focus Session #{nextSessionNumber}
            </div>
          )}
        </div>

        {/* Timer Display with Progress Circle */}
        <div className="mb-8">
          <ProgressCircle progress={progress} size={300} strokeWidth={8}>
            <div className="text-center">
              <div
                className="timer-display"
                role="timer"
                aria-live="off"
                aria-label={`Timer: ${formatTime(timeLeft)}`}
              >
                {formatTime(timeLeft)}
              </div>
              <div className="text-white/60 text-sm mt-2">
                {isRunning
                  ? "Running..."
                  : timeLeft === 0
                  ? "Session Complete!"
                  : "Ready to start"}
              </div>
            </div>
          </ProgressCircle>
        </div>

        {/* Memoized Timer Controls */}
        <TimerControls
          isRunning={isRunning}
          timeLeft={timeLeft}
          onStartPause={handleStartPause}
          onReset={reset}
          onToggleTasks={handleToggleTasks}
          onToggleSettings={handleToggleSettings}
        />

        {/* Focus Mode Toggle */}
        <div className="mt-4 text-center">
          <button
            onClick={handleToggleFocusMode}
            className="glass-button text-sm"
          >
            {focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
          </button>
        </div>

        {/* Keyboard Shortcuts Help Link */}
        <div className="mt-4 text-center">
          <button
            onClick={handleToggleHelp}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Keyboard Shortcuts (H)
          </button>
        </div>
      </div>

      {/* Lazy Loaded Components with Suspense */}
      {showTasks && (
        <div className="fixed inset-x-4 bottom-4 max-w-md mx-auto z-40">
          <Suspense fallback={<ComponentLoader />}>
            <TaskPanel
              isVisible={showTasks}
              onClose={() => setShowTasks(false)}
            />
          </Suspense>
        </div>
      )}

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <Suspense fallback={<ComponentLoader />}>
        <KeyboardShortcutsHelp
          isVisible={showHelp}
          onClose={() => setShowHelp(false)}
        />
      </Suspense>

      <Suspense fallback={<ComponentLoader />}>
        <FocusMode
          isActive={focusMode}
          timeLeft={timeLeft}
          isRunning={isRunning}
          currentMode={currentMode}
          onStartPause={handleStartPause}
          onExitFocusMode={() => setFocusMode(false)}
        />
      </Suspense>
    </>
  );
}

export default memo(OptimizedTimer);
