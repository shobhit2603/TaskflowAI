"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useTaskStore } from "@/store/taskStore";

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const taskKeys = {
  all: ["tasks"],
  lists: () => [...taskKeys.all, "list"],
  list: (filters) => [...taskKeys.lists(), filters],
  details: () => [...taskKeys.all, "detail"],
  detail: (id) => [...taskKeys.details(), id],
};

/**
 * useTasks — fetches the task list with current filters from taskStore.
 * The queryKey includes filters, so any filter change triggers a new fetch.
 */
export function useTasks() {
  const { isAuthenticated } = useAuthStore();
  const { filters } = useTaskStore();

  // Build clean params — omit empty strings and undefined
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== "" && v !== undefined && v !== null
    )
  );

  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => api.get("/tasks", { params }),
    enabled: isAuthenticated,
    placeholderData: (previousData) => previousData, // keeps old data visible while refetching
  });
}

/**
 * useTask — fetches a single task by ID.
 */
export function useTask(taskId) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => api.get(`/tasks/${taskId}`),
    enabled: isAuthenticated && !!taskId,
  });
}

/**
 * useCreateTask — POST /tasks
 */
export function useCreateTask() {
  const qc = useQueryClient();
  const { closeTaskForm } = useTaskStore();

  return useMutation({
    mutationFn: (taskData) => api.post("/tasks", taskData),
    onSuccess: (data) => {
      // Invalidate task list so the new task appears without a manual refresh
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      closeTaskForm();
      toast.success(`"${data.task.title}" created!`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task.");
    },
  });
}

/**
 * useUpdateTask — PUT /tasks/:id
 */
export function useUpdateTask() {
  const qc = useQueryClient();
  const { closeTaskForm } = useTaskStore();

  return useMutation({
    mutationFn: ({ id, ...updates }) => api.put(`/tasks/${id}`, updates),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: taskKeys.detail(data.task.id) });
      closeTaskForm();
      toast.success("Task updated.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update task.");
    },
  });
}

/**
 * useDeleteTask — DELETE /tasks/:id
 */
export function useDeleteTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (taskId) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success("Task deleted.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete task.");
    },
  });
}

/**
 * useToggleTask — PATCH /tasks/:id/toggle
 * Uses optimistic update so the checkbox feels instant.
 */
export function useToggleTask() {
  const qc = useQueryClient();
  const { filters } = useTaskStore();
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
  );

  return useMutation({
    mutationFn: (taskId) => api.patch(`/tasks/${taskId}/toggle`),

    // Optimistic update — flip the checkbox immediately before the API responds
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: taskKeys.list(params) });
      const previousData = qc.getQueryData(taskKeys.list(params));

      qc.setQueryData(taskKeys.list(params), (old) => {
        if (!old?.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      });

      return { previousData };
    },

    // Roll back if the server request fails
    onError: (error, _taskId, context) => {
      qc.setQueryData(taskKeys.list(params), context.previousData);
      toast.error(error.message || "Failed to update task.");
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
