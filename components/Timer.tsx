import { useState, useEffect } from "react";
import { useTimer } from "../hooks/useTimer";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import {
  formatTime,
  calculateProgress,
  getModeDisplayName,
  getModeDuration,
} from "../lib/timerUtils";
import ModeSelector from "./ModeSelector";
import ProgressCircle from "./ProgressCircle";
import TaskPanel from "./TaskPanel";
import FocusMode from "./FocusMode";
import KeyboardShortcutsHelp from "./KeyboardShortcutsHelp";

export default function Timer() {
  const [showTasks, setShowTasks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  // Core timer functionality
  const timer = useTimer();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onStartPause: timer.isRunning ? timer.pause : timer.start,
    onReset: timer.reset,
    onModeChange: timer.setMode,
    onToggleTaskPanel: () => setShowTasks(!showTasks),
    onToggleSettings: () => setShowSettings(!showSettings),
    onCloseModals: () => {
      setShowTasks(false);
      setShowSettings(false);
      setShowHelp(false);
      setFocusMode(false);
    },
    onShowHelp: () => setShowHelp(true),
    disabled: focusMode, // Disable shortcuts in focus mode except Escape
  });

  const totalTime = getModeDuration(timer.currentMode);
  const progress = calculateProgress(timer.timeLeft, totalTime);

  // Auto-enter focus mode when timer starts (optional)
  useEffect(() => {
    if (timer.isRunning && timer.currentMode === "focus") {
      // Auto-enter focus mode for focus sessions (can be made configurable)
      // setFocusMode(true);
    }
  }, [timer.isRunning, timer.currentMode]);

  return (
    <>
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="study-layout" id="main-content">
        {/* App Title */}
        <div className="app-title">
          <h1>focusify</h1>
          <div className="text-sm opacity-75 mt-2">
            your productivity companion
          </div>
        </div>

        {/* Session Counter */}
        <div className="mb-6 text-center" role="status" aria-live="polite">
          <div className="text-white/80 text-lg font-medium mb-2">
            Cycle {timer.currentCycle || 1} • Session{" "}
            {(timer.sessionsCompleted || 0) + 1}/4
          </div>
          <div className="w-full max-w-xs mx-auto bg-white/20 rounded-full h-2">
            <div
              className="bg-focus-complete h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${timer.cycleProgress || 0}%` }}
              role="progressbar"
              aria-valuenow={timer.cycleProgress || 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Cycle progress: ${Math.round(
                timer.cycleProgress || 0
              )}%`}
            />
          </div>
          <div className="text-white/60 text-sm mt-2">
            Total sessions today: {timer.totalSessions || 0}
          </div>
        </div>

        {/* Mode Selection */}
        <ModeSelector
          currentMode={timer.currentMode}
          onModeChange={timer.setMode}
          disabled={timer.isRunning}
        />

        {/* Current Mode Display */}
        <div className="text-center mb-4">
          <div className="text-white/80 text-lg font-medium">
            {getModeDisplayName(timer.currentMode)}
          </div>
          {timer.isOnBreak && (
            <div className="text-white/60 text-sm mt-1">
              Next: Focus Session #{timer.nextSessionNumber || 1}
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
                aria-label={`Timer: ${formatTime(timer.timeLeft)}`}
              >
                {formatTime(timer.timeLeft)}
              </div>
              <div className="text-white/60 text-sm mt-2">
                {timer.isRunning
                  ? "Running..."
                  : timer.timeLeft === 0
                  ? "Session Complete!"
                  : "Ready to start"}
              </div>
            </div>
          </ProgressCircle>
        </div>

        {/* Timer Controls */}
        <div className="control-buttons">
          <button
            className={`glass-button ${
              timer.isRunning ? "bg-focus-pause" : "bg-focus-active"
            } ${timer.timeLeft === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={timer.isRunning ? timer.pause : timer.start}
            disabled={timer.timeLeft === 0}
            aria-label={timer.isRunning ? "Pause timer" : "Start timer"}
          >
            <span className="flex items-center gap-2">
              {timer.isRunning ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
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
            onClick={timer.reset}
            aria-label="Reset timer"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
            onClick={() => setShowTasks(!showTasks)}
            aria-label="Toggle task panel"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Open settings"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Focus Mode Toggle */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setFocusMode(!focusMode)}
            className="glass-button text-sm"
            aria-describedby="focus-mode-description"
          >
            {focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
          </button>
          <div id="focus-mode-description" className="sr-only">
            Focus mode provides a distraction-free full-screen timer interface
          </div>
        </div>

        {/* Keyboard Shortcuts Help Link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowHelp(true)}
            className="text-white/60 hover:text-white text-sm transition-colors"
            aria-describedby="shortcuts-help-description"
          >
            Keyboard Shortcuts (H)
          </button>
          <div id="shortcuts-help-description" className="sr-only">
            View available keyboard shortcuts for efficient navigation
          </div>
        </div>

        {/* Session Info */}
        <div className="mt-8 glass-morphism p-6 rounded-lg max-w-md mx-auto">
          <h2 className="text-white font-semibold mb-4">Session Info</h2>
          <div className="space-y-2 text-white/70">
            <div className="flex justify-between">
              <span>Current Mode:</span>
              <span className="font-medium">
                {getModeDisplayName(timer.currentMode)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Progress:</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span
                className={`font-medium ${
                  timer.timeLeft === 0
                    ? "text-focus-complete"
                    : timer.isRunning
                    ? "text-focus-active"
                    : "text-focus-pause"
                }`}
              >
                {timer.timeLeft === 0
                  ? "Completed"
                  : timer.isRunning
                  ? "Running"
                  : "Paused"}
              </span>
            </div>
          </div>

          {timer.resetCycle && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <button
                onClick={timer.resetCycle}
                className="w-full glass-button text-sm"
                disabled={timer.isRunning}
              >
                Reset Cycle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Panel */}
      {showTasks && (
        <div className="fixed inset-x-4 bottom-4 max-w-md mx-auto z-40">
          <TaskPanel
            isVisible={showTasks}
            onClose={() => setShowTasks(false)}
          />
        </div>
      )}

      {/* Settings Panel Placeholder */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-morphism p-6 rounded-xl max-w-md w-full">
            <h2 className="text-white text-xl font-semibold mb-4">Settings</h2>
            <p className="text-white/70 mb-4">
              Settings panel will be enhanced later!
            </p>
            <button
              onClick={() => setShowSettings(false)}
              className="w-full glass-button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isVisible={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Focus Mode */}
      <FocusMode
        isActive={focusMode}
        timeLeft={timer.timeLeft}
        isRunning={timer.isRunning}
        currentMode={timer.currentMode}
        onStartPause={timer.isRunning ? timer.pause : timer.start}
        onExitFocusMode={() => setFocusMode(false)}
      />
    </>
  );
}
