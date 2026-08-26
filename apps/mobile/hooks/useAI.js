import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner-native";
import api from "../lib/api";

export function useParseTask() {
  return useMutation({
    mutationFn: (text) => api.post("/ai/parse-task", { text }),
    onError: () => toast.error("AI parsing failed. Try manually."),
  });
}

export function useSuggestCategory() {
  return useMutation({
    mutationFn: ({ title, description }) =>
      api.post("/ai/suggest-category", { title, description }),
    onError: () => {},
  });
}
