"use client";

import { useState, useEffect, memo, useCallback, useRef } from "react";
import { useFPSMonitor, performanceUtils } from "../hooks/usePerformance";

interface PerformanceStats {
  fps: number;
  memoryUsage: number;
  bundleSize: number;
  renderCount: number;
}

// Memoized stats display component
const StatsDisplay = memo<{
  label: string;
  value: string | number;
  status: "good" | "warning" | "error";
}>(({ label, value, status }) => {
  const getStatusColor = (status: "good" | "warning" | "error") => {
    switch (status) {
      case "good":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  return (
    <div className="flex justify-between">
      <span>{label}:</span>
      <span className={getStatusColor(status)}>{value}</span>
    </div>
  );
});
StatsDisplay.displayName = "StatsDisplay";

// Memoized performance tips component
const PerformanceTips = memo<{
  fps: number;
  memoryUsage: number;
  renderCount: number;
}>(({ fps, memoryUsage, renderCount }) => {
  const tips = [];

  if (fps < 55) {
    tips.push("• Low FPS detected - check for heavy re-renders");
  }
  if (memoryUsage > 50) {
    tips.push("• High memory usage - possible memory leaks");
  }
  if (renderCount > 100) {
    tips.push("• Many re-renders - optimize with React.memo");
  }
  if (fps >= 58 && memoryUsage <= 50) {
    tips.push("• Performance optimal ✨");
  }

  return (
    <div className="border-t border-gray-600 pt-2 mt-2">
      <div className="text-yellow-400 mb-1">Tips:</div>
      {tips.length === 0 ? (
        <div className="text-green-400">• No issues detected</div>
      ) : (
        tips.map((tip, index) => (
          <div
            key={index}
            className={
              tip.includes("optimal")
                ? "text-green-400"
                : tip.includes("Low FPS") || tip.includes("High memory")
                ? "text-red-400"
                : "text-yellow-400"
            }
          >
            {tip}
          </div>
        ))
      )}
    </div>
  );
});
PerformanceTips.displayName = "PerformanceTips";

// Memoized action buttons component
const ActionButtons = memo<{
  onResetCounters: () => void;
  onLogDetails: () => void;
}>(({ onResetCounters, onLogDetails }) => (
  <div className="border-t border-gray-600 pt-2 mt-2 space-y-1">
    <button
      onClick={onResetCounters}
      className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
    >
      Reset Counters
    </button>
    <button
      onClick={onLogDetails}
      className="w-full bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs transition-colors"
    >
      Log Details
    </button>
  </div>
));
ActionButtons.displayName = "ActionButtons";

function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    memoryUsage: 0,
    bundleSize: 0,
    renderCount: 0,
  });

  const fps = useFPSMonitor();

  // Memoized toggle function
  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  // Memoized reset counters function
  const resetCounters = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      renderCount: 0,
    }));
  }, []);

  // Memoized log details function
  const logDetails = useCallback(() => {
    const memoryInfo = performanceUtils.getMemoryUsage();
    if (memoryInfo !== null) {
      console.group("🔍 Performance Details");
      console.log("Memory Usage:", `${memoryInfo.toFixed(1)} MB`);
      console.log("FPS:", fps);
      console.log("Render Count:", stats.renderCount);

      // Extended performance details if available
      if (typeof window !== "undefined" && window.performance) {
        const navigationEntries = performance.getEntriesByType("navigation");
        if (navigationEntries.length > 0) {
          const navigation =
            navigationEntries[0] as PerformanceNavigationTiming;
          if (navigation.loadEventEnd && navigation.fetchStart) {
            console.log(
              "Page Load Time:",
              `${(navigation.loadEventEnd - navigation.fetchStart).toFixed(
                2
              )}ms`
            );
          }
          if (navigation.domContentLoadedEventEnd && navigation.fetchStart) {
            console.log(
              "DOM Content Loaded:",
              `${(
                navigation.domContentLoadedEventEnd - navigation.fetchStart
              ).toFixed(2)}ms`
            );
          }
        }

        const paintEntries = performance.getEntriesByType("paint");
        paintEntries.forEach((entry) => {
          const paintEntry = entry as PerformancePaintTiming;
          console.log(
            `${paintEntry.name}:`,
            `${paintEntry.startTime.toFixed(2)}ms`
          );
        });

        // Resource timing if available
        const resourceEntries = performance.getEntriesByType("resource");
        if (resourceEntries.length > 0) {
          console.log(`Resources loaded: ${resourceEntries.length}`);
          const slowResources = resourceEntries
            .filter(
              (entry) => (entry as PerformanceResourceTiming).duration > 1000
            )
            .map((entry) => ({
              name: entry.name,
              duration: `${(
                entry as PerformanceResourceTiming
              ).duration.toFixed(2)}ms`,
            }));

          if (slowResources.length > 0) {
            console.log("Slow resources (>1s):", slowResources);
          }
        }
      }
      console.groupEnd();
    }
  }, [fps, stats.renderCount]);

  // Update performance stats with proper dependency management
  useEffect(() => {
    // Only update FPS and memory, not render count
    setStats((prev) => ({
      ...prev,
      fps,
      memoryUsage: performanceUtils.getMemoryUsage() || 0,
    }));
  }, [fps]); // Only when FPS changes

  // Separate interval for periodic memory updates
  useEffect(() => {
    const interval = setInterval(() => {
      const memoryUsage = performanceUtils.getMemoryUsage();
      if (memoryUsage !== null) {
        setStats((prev) => ({
          ...prev,
          memoryUsage,
        }));
      }
    }, 3000); // Update memory every 3 seconds

    return () => clearInterval(interval);
  }, []); // Run once on mount

  // Track renders with ref to avoid infinite loops
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current += 1;
    // Update render count less frequently to avoid performance issues
    if (renderCountRef.current % 10 === 0) {
      setStats((prev) => ({
        ...prev,
        renderCount: renderCountRef.current,
      }));
    }
  });

  // Don't render in production
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleVisibility}
        className="fixed top-4 left-4 z-50 bg-black/80 text-white p-2 rounded text-xs hover:bg-black/90 transition-colors"
        style={{ fontFamily: "monospace" }}
        aria-label="Toggle performance monitor"
      >
        📊 PERF
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed top-16 left-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs font-mono space-y-2 min-w-[220px] shadow-xl border border-gray-700">
          <div className="text-green-400 font-bold mb-2 flex items-center gap-2">
            <span>📊</span>
            Performance Monitor
          </div>

          {/* FPS Display */}
          <StatsDisplay
            label="FPS"
            value={fps}
            status={fps < 55 ? "error" : fps < 58 ? "warning" : "good"}
          />

          {/* Memory Usage Display */}
          <StatsDisplay
            label="Memory"
            value={`${stats.memoryUsage.toFixed(1)} MB`}
            status={
              stats.memoryUsage > 50
                ? "error"
                : stats.memoryUsage > 30
                ? "warning"
                : "good"
            }
          />

          {/* Render Count Display */}
          <StatsDisplay
            label="Renders"
            value={stats.renderCount}
            status={stats.renderCount > 100 ? "warning" : "good"}
          />

          {/* Performance Score */}
          <div className="flex justify-between">
            <span>Score:</span>
            <span
              className={
                fps >= 58 && stats.memoryUsage <= 30
                  ? "text-green-400"
                  : fps >= 55 && stats.memoryUsage <= 50
                  ? "text-yellow-400"
                  : "text-red-400"
              }
            >
              {fps >= 58 && stats.memoryUsage <= 30
                ? "Excellent"
                : fps >= 55 && stats.memoryUsage <= 50
                ? "Good"
                : "Poor"}
            </span>
          </div>

          {/* Performance Tips */}
          <PerformanceTips
            fps={fps}
            memoryUsage={stats.memoryUsage}
            renderCount={stats.renderCount}
          />

          {/* Action Buttons */}
          <ActionButtons
            onResetCounters={resetCounters}
            onLogDetails={logDetails}
          />

          {/* Quick Stats */}
          <div className="border-t border-gray-600 pt-2 mt-2 text-xs opacity-75">
            <div>Update Interval: 2s</div>
            <div>Environment: {process.env.NODE_ENV}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(PerformanceMonitor);
