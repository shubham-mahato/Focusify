import { useTimer } from "../hooks/useTimer";
import {
  formatTime,
  calculateProgress,
  getModeDisplayName,
  getModeDuration,
} from "../lib/timerUtils";
import ModeSelector from "./ModeSelector";
import TimerControls from "./TimerControls";
import ProgressCircle from "./ProgressCircle";
import SessionCounter from "./SessionCounter";
import AutoStartSettings from "./AutoStartSettings";

export default function Timer() {
  const {
    timeLeft,
    isRunning,
    currentMode,
    start,
    pause,
    reset,
    setMode,

    // Pomodoro state
    sessionsCompleted,
    currentCycle,
    totalSessions,
    isOnBreak,
    cycleProgress,
    nextSessionNumber,

    // Auto-start
    autoStartNext,
    setAutoStartNext,

    // Cycle management
    resetCycle,
    getNextSession,
  } = useTimer();

  const totalTime = getModeDuration(currentMode);
  const progress = calculateProgress(timeLeft, totalTime);
  const nextSession = getNextSession(currentMode);

  return (
    <div className="study-layout">
      {/* App Title */}
      <div className="app-title">
        focusify
        <div className="text-sm opacity-75 mt-2">
          your productivity companion
        </div>
      </div>

      {/* Session Counter */}
      <div className="mb-6">
        <SessionCounter
          sessionsCompleted={sessionsCompleted}
          totalSessionsPerCycle={4}
          currentCycle={currentCycle}
          totalSessions={totalSessions}
          isOnBreak={isOnBreak}
        />
      </div>

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
        {isOnBreak && (
          <div className="text-white/60 text-sm mt-1">
            Next: Focus Session #{nextSessionNumber}
          </div>
        )}
      </div>

      {/* Timer Display with Progress Circle */}
      <div className="mb-8">
        <ProgressCircle progress={progress} size={300} strokeWidth={8}>
          <div className="text-center">
            <div className="timer-display">{formatTime(timeLeft)}</div>
            <div className="text-white/60 text-sm mt-2">
              {isRunning
                ? "Running..."
                : timeLeft === 0
                ? "Session Complete!"
                : "Ready to start"}
            </div>
            {timeLeft === 0 && (
              <div className="text-focus-complete text-xs mt-1 animate-bounce-gentle">
                {nextSession.message}
              </div>
            )}
          </div>
        </ProgressCircle>
      </div>

      {/* Timer Controls */}
      <TimerControls
        isRunning={isRunning}
        timeLeft={timeLeft}
        onStart={start}
        onPause={pause}
        onReset={reset}
      />

      {/* Auto-start Settings */}
      <div className="mt-8 max-w-md mx-auto">
        <AutoStartSettings
          autoStartNext={autoStartNext}
          onToggle={setAutoStartNext}
        />
      </div>

      {/* Session Info */}
      <div className="mt-8 glass-morphism p-6 rounded-lg max-w-md mx-auto">
        <h3 className="text-white font-semibold mb-4">Session Info</h3>
        <div className="space-y-2 text-white/70">
          <div className="flex justify-between">
            <span>Current Mode:</span>
            <span className="font-medium">
              {getModeDisplayName(currentMode)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Session Progress:</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="flex justify-between">
            <span>Cycle Progress:</span>
            <span className="font-medium">{Math.round(cycleProgress)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Next Session:</span>
            <span className="font-medium">
              {getModeDisplayName(nextSession.mode)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span
              className={`font-medium ${
                timeLeft === 0
                  ? "text-focus-complete"
                  : isRunning
                  ? "text-focus-active"
                  : "text-focus-pause"
              }`}
            >
              {timeLeft === 0 ? "Completed" : isRunning ? "Running" : "Paused"}
            </span>
          </div>
        </div>

        {/* Cycle Reset Button */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <button
            onClick={resetCycle}
            className="w-full glass-button text-sm"
            disabled={isRunning}
          >
            Reset Cycle
          </button>
        </div>
      </div>
    </div>
  );
}
