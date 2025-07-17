// components/ModeSelector.tsx

interface ModeSelectorProps {
  currentMode: "focus" | "short-break" | "long-break";
  onModeChange: (mode: "focus" | "short-break" | "long-break") => void;
  disabled?: boolean;
}

export const ModeSelector = ({
  currentMode,
  onModeChange,
  disabled = false,
}: ModeSelectorProps) => {
  const modes = [
    { key: "focus" as const, label: "Focus", duration: "25min" },
    { key: "short-break" as const, label: "Short Break", duration: "5min" },
    { key: "long-break" as const, label: "Long Break", duration: "15min" },
  ];
  return (
    <div className="mode-buttons">
      {modes.map(({ key, label, duration }) => (
        <button
          key={key}
          className={`glass-button ${currentMode === key ? "active" : ""} ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => !disabled && onModeChange(key)}
          disabled={disabled}
        >
          <span className="block">{label}</span>
          <span className="text-xs opacity-75">{duration}</span>
        </button>
      ))}
    </div>
  );
};
