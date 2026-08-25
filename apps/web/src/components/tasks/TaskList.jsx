"use client";

import { Plus, Inbox, RefreshCw } from "lucide-react";
import TaskCard, { TaskCardSkeleton } from "./TaskCard";
import { useTasks } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import { useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

export default function TaskList() {
  const { data, isLoading, isError, error, isFetching } = useTasks();
  const { openTaskForm, filters, activeTab } = useTaskStore();
  const qc = useQueryClient();

  const tasks = data?.tasks ?? [];
  const pagination = data?.pagination;

  // Loading skeletons
  if (isLoading) {
    return (
      <div className="divide-y divide-border/30">
        {Array.from({ length: 5 }).map((_, i) => (
          <TaskCardSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">{error?.message || "Failed to load tasks."}</p>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: taskKeys.lists() })}
          className="flex items-center gap-1.5 text-xs text-primary mt-3 hover:underline"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    const tabMessages = {
      pending: { title: "No pending tasks", sub: "You're all caught up! Add something new." },
      completed: { title: "Nothing completed yet", sub: "Complete your first task to see it here." },
      reminders: { title: "No reminders set", sub: "Add a due date and reminder when creating tasks." },
    };
    const msg = tabMessages[activeTab] || tabMessages.pending;
    const hasFilters = filters.search || filters.priority || filters.category;

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Inbox className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1.5">
          {hasFilters ? "No tasks match your filters" : msg.title}
        </h3>
        <p className="text-xs text-muted-foreground max-w-55">
          {hasFilters ? "Try changing or clearing your search and filters." : msg.sub}
        </p>
        {!hasFilters && activeTab === "pending" && (
          <button
            onClick={() => openTaskForm()}
            className={cn(
              "flex items-center gap-1.5 mt-5 h-8 px-3 rounded-lg text-xs font-medium",
              "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
              "shadow-sm shadow-primary/20"
            )}
          >
            <Plus className="h-3.5 w-3.5" /> New Task
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("transition-opacity", isFetching && "opacity-70")}>
      <div className="divide-y divide-border/30 rounded-xl overflow-hidden border border-border/50 bg-card/30">
        {tasks.map((task, i) => (
          <TaskCard key={task.id} task={task} index={i} />
        ))}
      </div>

      {pagination && pagination.total > tasks.length && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          {tasks.length} of {pagination.total} tasks
        </p>
      )}
    </div>
  );
}
