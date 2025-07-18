import { useState } from "react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;

  // Notification settings
  notificationsEnabled: boolean;
  notificationPermission: "default" | "granted" | "denied";
  onNotificationsToggle: (enabled: boolean) => void;
  onRequestNotificationPermission: () => void;

  // Audio settings
  soundEnabled: boolean;
  soundVolume: number;
  onSoundToggle: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onTestSound: () => void;

  // Timer settings
  autoStartNext: boolean;
  onAutoStartToggle: (enabled: boolean) => void;

  // Data management
  onClearData: () => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  notificationsEnabled,
  notificationPermission,
  onNotificationsToggle,
  onRequestNotificationPermission,
  soundEnabled,
  soundVolume,
  onSoundToggle,
  onVolumeChange,
  onTestSound,
  autoStartNext,
  onAutoStartToggle,
  onClearData,
}: SettingsPanelProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleClearData = () => {
    if (showClearConfirm) {
      onClearData();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-morphism p-6 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Notifications Section */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Notifications</h3>

          <div className="space-y-3">
            {/* Enable Notifications */}
            <div className="flex items-center justify-between">
              <span className="text-white/80">Enable notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={notificationsEnabled}
                  onChange={(e) => onNotificationsToggle(e.target.checked)}
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                    notificationsEnabled ? "bg-focus-active" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      notificationsEnabled ? "translate-x-5" : "translate-x-0.5"
                    } mt-0.5`}
                  />
                </div>
              </label>
            </div>

            {/* Permission Status */}
            <div className="text-sm text-white/60">
              Permission:
              <span
                className={`ml-1 ${
                  notificationPermission === "granted"
                    ? "text-focus-complete"
                    : notificationPermission === "denied"
                    ? "text-focus-active"
                    : "text-focus-pause"
                }`}
              >
                {notificationPermission}
              </span>
            </div>

            {/* Request Permission Button */}
            {notificationPermission !== "granted" && (
              <button
                onClick={onRequestNotificationPermission}
                className="w-full glass-button text-sm"
              >
                {notificationPermission === "denied"
                  ? "Enable in browser settings"
                  : "Request permission"}
              </button>
            )}
          </div>
        </div>

        {/* Audio Section */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Audio</h3>

          <div className="space-y-4">
            {/* Enable Sound */}
            <div className="flex items-center justify-between">
              <span className="text-white/80">Enable sound effects</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={soundEnabled}
                  onChange={(e) => onSoundToggle(e.target.checked)}
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                    soundEnabled ? "bg-focus-active" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      soundEnabled ? "translate-x-5" : "translate-x-0.5"
                    } mt-0.5`}
                  />
                </div>
              </label>
            </div>

            {/* Volume Control */}
            {soundEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Volume</span>
                  <span className="text-white/60 text-sm">
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={soundVolume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <button
                  onClick={onTestSound}
                  className="w-full glass-button text-sm"
                >
                  Test Sound
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Timer Section */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Timer</h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-white/80">Auto-start next session</span>
              <p className="text-white/60 text-xs">
                Automatically start after 3 seconds
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={autoStartNext}
                onChange={(e) => onAutoStartToggle(e.target.checked)}
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                  autoStartNext ? "bg-focus-active" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    autoStartNext ? "translate-x-5" : "translate-x-0.5"
                  } mt-0.5`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Data</h3>

          <button
            onClick={handleClearData}
            className={`w-full glass-button text-sm ${
              showClearConfirm ? "bg-focus-active/50" : ""
            }`}
          >
            {showClearConfirm ? "Confirm: Clear All Data" : "Clear All Data"}
          </button>

          {showClearConfirm && (
            <p className="text-white/60 text-xs mt-2">
              This will reset all your sessions and preferences
            </p>
          )}
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="w-full glass-button">
          Close Settings
        </button>
      </div>
    </div>
  );
}
