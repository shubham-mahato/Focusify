interface AutoStartSettingsProps {
  autoStartNext: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function AutoStartSettings({
  autoStartNext,
  onToggle,
}: AutoStartSettingsProps) {
  return (
    <div className="glass-morphism p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">
            Auto-start Next Session
          </h4>
          <p className="text-white/70 text-sm">
            Automatically start the next session after a 3-second delay
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer ml-4">
          <input
            type="checkbox"
            className="sr-only"
            checked={autoStartNext}
            onChange={(e) => onToggle(e.target.checked)}
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

      {autoStartNext && (
        <div className="mt-3 p-3 bg-focus-active/20 rounded-lg">
          <p className="text-white/80 text-xs">
            💡 You&apos;ll have 3 seconds to cancel auto-start if needed
          </p>
        </div>
      )}
    </div>
  );
}
