import { useState } from "react";
import { Task, TASK_PRIORITY_COLORS } from "../types/tasks";

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, updates: Partial<Task>) => void;
  showSessionInfo?: boolean;
}

export default function TaskList({
  tasks,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  showSessionInfo = false,
}: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      onEditTask(editingId, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="w-12 h-12 text-white/30 mx-auto mb-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-white/60">No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
            task.completed
              ? "bg-white/5 opacity-75"
              : "bg-white/10 hover:bg-white/15"
          }`}
        >
          {/* Checkbox */}
          <button
            onClick={() => onToggleTask(task.id)}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors ${
              task.completed
                ? "bg-focus-complete border-focus-complete"
                : "border-white/40 hover:border-white/60"
            }`}
            aria-label={
              task.completed ? "Mark as incomplete" : "Mark as complete"
            }
          >
            {task.completed && (
              <svg
                className="w-3 h-3 text-white m-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {editingId === task.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                onBlur={saveEdit}
                autoFocus
                className="w-full bg-transparent border-b border-white/40 text-white focus:outline-none focus:border-focus-active"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`text-white ${
                    task.completed ? "line-through opacity-70" : ""
                  }`}
                  onDoubleClick={() => !task.completed && startEditing(task)}
                >
                  {task.title}
                </span>

                {/* Priority Badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs border ${
                    TASK_PRIORITY_COLORS[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            )}

            {/* Session Info */}
            {showSessionInfo && task.sessionId && (
              <div className="text-xs text-white/50 mt-1">
                Session: {task.sessionId}
              </div>
            )}

            {/* Completion Time */}
            {task.completed && task.completedAt && (
              <div className="text-xs text-white/50 mt-1">
                Completed at {formatTime(task.completedAt)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!task.completed && editingId !== task.id && (
              <button
                onClick={() => startEditing(task)}
                className="p-1 text-white/60 hover:text-white/90 transition-colors"
                aria-label="Edit task"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}

            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 text-white/60 hover:text-red-400 transition-colors"
              aria-label="Delete task"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
