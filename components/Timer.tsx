"use client";
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

export default function Timer() {
  const { timeLeft, isRunning, currentMode, start, pause, reset, setMode } =
    useTimer();

  const totalTime = getModeDuration(currentMode);
  const progress = calculateProgress(timeLeft, totalTime);

  return (
    <div className="study-layout">
      {/* App Title */}
      <div className="app-title">
        focusify
        <div className="text-sm opacity-75 mt-2">
          your productivity companion
        </div>
      </div>

      {/* Mode Selection */}
      <ModeSelector
        currentMode={currentMode}
        onModeChange={setMode}
        disabled={isRunning}
      />

      {/* Current Mode Display */}
      <div className="text-white/80 text-lg mb-4 font-medium">
        {getModeDisplayName(currentMode)}
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
                ? "Finished!"
                : "Ready to start"}
            </div>
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

      {/* Session Info */}
      <div className="mt-12 glass-morphism p-6 rounded-lg max-w-md">
        <h3 className="text-white font-semibold mb-4">Session Info</h3>
        <div className="space-y-2 text-white/70">
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="font-medium">
              {getModeDisplayName(currentMode)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-medium">{formatTime(totalTime)}</span>
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
      </div>
    </div>
  );
}
