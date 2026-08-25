"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

/**
 * useParseTask — POST /ai/parse-task
 *
 * The flagship AI feature. Takes natural-language text and returns
 * structured task fields to pre-fill the task creation form.
 *
 * Returns the mutation object so the caller can check:
 *   - isPending: to show a loading state on the input
 *   - data: the parsed result { parsed, fallback, originalText }
 *   - mutate(text): to trigger the call
 */
export function useParseTask() {
  return useMutation({
    mutationFn: (text) => api.post("/ai/parse-task", { text }),
    onError: (error) => {
      toast.error(error.message || "AI parsing failed. Try adding the task manually.");
    },
  });
}

/**
 * useSuggestCategory — POST /ai/suggest-category
 *
 * Secondary AI feature. Given a title + description, returns a suggested
 * category and priority with a brief reasoning string.
 * Called asynchronously while the user is filling in the task form.
 */
export function useSuggestCategory() {
  return useMutation({
    mutationFn: ({ title, description }) =>
      api.post("/ai/suggest-category", { title, description }),
    // Silently handle errors — suggestions are non-critical
    onError: () => {},
  });
}
