import { useEffect, useCallback, useRef, useMemo } from "react";
import { TimerMode } from "../types/timer";

interface KeyboardShortcuts {
  Space: () => void; // Start/Pause timer
  KeyR: () => void; // Reset timer
  Digit1: () => void; // Focus mode
  Digit2: () => void; // Short break mode
  Digit3: () => void; // Long break mode
  KeyT: () => void; // Toggle task panel
  KeyS: () => void; // Open settings
  Escape: () => void; // Close modals/panels
  KeyH: () => void; // Show help/shortcuts
}

interface UseKeyboardShortcutsProps {
  onStartPause: () => void;
  onReset: () => void;
  onModeChange: (mode: TimerMode) => void;
  onToggleTaskPanel?: () => void;
  onToggleSettings?: () => void;
  onCloseModals?: () => void;
  onShowHelp?: () => void;
  disabled?: boolean;
}

interface UseKeyboardShortcutsReturn {
  shortcuts: KeyboardShortcuts;
  isHelpVisible: boolean;
  showHelp: () => void;
  hideHelp: () => void;
}

export function useKeyboardShortcuts({
  onStartPause,
  onReset,
  onModeChange,
  onToggleTaskPanel,
  onToggleSettings,
  onCloseModals,
  onShowHelp,
  disabled = false,
}: UseKeyboardShortcutsProps): UseKeyboardShortcutsReturn {
  const helpVisibleRef = useRef(false);

  // Define keyboard shortcuts
const shortcuts = useMemo<KeyboardShortcuts>(() => ({
  Space: onStartPause,
  KeyR: onReset,
  Digit1: () => onModeChange("focus"),
  Digit2: () => onModeChange("short-break"),
  Digit3: () => onModeChange("long-break"),
  KeyT: onToggleTaskPanel || (() => {}),
  KeyS: onToggleSettings || (() => {}),
  Escape: onCloseModals || (() => {}),
  KeyH: onShowHelp || (() => {}),
}), [
  onStartPause,
  onReset,
  onModeChange,
  onToggleTaskPanel,
  onToggleSettings,
  onCloseModals,
  onShowHelp
]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      if (disabled || isTyping) return;

      // Don't trigger if modifier keys are pressed (except for intended combinations)
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      const shortcutHandler = shortcuts[event.code as keyof KeyboardShortcuts];

      if (shortcutHandler) {
        event.preventDefault();
        shortcutHandler();
      }
    },
    [shortcuts, disabled]
  );

  // Attach/detach event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Help modal functions
  const showHelp = useCallback(() => {
    helpVisibleRef.current = true;
    if (onShowHelp) onShowHelp();
  }, [onShowHelp]);

  const hideHelp = useCallback(() => {
    helpVisibleRef.current = false;
  }, []);

  return {
    shortcuts,
    isHelpVisible: helpVisibleRef.current,
    showHelp,
    hideHelp,
  };
}
