interface NotificationPromptProps {
  isVisible: boolean;
  onAllow: () => void;
  onDeny: () => void;
  onDismiss: () => void;
}

export default function NotificationPrompt({
  isVisible,
  onAllow,
  onDeny,
  onDismiss,
}: NotificationPromptProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 glass-morphism p-4 rounded-lg shadow-lg max-w-sm z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        {/* Notification Icon */}
        <div className="flex-shrink-0 w-8 h-8 bg-focus-active rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm">
            Enable Notifications
          </h4>
          <p className="text-white/70 text-xs mt-1">
            Get notified when your focus sessions and breaks are complete, even
            when Focusify isn&apos;t in focus.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={onAllow}
              className="flex-1 bg-focus-active text-white text-xs px-3 py-2 rounded hover:bg-focus-active/80 transition-colors"
            >
              Allow
            </button>
            <button
              onClick={onDeny}
              className="flex-1 bg-white/20 text-white text-xs px-3 py-2 rounded hover:bg-white/30 transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-white/70 hover:text-white text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
}
