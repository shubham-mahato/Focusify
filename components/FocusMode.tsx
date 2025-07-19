"use client";
import { useEffect, useRef } from "react";
import { formatTime } from "../lib/timerUtils";
import { useFocusManagement } from "../hooks/useFocusManagement";

interface FocusModeProps {
  isActive: boolean;
  timeLeft: number;
  isRunning: boolean;
  currentMode: string;
  onStartPause: () => void;
  onExitFocusMode: () => void;
}

export default function FocusMode({
  isActive,
  timeLeft,
  isRunning,
  currentMode,
  onStartPause,
  onExitFocusMode,
}: FocusModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { trapFocus, announceToScreenReader } = useFocusManagement();

  // Trap focus when focus mode is active
  useEffect(() => {
    if (isActive && containerRef.current) {
      const cleanup = trapFocus(containerRef);
      announceToScreenReader("Entered focus mode. Press Escape to exit.");

      return cleanup;
    }

    // Return undefined explicitly for code paths that don't need cleanup
    return undefined;
  }, [isActive, trapFocus, announceToScreenReader]);

  // Handle escape key to exit focus mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) {
        onExitFocusMode();
        announceToScreenReader("Exited focus mode");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isActive, onExitFocusMode, announceToScreenReader]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-mode-title"
      aria-describedby="focus-mode-description"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-8">
        {/* Header */}
        <div>
          <h1
            id="focus-mode-title"
            className="text-6xl md:text-8xl font-light text-white mb-4"
          >
            {formatTime(timeLeft)}
          </h1>
          <div
            id="focus-mode-description"
            className="text-xl text-white/70 capitalize"
          >
            {currentMode.replace("-", " ")} Session
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`w-3 h-3 rounded-full ${
              isRunning ? "bg-green-400 animate-pulse" : "bg-yellow-400"
            }`}
          ></div>
          <span className="text-white/80">
            {isRunning ? "Timer Running" : "Timer Paused"}
          </span>
        </div>

        {/* Minimal Controls */}
        <div className="space-y-4">
          <button
            onClick={onStartPause}
            className="w-20 h-20 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-all duration-200 mx-auto focus:ring-4 focus:ring-white/30"
            aria-label={isRunning ? "Pause timer" : "Start timer"}
          >
            {isRunning ? (
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <div className="text-white/60 text-sm">
            Press <kbd className="px-2 py-1 bg-white/10 rounded">Space</kbd> to{" "}
            {isRunning ? "pause" : "start"}
          </div>
        </div>

        {/* Exit Instructions */}
        <div className="pt-8 border-t border-white/20">
          <button
            onClick={onExitFocusMode}
            className="text-white/60 hover:text-white/80 transition-colors text-sm"
          >
            Press <kbd className="px-2 py-1 bg-white/10 rounded mx-1">Esc</kbd>{" "}
            to exit focus mode
          </button>
        </div>

        {/* Breathing Animation Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10">
          <div className="w-96 h-96 border border-white/10 rounded-full animate-pulse"></div>
          <div className="absolute inset-8 border border-white/5 rounded-full animate-pulse animation-delay-1000"></div>
          <div className="absolute inset-16 border border-white/5 rounded-full animate-pulse animation-delay-2000"></div>
        </div>
      </div>

      {/* Screen Reader Status Updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isRunning && `Timer running, ${formatTime(timeLeft)} remaining`}
        {!isRunning &&
          timeLeft > 0 &&
          `Timer paused at ${formatTime(timeLeft)}`}
        {timeLeft === 0 && `${currentMode} session completed`}
      </div>
    </div>
  );
}
