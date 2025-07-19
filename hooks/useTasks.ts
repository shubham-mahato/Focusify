import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import {
  Task,
  SessionSummary,
  TaskListState,
  UseTasksReturn,
} from "../types/tasks";

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useLocalStorage<Task[]>("focusify-tasks", []);
  const [filter, setFilter] = useState<TaskListState["filter"]>("all");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Generate unique ID for tasks
  const generateId = useCallback(() => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add new task
  const addTask = useCallback(
    (title: string, priority: Task["priority"] = "medium") => {
      const newTask: Task = {
        id: generateId(),
        title: title.trim(),
        completed: false,
        createdAt: Date.now(),
        priority,
        sessionId: currentSessionId || undefined,
      };

      setTasks((prev) => [newTask, ...prev]);
    },
    [generateId, setTasks, currentSessionId]
  );

  // Toggle task completion
  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? Date.now() : undefined,
                sessionId:
                  !task.completed && currentSessionId
                    ? currentSessionId
                    : task.sessionId,
              }
            : task
        )
      );
    },
    [setTasks, currentSessionId]
  );

  // Delete task
  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    },
    [setTasks]
  );

  // Edit task
  const editTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
      );
    },
    [setTasks]
  );

  // Link task to current session
  const linkTaskToSession = useCallback(
    (taskId: string, sessionId: string) => {
      setCurrentSessionId(sessionId);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, sessionId } : task))
      );
    },
    [setTasks]
  );

  // Get session summary
  const getSessionSummary = useCallback(
    (sessionId: string): SessionSummary | null => {
      const sessionTasks = tasks.filter((task) => task.sessionId === sessionId);
      const completedTasks = sessionTasks.filter((task) => task.completed);

      if (sessionTasks.length === 0) return null;

      return {
        sessionId,
        sessionType: "focus", // This would come from timer state
        startTime: Math.min(...sessionTasks.map((task) => task.createdAt)),
        endTime: Math.max(
          ...completedTasks.map((task) => task.completedAt || task.createdAt)
        ),
        tasksCompleted: completedTasks,
        tasksAdded: sessionTasks,
        interrupted: false, // This would come from timer state
      };
    },
    [tasks]
  );

  // Clear completed tasks
  const clearCompletedTasks = useCallback(() => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  }, [setTasks]);

  // Computed values
  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks]
  );

  const currentSessionTasks = useMemo(
    () => tasks.filter((task) => task.sessionId === currentSessionId),
    [tasks, currentSessionId]
  );

  // Filtered tasks based on current filter
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "active":
        return activeTasks;
      case "completed":
        return completedTasks;
      default:
        return tasks;
    }
  }, [tasks, activeTasks, completedTasks, filter]);

  return {
    tasks: filteredTasks,
    activeTasks,
    completedTasks,
    currentSessionTasks,

    // Actions
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    linkTaskToSession,
    getSessionSummary,
    clearCompletedTasks,

    // Filter state
    filter,
    setFilter,
  };
}
