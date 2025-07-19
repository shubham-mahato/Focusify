import { useTasks } from "../hooks/useTasks";
import TaskInput from "./TaskInput";
import TaskList from "./TaskList";
import TaskFilter from "./TaskFilter";

interface TaskPanelProps {
  isVisible: boolean;
  currentSession?: string;
  onClose?: () => void;
}

export default function TaskPanel({
  isVisible,
  currentSession,
  onClose,
}: TaskPanelProps) {
  const {
    tasks,
    activeTasks,
    completedTasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    filter,
    setFilter,
    clearCompletedTasks,
  } = useTasks();

  const taskCounts = {
    all: tasks.length,
    active: activeTasks.length,
    completed: completedTasks.length,
  };

  if (!isVisible) return null;

  return (
    <div className="task-panel glass-morphism rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg">Session Tasks</h3>
          <p className="text-white/60 text-sm">
            Stay focused with task-driven sessions
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Close task panel"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Task Input */}
      <TaskInput
        onAddTask={addTask}
        placeholder="What do you want to accomplish this session?"
      />

      {/* Task Filter */}
      {tasks.length > 0 && (
        <TaskFilter
          currentFilter={filter}
          onFilterChange={setFilter}
          taskCounts={taskCounts}
          onClearCompleted={clearCompletedTasks}
        />
      )}

      {/* Task List */}
      <div className="max-h-80 overflow-y-auto">
        <TaskList
          tasks={tasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onEditTask={editTask}
          showSessionInfo={false}
        />
      </div>

      {/* Session Summary */}
      {currentSession && activeTasks.length > 0 && (
        <div className="pt-3 border-t border-white/20">
          <div className="text-sm text-white/70">
            <strong>{activeTasks.length}</strong> active tasks for this session
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {tasks.length > 0 && (
        <div className="pt-3 border-t border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-semibold text-white">
                {taskCounts.all}
              </div>
              <div className="text-xs text-white/60">Total</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-focus-active">
                {taskCounts.active}
              </div>
              <div className="text-xs text-white/60">Active</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-focus-complete">
                {taskCounts.completed}
              </div>
              <div className="text-xs text-white/60">Done</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
