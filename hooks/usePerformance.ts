import { useEffect, useRef, useState } from "react";

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  memoryUsage?: number;
}

interface UsePerformanceReturn {
  metrics: PerformanceMetrics;
  markRender: () => void;
  logPerformance: () => void;
}

// Extended Performance interface for memory API
interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export function usePerformance(componentName: string): UsePerformanceReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
  });

  const mountTimeRef = useRef<number>(0);
  const renderStartRef = useRef<number>(0);
  const updateCountRef = useRef<number>(0);

  // Mark component mount time
  useEffect(() => {
    mountTimeRef.current = performance.now();

    return () => {
      // Cleanup and final metrics on unmount
      if (process.env.NODE_ENV === "development") {
        console.log(`${componentName} Performance Summary:`, {
          totalUpdates: updateCountRef.current,
          mountTime: mountTimeRef.current,
          averageRenderTime:
            metrics.renderTime / Math.max(updateCountRef.current, 1),
        });
      }
    };
  }, [componentName, metrics.renderTime]);

  // Track re-renders
  useEffect(() => {
    updateCountRef.current += 1;
    setMetrics((prev) => ({
      ...prev,
      updateCount: updateCountRef.current,
    }));
  });

  // Mark render start
  const markRender = () => {
    renderStartRef.current = performance.now();
  };

  // Log performance metrics
  const logPerformance = () => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStartRef.current;

    const extendedPerformance = performance as ExtendedPerformance;

    setMetrics((prev) => ({
      ...prev,
      renderTime: prev.renderTime + renderTime,
      memoryUsage: extendedPerformance.memory?.usedJSHeapSize,
    }));

    if (process.env.NODE_ENV === "development" && renderTime > 16) {
      console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`);
    }
  };

  return {
    metrics,
    markRender,
    logPerformance,
  };
}

// Simple performance tracking hook (instead of HOC)
export function usePerformanceTracking(componentName: string): void {
  const { markRender, logPerformance } = usePerformance(componentName);

  // Mark render start
  markRender();

  // Log performance after render
  useEffect(() => {
    logPerformance();
  });
}

// FPS monitor hook
export function useFPSMonitor(): number {
  const [fps, setFPS] = useState<number>(60);
  const lastTimeRef = useRef<number>(performance.now());
  const framesRef = useRef<number>(0);

  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      const now = performance.now();
      framesRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        const currentFPS = Math.round(
          (framesRef.current * 1000) / (now - lastTimeRef.current)
        );
        setFPS(currentFPS);

        if (currentFPS < 55 && process.env.NODE_ENV === "development") {
          console.warn(`Low FPS detected: ${currentFPS}`);
        }

        framesRef.current = 0;
        lastTimeRef.current = now;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    if (process.env.NODE_ENV === "development") {
      animationId = requestAnimationFrame(measureFPS);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return fps;
}

// Performance utilities with proper typing
export const performanceUtils = {
  // Measure function execution time
  measureFunction: <T extends (...args: unknown[]) => unknown>(
    fn: T,
    name: string
  ): T => {
    return ((...args: unknown[]) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();

      if (process.env.NODE_ENV === "development") {
        console.log(`${name} execution time: ${(end - start).toFixed(2)}ms`);
      }

      return result;
    }) as T;
  },

  // Memory usage snapshot
  getMemoryUsage: (): number | null => {
    if (typeof window !== "undefined") {
      const extendedPerformance = performance as ExtendedPerformance;
      if (extendedPerformance.memory) {
        return extendedPerformance.memory.usedJSHeapSize / 1024 / 1024; // MB
      }
    }
    return null;
  },

  // Log render performance
  logRenderTime: (componentName: string, startTime: number): void => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (process.env.NODE_ENV === "development") {
      if (renderTime > 16) {
        console.warn(
          `${componentName} slow render: ${renderTime.toFixed(2)}ms`
        );
      } else {
        console.log(`${componentName} render: ${renderTime.toFixed(2)}ms`);
      }
    }
  },
};
