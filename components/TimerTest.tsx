"use client";
import { useTimer } from "../hooks/useTimer";

// Helper function to format time
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export default function TimerTest() {
  const { timeLeft, isRunning, currentMode, start, pause, reset, setMode } =
    useTimer();

  return (
    <div className="study-layout">
      <h1 className="app-title">Timer Hook Test</h1>

      {/* Mode Selection */}
      <div className="mode-buttons">
        <button
          className={`glass-button ${currentMode === "focus" ? "active" : ""}`}
          onClick={() => setMode("focus")}
        >
          Focus (25min)
        </button>
        <button
          className={`glass-button ${
            currentMode === "short-break" ? "active" : ""
          }`}
          onClick={() => setMode("short-break")}
        >
          Short Break (5min)
        </button>
        <button
          className={`glass-button ${
            currentMode === "long-break" ? "active" : ""
          }`}
          onClick={() => setMode("long-break")}
        >
          Long Break (15min)
        </button>
      </div>

      {/* Timer Display */}
      <div className="timer-display">{formatTime(timeLeft)}</div>

      {/* Status */}
      <div className="text-white/70 text-lg mb-4">
        Mode: {currentMode} | Status: {isRunning ? "Running" : "Paused"}
      </div>

      {/* Controls */}
      <div className="control-buttons">
        <button
          className="glass-button"
          onClick={isRunning ? pause : start}
          disabled={timeLeft === 0}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button className="glass-button" onClick={reset}>
          Reset
        </button>
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-white/10 rounded-lg">
        <h3 className="text-white font-semibold mb-2">Debug Info:</h3>
        <div className="text-white/70 text-sm space-y-1">
          <div>Time Left: {timeLeft} seconds</div>
          <div>Is Running: {isRunning ? "Yes" : "No"}</div>
          <div>Current Mode: {currentMode}</div>
        </div>
      </div>
    </div>
  );
}
