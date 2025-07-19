import { useEffect } from "react";
import { TimerMode } from "../types/timer";
import { useFocusManagement } from "../hooks/useFocusManagement";

interface AccessibleTimerControlsProps {
  isRunning: boolean;
  timeLeft: number;
  currentMode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: TimerMode) => void;
  onToggleTaskPanel: () => void;
  onToggleSettings: () => void;
  disabled?: boolean;
}

export default function AccessibleTimerControls({
  isRunning,
  timeLeft,
  currentMode,
  onStart,
  onPause,
  onReset,
  onModeChange,
  onToggleTaskPanel,
  onToggleSettings,
  disabled = false,
}: AccessibleTimerControlsProps) {
  const { announceToScreenReader } = useFocusManagement();

  // Announce timer state changes
  useEffect(() => {
    if (isRunning) {
      announceToScreenReader(`Timer started in ${currentMode} mode`);
    }
  }, [isRunning, currentMode, announceToScreenReader]);

  useEffect(() => {
    if (timeLeft === 0) {
      announceToScreenReader(`${currentMode} session completed`);
    }
  }, [timeLeft, currentMode, announceToScreenReader]);

  const formatTimeForAnnouncement = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds} seconds`;
    }

    return `${minutes} minutes ${
      remainingSeconds > 0 ? `and ${remainingSeconds} seconds` : ""
    }`;
  };

  const getModeLabel = (mode: TimerMode): string => {
    switch (mode) {
      case "focus":
        return "Focus session, 25 minutes";
      case "short-break":
        return "Short break, 5 minutes";
      case "long-break":
        return "Long break, 15 minutes";
      default:
        return mode;
    }
  };

  const handleStartPause = () => {
    if (isRunning) {
      onPause();
      announceToScreenReader("Timer paused");
    } else {
      onStart();
      announceToScreenReader(
        `Timer started, ${formatTimeForAnnouncement(timeLeft)} remaining`
      );
    }
  };

  const handleReset = () => {
    onReset();
    announceToScreenReader(`Timer reset to ${getModeLabel(currentMode)}`);
  };

  const handleModeChange = (mode: TimerMode) => {
    onModeChange(mode);
    announceToScreenReader(`Switched to ${getModeLabel(mode)}`);
  };

  return (
    <div
      className="accessible-timer-controls space-y-6"
      role="group"
      aria-label="Timer controls"
    >
      {/* Mode Selection */}
      <fieldset className="mode-selection">
        <legend className="sr-only">Select timer mode</legend>
        <div
          className="mode-buttons"
          role="radiogroup"
          aria-label="Timer modes"
        >
          {[
            { mode: "focus" as const, label: "Focus", shortcut: "1" },
            {
              mode: "short-break" as const,
              label: "Short Break",
              shortcut: "2",
            },
            { mode: "long-break" as const, label: "Long Break", shortcut: "3" },
          ].map(({ mode, label, shortcut }) => (
            <button
              key={mode}
              role="radio"
              aria-checked={currentMode === mode}
              aria-describedby={`${mode}-description`}
              className={`glass-button ${currentMode === mode ? "active" : ""}`}
              onClick={() => handleModeChange(mode)}
              disabled={disabled || isRunning}
              data-shortcut={shortcut}
            >
              <span>{label}</span>
              <span className="text-xs opacity-75 block">
                {mode === "focus"
                  ? "25min"
                  : mode === "short-break"
                  ? "5min"
                  : "15min"}
              </span>

              {/* Hidden descriptions for screen readers */}
              <div id={`${mode}-description`} className="sr-only">
                {getModeLabel(mode)}. Press {shortcut} key to select.
              </div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Primary Controls */}
      <div className="control-buttons" role="group" aria-label="Timer controls">
        {/* Start/Pause Button */}
        <button
          className={`glass-button primary ${
            isRunning ? "bg-focus-pause" : "bg-focus-active"
          } ${timeLeft === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleStartPause}
          disabled={timeLeft === 0}
          aria-describedby="start-pause-description"
          data-shortcut="Space"
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
                <span>Pause</span>
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
                <span>Start</span>
              </>
            )}
          </span>
          <div id="start-pause-description" className="sr-only">
            {isRunning
              ? `Pause the ${currentMode} timer. Press Space key.`
              : `Start the ${currentMode} timer with ${formatTimeForAnnouncement(
                  timeLeft
                )} remaining. Press Space key.`}
          </div>
        </button>

        {/* Reset Button */}
        <button
          className="glass-button"
          onClick={handleReset}
          aria-describedby="reset-description"
          data-shortcut="R"
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
            <span>Reset</span>
          </span>
          <div id="reset-description" className="sr-only">
            Reset timer to {getModeLabel(currentMode)}. Press R key.
          </div>
        </button>

        {/* Tasks Button */}
        <button
          className="glass-button"
          onClick={onToggleTaskPanel}
          aria-describedby="tasks-description"
          data-shortcut="T"
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
            <span>Tasks</span>
          </span>
          <div id="tasks-description" className="sr-only">
            Toggle task panel to manage session tasks. Press T key.
          </div>
        </button>

        {/* Settings Button */}
        <button
          className="glass-button"
          onClick={onToggleSettings}
          aria-describedby="settings-description"
          data-shortcut="S"
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
            <span>Settings</span>
          </span>
          <div id="settings-description" className="sr-only">
            Open settings panel to configure timer preferences. Press S key.
          </div>
        </button>
      </div>

      {/* Live region for timer updates */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
        role="status"
      >
        {isRunning && timeLeft > 0 && (
          <span>
            Timer running, {formatTimeForAnnouncement(timeLeft)} remaining in{" "}
            {currentMode} mode
          </span>
        )}
      </div>
    </div>
  );
}
