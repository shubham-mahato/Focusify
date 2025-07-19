"use client";

import { useState, useCallback, useMemo } from "react";
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

// SVG Icons for the new design
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.82l-.15-.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.82l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TasksIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const HelpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const ResetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const FocusModeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="m12 1 1.5 2.5L16 2l-1.5 2.5L16 7l-2.5-1.5L12 8l-1.5-2.5L8 7l1.5-2.5L8 2l2.5 1.5L12 1z" />
  </svg>
);

export default function Timer() {
  const [showTasks, setShowTasks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  // Core timer functionality with destructuring for stable references
  const timer = useTimer();
  const { isRunning, pause, start, reset, setMode, timeLeft, currentMode } =
    timer;

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

  // Memoized calculations
  const totalTime = useMemo(() => getModeDuration(currentMode), [currentMode]);
  const progress = useMemo(
    () => calculateProgress(timeLeft, totalTime),
    [timeLeft, totalTime]
  );

  // Dynamic theme colors based on current mode
  const themeColors = {
    focus: {
      bg: "from-slate-900 to-teal-900/50",
      accent: "text-teal-400",
      button: "bg-teal-600 hover:bg-teal-500",
      border: "border-teal-500/30",
    },
    "short-break": {
      bg: "from-slate-900 to-green-900/50",
      accent: "text-green-400",
      button: "bg-green-600 hover:bg-green-500",
      border: "border-green-500/30",
    },
    "long-break": {
      bg: "from-slate-900 to-blue-900/50",
      accent: "text-blue-400",
      button: "bg-blue-600 hover:bg-blue-500",
      border: "border-blue-500/30",
    },
  };

  const currentTheme = themeColors[currentMode as keyof typeof themeColors];

  return (
    <>
      <div
        className={`min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br ${currentTheme.bg} text-white font-sans transition-all duration-700`}
      >
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center w-full max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              focusify
            </h1>
            <div className="hidden sm:block text-sm text-white/60">
              your productivity companion
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleTasks}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 transform hover:scale-110"
              aria-label="Toggle tasks"
            >
              <TasksIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleToggleFocusMode}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 transform hover:scale-110"
              aria-label="Toggle focus mode"
            >
              <FocusModeIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleToggleSettings}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 transform hover:scale-110"
              aria-label="Open settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleToggleHelp}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 transform hover:scale-110"
              aria-label="Show help"
            >
              <HelpIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex items-center justify-center w-full max-w-7xl mx-auto gap-12">
          {/* Left Side - Session Info */}
          <div className="hidden lg:flex flex-col space-y-6 w-80">
            {/* Session Counter */}
            <div className="glass-morphism p-6 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
              <h2 className="text-white font-semibold mb-4">
                Session Progress
              </h2>
              <div
                className="text-center mb-4"
                role="status"
                aria-live="polite"
              >
                <div className="text-white/80 text-lg font-medium mb-3">
                  Cycle {timer.currentCycle || 1} • Session{" "}
                  {(timer.sessionsCompleted || 0) + 1}/4
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                  <div
                    className="bg-teal-400 h-3 rounded-full transition-all duration-1000 ease-out"
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
                <div className="text-white/60 text-sm">
                  Total sessions today: {timer.totalSessions || 0}
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="glass-morphism p-6 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
              <h2 className="text-white font-semibold mb-4">Session Details</h2>
              <div className="space-y-3 text-white/70">
                <div className="flex justify-between">
                  <span>Current Mode:</span>
                  <span className={`font-medium ${currentTheme.accent}`}>
                    {getModeDisplayName(currentMode)}
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
                      timeLeft === 0
                        ? "text-green-400"
                        : isRunning
                        ? currentTheme.accent
                        : "text-yellow-400"
                    }`}
                  >
                    {timeLeft === 0
                      ? "Completed"
                      : isRunning
                      ? "Running"
                      : "Paused"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Left:</span>
                  <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
              </div>

              {timer.resetCycle && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <button
                    onClick={timer.resetCycle}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                    disabled={isRunning}
                  >
                    Reset Cycle
                  </button>
                </div>
              )}
            </div>

            {/* Break indicator */}
            {timer.isOnBreak && (
              <div
                className={`p-4 bg-black/20 rounded-lg border ${currentTheme.border} backdrop-blur-sm`}
              >
                <div className="text-white/80 text-sm font-medium">
                  🎯 Next: Focus Session #{timer.nextSessionNumber || 1}
                </div>
              </div>
            )}

            {/* Auto-start indicator */}
            {timer.autoStartNext && (
              <div
                className={`p-4 bg-black/20 rounded-lg border ${currentTheme.border} backdrop-blur-sm`}
              >
                <div className="text-white/80 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Auto-start enabled
                </div>
              </div>
            )}
          </div>

          {/* Center - Timer */}
          <div className="flex flex-col items-center justify-center text-center gap-8">
            {/* Timer Circle - Debug version */}
            <div className="relative">
              {/* Debug info above circle */}
              <div className="mb-4 text-center text-white">
                <div>DEBUG - Timer Value: {timeLeft}</div>
                <div>DEBUG - Formatted: {formatTime(timeLeft)}</div>
                <div>DEBUG - Running: {isRunning ? "YES" : "NO"}</div>
                <div>DEBUG - Mode: {currentMode}</div>
              </div>

              <ProgressCircle progress={progress} size={340} strokeWidth={12}>
                {/* Simple, guaranteed visible content */}
                <div className="text-center p-4">
                  {/* Large timer - should be impossible to miss */}
                  <div
                    className="text-6xl font-bold text-white bg-black/50 px-4 py-2 rounded"
                    style={{
                      border: "2px solid red", // Red border to make it obvious
                      textShadow: "2px 2px 4px rgba(0,0,0,1)",
                    }}
                  >
                    {formatTime(timeLeft)}
                  </div>

                  {/* Mode name */}
                  <div
                    className={`text-lg font-semibold ${currentTheme.accent} mt-2`}
                  >
                    {getModeDisplayName(currentMode)}
                  </div>

                  {/* Status */}
                  <div className="text-sm text-white/70 mt-1">
                    {isRunning
                      ? "Running"
                      : timeLeft === 0
                      ? "Complete!"
                      : "Ready"}
                  </div>
                </div>
              </ProgressCircle>
            </div>

            {/* Mode Selector */}
            <ModeSelector
              currentMode={currentMode}
              onModeChange={setMode}
              disabled={isRunning}
            />

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button
                onClick={reset}
                aria-label="Reset timer"
                className="p-4 bg-black/20 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isRunning}
              >
                <ResetIcon className="w-6 h-6" />
              </button>
              <button
                onClick={handleStartPause}
                aria-label={isRunning ? "Pause timer" : "Start timer"}
                disabled={timeLeft === 0}
                className={`w-52 h-16 rounded-full text-xl font-bold uppercase tracking-wider shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 ${currentTheme.button} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {isRunning ? (
                  <PauseIcon className="w-7 h-7" />
                ) : (
                  <PlayIcon className="w-7 h-7" />
                )}
                <span>
                  {isRunning ? "Pause" : timeLeft === 0 ? "Complete!" : "Start"}
                </span>
              </button>
              <div className="w-16 h-16"></div> {/* Spacer for balance */}
            </div>
          </div>

          {/* Right Side - Additional Info (for larger screens) */}
          <div className="hidden xl:flex flex-col space-y-6 w-80">
            {/* Quick Stats */}
            <div className="glass-morphism p-6 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
              <h2 className="text-white font-semibold mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className={`text-2xl font-bold ${currentTheme.accent}`}>
                    {timer.currentCycle || 1}
                  </div>
                  <div className="text-xs text-white/60">Current Cycle</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {(timer.sessionsCompleted || 0) + 1}
                  </div>
                  <div className="text-xs text-white/60">Session of 4</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {timer.totalSessions || 0}
                  </div>
                  <div className="text-xs text-white/60">Total Today</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {progress}%
                  </div>
                  <div className="text-xs text-white/60">Progress</div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="glass-morphism p-6 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
              <h2 className="text-white font-semibold mb-4">💡 Tips</h2>
              <div className="space-y-3 text-sm text-white/70">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Use{" "}
                    <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">
                      Space
                    </kbd>{" "}
                    to start/pause
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Press{" "}
                    <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">
                      1-3
                    </kbd>{" "}
                    to switch modes
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Try{" "}
                    <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">
                      T
                    </kbd>{" "}
                    for tasks panel
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Session Info */}
        <div className="lg:hidden fixed bottom-6 left-4 right-4">
          <div className="glass-morphism p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10">
            <div className="flex justify-between items-center text-sm">
              <div className="text-white/80">
                Cycle {timer.currentCycle || 1} • Session{" "}
                {(timer.sessionsCompleted || 0) + 1}/4
              </div>
              <div className="text-white/60">
                {timer.totalSessions || 0} total today
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div
                className="bg-teal-400 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${timer.cycleProgress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task Panel - Use existing component */}
      {showTasks && (
        <div className="fixed inset-x-4 bottom-4 max-w-md mx-auto z-40">
          <TaskPanel
            isVisible={showTasks}
            onClose={() => setShowTasks(false)}
          />
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-slate-800/90 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-md border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-white/10">
                <div>
                  <label htmlFor="autoStart" className="font-medium text-white">
                    Auto-start next session
                  </label>
                  <p className="text-sm text-white/60">
                    Automatically start after completion
                  </p>
                </div>
                <button
                  id="autoStart"
                  role="switch"
                  aria-checked={timer.autoStartNext}
                  onClick={() => timer.setAutoStartNext(!timer.autoStartNext)}
                  className={`${
                    timer.autoStartNext
                      ? currentTheme.button.split(" ")[0]
                      : "bg-slate-600"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
                >
                  <span
                    className={`${
                      timer.autoStartNext ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className={`mt-6 w-full py-3 ${currentTheme.button} rounded-lg font-semibold transition-colors duration-200`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help - Use existing component */}
      {showHelp && (
        <KeyboardShortcutsHelp
          isVisible={showHelp}
          onClose={() => setShowHelp(false)}
        />
      )}

      {/* Focus Mode - Use existing component */}
      {focusMode && (
        <FocusMode
          isActive={focusMode}
          timeLeft={timeLeft}
          isRunning={isRunning}
          currentMode={currentMode}
          onStartPause={handleStartPause}
          onExitFocusMode={() => setFocusMode(false)}
        />
      )}
    </>
  );
}
