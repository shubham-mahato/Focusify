export interface Task {
  id: string;
  title: string;
  completed: boolean;
  sessionId?: string;
  createdAt: number;
  completedAt?: number;
  priority: "low" | "medium" | "high";
  estimatedPomodoros?: number;
}

export interface SessionSummary {
  sessionId: string;
  sessionType: "focus" | "short-break" | "long-break";
  startTime: number;
  endTime: number;
  tasksCompleted: Task[];
  tasksAdded: Task[];
  interrupted: boolean;
}

export interface TaskListState {
  tasks: Task[];
  filter: "all" | "active" | "completed";
  currentSessionTasks: Task[];
}

export interface UseTasksReturn {
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  currentSessionTasks: Task[];

  // Task management
  addTask: (title: string, priority?: Task["priority"]) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, updates: Partial<Task>) => void;

  // Session management
  linkTaskToSession: (taskId: string, sessionId: string) => void;
  getSessionSummary: (sessionId: string) => SessionSummary | null;
  clearCompletedTasks: () => void;

  // Filtering
  filter: TaskListState["filter"];
  setFilter: (filter: TaskListState["filter"]) => void;
}

// Task priority colors
export const TASK_PRIORITY_COLORS = {
  low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  high: "bg-red-500/20 text-red-300 border-red-500/30",
} as const;

// Task priority labels
export const TASK_PRIORITY_LABELS = {
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority",
} as const;
