import { TaskListState } from "../types/tasks";

interface TaskFilterProps {
  currentFilter: TaskListState["filter"];
  onFilterChange: (filter: TaskListState["filter"]) => void;
  taskCounts: {
    all: number;
    active: number;
    completed: number;
  };
  onClearCompleted: () => void;
}

export default function TaskFilter({
  currentFilter,
  onFilterChange,
  taskCounts,
  onClearCompleted,
}: TaskFilterProps) {
  const filters: Array<{
    key: TaskListState["filter"];
    label: string;
    count: number;
  }> = [
    { key: "all", label: "All", count: taskCounts.all },
    { key: "active", label: "Active", count: taskCounts.active },
    { key: "completed", label: "Completed", count: taskCounts.completed },
  ];

  return (
    <div className="task-filter flex items-center justify-between p-3 bg-white/5 rounded-lg">
      {/* Filter Tabs */}
      <div className="flex gap-1">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              currentFilter === filter.key
                ? "bg-focus-active text-white"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {filter.label}
            {filter.count > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  currentFilter === filter.key ? "bg-white/20" : "bg-white/10"
                }`}
              >
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Clear Completed Button */}
      {taskCounts.completed > 0 && (
        <button
          onClick={onClearCompleted}
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          Clear completed ({taskCounts.completed})
        </button>
      )}
    </div>
  );
}
