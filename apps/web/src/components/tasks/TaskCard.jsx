"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, Bell, Clock, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeDate, isPastDue, getPriorityConfig } from "@/lib/utils";
import { useToggleTask, useDeleteTask } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";

/**
 * TaskCard — minimal row-style task card.
 *
 * Design: Linear-inspired list item. No heavy borders or shadows.
 * Hover reveals action buttons. Click-circle to toggle. Double-click trash to delete.
 */
export default function TaskCard({ task, index = 0 }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutate: toggleTask, isPending: isToggling } = useToggleTask();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();
  const { openTaskForm } = useTaskStore();

  const priorityConfig = getPriorityConfig(task.priority);
  const pastDue = isPastDue(task.dueDate) && !task.completed;
  const relativeDate = formatRelativeDate(task.dueDate);

  const handleDelete = () => {
    if (confirmDelete) {
      deleteTask(task.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className={cn(
        "group task-row flex items-start gap-3 rounded-xl px-4 py-3.5",
        "border border-transparent hover:border-border/50",
        "animate-fade-in",
        task.completed && "opacity-50"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* ── Toggle circle ────────────────────────────────────────────── */}
      <button
        onClick={() => !isToggling && toggleTask(task.id)}
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center",
          "transition-all duration-150 active:scale-90",
          task.completed
            ? "bg-emerald-500 border-emerald-500"
            : "border-muted-foreground/25 hover:border-primary"
        )}
      >
        {task.completed && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
      </button>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          {/* Title */}
          <p className={cn(
            "text-sm font-medium leading-snug",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>

          {/* Action buttons — fade in on hover */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
            <button
              onClick={() => openTaskForm(task)}
              className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={cn(
                "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
                confirmDelete
                  ? "bg-destructive/10 text-destructive"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {task.description}
          </p>
        )}

        {/* Meta pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {/* Priority dot + label */}
          <span className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium rounded-md px-1.5 py-0.5 border",
            priorityConfig.badge
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", priorityConfig.dot)} />
            {priorityConfig.label}
          </span>

          {/* Category */}
          {task.category && task.category !== "general" && (
            <span className="inline-flex items-center text-[11px] text-muted-foreground bg-muted/60 rounded-md px-1.5 py-0.5">
              {task.category}
            </span>
          )}

          {/* Due date */}
          {relativeDate && (
            <span className={cn(
              "inline-flex items-center gap-1 text-[11px]",
              pastDue ? "text-red-400 font-medium" : "text-muted-foreground"
            )}>
              <Clock className="h-2.5 w-2.5" />
              {relativeDate}
            </span>
          )}

          {/* Reminder */}
          {task.reminder?.enabled && !task.reminder?.sent && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
              <Bell className="h-2.5 w-2.5" />
              Reminder
            </span>
          )}
        </div>

        {confirmDelete && (
          <p className="text-[11px] text-destructive mt-1.5">
            Tap again to confirm deletion
          </p>
        )}
      </div>
    </div>
  );
}

export function TaskCardSkeleton({ index = 0 }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="mt-0.5 h-5 w-5 rounded-full skeleton-shimmer shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded skeleton-shimmer" />
        <div className="flex gap-1.5 mt-2">
          <div className="h-4 w-14 rounded skeleton-shimmer" />
          <div className="h-4 w-20 rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
