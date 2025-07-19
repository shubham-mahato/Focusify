import { useState, KeyboardEvent } from "react";
import { Task } from "../types/tasks";

interface TaskInputProps {
  onAddTask: (title: string, priority?: Task["priority"]) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function TaskInput({
  onAddTask,
  placeholder = "Add a task for this session...",
  autoFocus = false,
}: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (title.trim()) {
      onAddTask(title.trim(), priority);
      setTitle("");
      setPriority("medium");
      setIsExpanded(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setTitle("");
      setIsExpanded(false);
    }
  };

  return (
    <div className="task-input">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsExpanded(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-focus-active focus:border-transparent"
        />

        {title.trim() && (
          <button
            onClick={handleSubmit}
            className="glass-button px-3 py-2 text-sm"
            aria-label="Add task"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Priority Selector (shown when expanded) */}
      {isExpanded && title.trim() && (
        <div className="mt-2 flex gap-2 items-center">
          <span className="text-white/70 text-sm">Priority:</span>
          <div className="flex gap-1">
            {(["low", "medium", "high"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  priority === p
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
                                                         