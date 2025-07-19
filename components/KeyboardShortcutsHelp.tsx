interface ShortcutItem {
  key: string;
  description: string;
  category: string;
}

interface KeyboardShortcutsHelpProps {
  isVisible: boolean;
  onClose: () => void;
}

const shortcuts: ShortcutItem[] = [
  // Timer Controls
  {
    key: "Space",
    description: "Start/Pause timer",
    category: "Timer Controls",
  },
  { key: "R", description: "Reset timer", category: "Timer Controls" },

  // Mode Selection
  {
    key: "1",
    description: "Switch to Focus mode (25 min)",
    category: "Timer Modes",
  },
  {
    key: "2",
    description: "Switch to Short Break (5 min)",
    category: "Timer Modes",
  },
  {
    key: "3",
    description: "Switch to Long Break (15 min)",
    category: "Timer Modes",
  },

  // Interface
  { key: "T", description: "Toggle task panel", category: "Interface" },
  { key: "S", description: "Open settings", category: "Interface" },
  { key: "H", description: "Show keyboard shortcuts", category: "Interface" },
  { key: "Esc", description: "Close modals/panels", category: "Interface" },

  // Navigation
  {
    key: "Tab",
    description: "Navigate between elements",
    category: "Navigation",
  },
  {
    key: "Enter",
    description: "Activate focused element",
    category: "Navigation",
  },
  { key: "↑↓", description: "Navigate lists", category: "Navigation" },
];

export default function KeyboardShortcutsHelp({
  isVisible,
  onClose,
}: KeyboardShortcutsHelpProps) {
  if (!isVisible) return null;

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  const formatKey = (key: string) => {
    const keyMap: Record<string, string> = {
      Space: "␣",
      Esc: "Esc",
      "↑↓": "↑ ↓",
    };
    return keyMap[key] || key;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-labelledby="shortcuts-title"
      aria-describedby="shortcuts-description"
    >
      <div
        className="glass-morphism p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2
              id="shortcuts-title"
              className="text-white text-xl font-semibold"
            >
              Keyboard Shortcuts
            </h2>
            <p
              id="shortcuts-description"
              className="text-white/70 text-sm mt-1"
            >
              Use these shortcuts to navigate and control Focusify efficiently
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
            aria-label="Close shortcuts help"
          >
            ×
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-white font-medium text-sm uppercase tracking-wide opacity-80">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg"
                  >
                    <span className="text-white/80 text-sm">
                      {item.description}
                    </span>
                    <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white font-mono">
                      {formatKey(item.key)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">
              💡 Tip: Shortcuts work when not typing in input fields
            </span>
            <button onClick={onClose} className="glass-button text-sm">
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
