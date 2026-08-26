import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { useTaskStore } from "../store/taskStore";

export const taskKeys = {
  all: ["tasks"],
  lists: () => [...taskKeys.all, "list"],
  list: (filters) => [...taskKeys.lists(), filters],
  detail: (id) => [...taskKeys.all, "detail", id],
};

export function useTasks() {
  const { isAuthenticated } = useAuthStore();
  const { filters } = useTaskStore();

  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  );

  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => api.get("/tasks", { params }),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { closeForm } = useTaskStore();

  return useMutation({
    mutationFn: (data) => api.post("/tasks", data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      closeForm();
      toast.success(`"${data.task?.title}" created!`);
    },
    onError: (error) => toast.error(error.message || "Failed to create task."),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const { closeForm } = useTaskStore();

  return useMutation({
    mutationFn: ({ id, ...updates }) => api.put(`/tasks/${id}`, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      closeForm();
      toast.success("Task updated.");
    },
    onError: (error) => toast.error(error.message || "Failed to update task."),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success("Task deleted.");
    },
    onError: (error) => toast.error(error.message || "Failed to delete task."),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  const { filters } = useTaskStore();
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
  );

  return useMutation({
    mutationFn: (taskId) => api.patch(`/tasks/${taskId}/toggle`),
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
    onError: (_err, _id, ctx) => {
      qc.setQueryData(taskKeys.list(params), ctx?.previousData);
      toast.error("Failed to update task.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}
