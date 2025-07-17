import { TimerMode, MODE_CONFIGS } from "../types/timer";

interface ModeSelectorProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  disabled?: boolean;
}

export default function ModeSelector({
  currentMode,
  onModeChange,
  disabled = false,
}: ModeSelectorProps) {
  return (
    <div className="mode-buttons">
      {MODE_CONFIGS.map(({ key, label, duration, description }) => (
        <button
          key={key}
          className={`glass-button ${currentMode === key ? "active" : ""} ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => !disabled && onModeChange(key)}
          disabled={disabled}
          title={description}
        >
          <span className="block">{label}</span>
          <span className="text-xs opacity-75">{duration}</span>
        </button>
      ))}
    </div>
  );
}
