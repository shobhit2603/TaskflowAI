"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Calendar, Clock, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useTaskStore } from "@/store/taskStore";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useSuggestCategory } from "@/hooks/useAI";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Format a Date object to the value expected by <input type="date"> */
function toDateValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Format a Date object to the value expected by <input type="time"> */
function toTimeValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Combine date string + time string into ISO string for the API */
function combineDateTime(dateStr, timeStr) {
  if (!dateStr) return undefined;
  const time = timeStr || "10:00";
  return new Date(`${dateStr}T${time}`).toISOString();
}

/** Parse an ISO string back into separate date + time strings */
function splitDateTime(iso) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  return { date: toDateValue(d), time: toTimeValue(d) };
}

// Quick date preset buttons
const DATE_PRESETS = [
  {
    label: "Today",
    getDate: () => {
      const d = new Date();
      return { date: toDateValue(d), time: "18:00" };
    },
  },
  {
    label: "Tomorrow",
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return { date: toDateValue(d), time: "10:00" };
    },
  },
  {
    label: "This Fri",
    getDate: () => {
      const d = new Date();
      const diff = (5 - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return { date: toDateValue(d), time: "10:00" };
    },
  },
  {
    label: "Next Mon",
    getDate: () => {
      const d = new Date();
      const diff = (1 - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return { date: toDateValue(d), time: "10:00" };
    },
  },
];

// Priority config for button group
const PRIORITIES = [
  { value: "low",    label: "Low",    dot: "bg-emerald-500", active: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" },
  { value: "medium", label: "Medium", dot: "bg-amber-500",   active: "bg-amber-500/15 border-amber-500/40 text-amber-400" },
  { value: "high",   label: "High",   dot: "bg-red-500",     active: "bg-red-500/15 border-red-500/40 text-red-400" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Zod schema
// ─────────────────────────────────────────────────────────────────────────────
const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.string().max(50).optional(),
  // date and time stored separately in local state, not in the form schema
});

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function TaskForm() {
  const { isTaskFormOpen, editingTask, closeTaskForm } = useTaskStore();
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutate: suggest, data: suggestion, reset: resetSuggestion } = useSuggestCategory();

  const isEditing = !!(editingTask?.id);
  const isPending = isCreating || isUpdating;

  // Separate date and time states for better UX
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [prevOpenState, setPrevOpenState] = useState({ open: false, id: null });

  if (isTaskFormOpen !== prevOpenState.open || editingTask?.id !== prevOpenState.id) {
    setPrevOpenState({ open: isTaskFormOpen, id: editingTask?.id });
    if (isTaskFormOpen) {
      if (editingTask) {
        const { date, time } = splitDateTime(editingTask.dueDate);
        setDateValue(date);
        setTimeValue(time);
      } else {
        setDateValue("");
        setTimeValue("");
      }
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "medium" },
  });

  const priority = useWatch({ control, name: "priority" });
  const title = useWatch({ control, name: "title" });
  const description = useWatch({ control, name: "description" });

  // ── Pre-fill when form opens ──────────────────────────────────────────────
  useEffect(() => {
    if (!isTaskFormOpen) return;

    if (editingTask) {
      reset({
        title: editingTask.title || "",
        description: editingTask.description || "",
        priority: editingTask.priority || "medium",
        category: editingTask.category || "",
      });
    } else {
      reset({ title: "", description: "", priority: "medium", category: "" });
      resetSuggestion?.();
    }
  }, [isTaskFormOpen, editingTask, reset, resetSuggestion]);

  // ── AI category suggestion (debounced) ───────────────────────────────────
  useEffect(() => {
    if (!isEditing && title?.length > 5) {
      const t = setTimeout(() => {
        suggest({ title, description: description || "" });
      }, 900);
      return () => clearTimeout(t);
    }
  }, [title, description, isEditing, suggest]);

  // ── Preset date button handler ────────────────────────────────────────────
  const applyPreset = (preset) => {
    const { date, time } = preset.getDate();
    setDateValue(date);
    setTimeValue(time);
  };

  const isPresetActive = (preset) => {
    const { date } = preset.getDate();
    return dateValue === date;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = (data) => {
    const payload = {
      ...data,
      dueDate: combineDateTime(dateValue, timeValue),
    };

    if (isEditing) {
      updateTask({ id: editingTask.id, ...payload });
    } else {
      createTask(payload);
    }
  };

  return (
    <Dialog open={isTaskFormOpen} onOpenChange={(open) => !open && closeTaskForm()}>
      <DialogContent
        showCloseButton={false}   // ← removes the shadcn default X button
        className={cn(
          "sm:max-w-lg w-full rounded-2xl",
          "border border-border/60 bg-card",
          "p-0 gap-0 shadow-2xl shadow-black/40",
          "overflow-hidden"
        )}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <DialogTitle className="text-base font-semibold">
            {isEditing ? "Edit task" : "New task"}
          </DialogTitle>
          <button
            type="button"
            onClick={closeTaskForm}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-5 space-y-5">

          {/* ── Title ───────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <input
              placeholder="What needs to be done?"
              autoFocus
              className={cn(
                "w-full h-12 px-4 rounded-xl text-sm font-medium",
                "bg-background/60 border border-border/60",
                "placeholder:text-muted-foreground/40",
                "focus:outline-none focus:border-primary/60 focus:bg-background/90",
                "transition-all duration-150",
                errors.title && "border-destructive/50"
              )}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive px-1">{errors.title.message}</p>
            )}

            {/* AI suggestion chip */}
            {suggestion && !isEditing && (
              <div className="flex items-center gap-2 flex-wrap px-1">
                <span className="text-[10px] text-muted-foreground">AI suggests:</span>
                <button
                  type="button"
                  onClick={() => {
                    setValue("category", suggestion.category);
                    setValue("priority", suggestion.priority);
                  }}
                  className="flex items-center gap-1 text-[10px] font-medium bg-primary/8 border border-primary/25 text-primary rounded-full px-2.5 py-0.5 hover:bg-primary/15 transition-colors"
                >
                  ✦ {suggestion.category} · {suggestion.priority}
                </button>
                {suggestion.reasoning && (
                  <span className="text-[10px] text-muted-foreground/50 hidden sm:block truncate max-w-50">
                    {suggestion.reasoning.split(".")[0]}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Notes ───────────────────────────────────────────────────── */}
          <div>
            <Textarea
              placeholder="Add notes or details (optional)"
              rows={2}
              className={cn(
                "text-sm bg-background/60 border-border/60 resize-none rounded-xl",
                "placeholder:text-muted-foreground/40",
                "focus:border-primary/60 focus:bg-background/90",
                "transition-all duration-150"
              )}
              {...register("description")}
            />
          </div>

          {/* ── Priority — button toggle group ──────────────────────────── */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground px-0.5">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => {
                const isActive = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setValue("priority", p.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium",
                      "border transition-all duration-100 active:scale-[0.97]",
                      isActive
                        ? p.active
                        : "border-border/50 bg-background/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full shrink-0", p.dot)} />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Category ────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground px-0.5">Category</label>
            <input
              placeholder="work, personal, health, finance…"
              className={cn(
                "w-full h-11 px-4 rounded-xl text-sm",
                "bg-background/60 border border-border/60",
                "placeholder:text-muted-foreground/40",
                "focus:outline-none focus:border-primary/60 focus:bg-background/90",
                "transition-all duration-150"
              )}
              {...register("category")}
            />
          </div>

          {/* ── Due Date ────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground px-0.5">Due date</label>

            {/* Quick presets */}
            <div className="flex gap-1.5 flex-wrap">
              {DATE_PRESETS.map((preset) => {
                const active = isPresetActive(preset);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "h-8 px-3 rounded-lg text-xs font-medium transition-all duration-100",
                      active
                        ? "bg-primary/15 border border-primary/40 text-primary"
                        : "bg-muted/50 border border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
              {dateValue && (
                <button
                  type="button"
                  onClick={() => { setDateValue(""); setTimeValue(""); }}
                  className="h-8 px-3 rounded-lg text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Date + Time inputs */}
            <div className="grid grid-cols-2 gap-2">
              {/* Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className={cn(
                    "w-full h-11 pl-9 pr-3 rounded-xl text-sm",
                    "bg-background/60 border border-border/60",
                    "text-foreground",
                    "focus:outline-none focus:border-primary/60",
                    "transition-all duration-150"
                  )}
                />
              </div>

              {/* Time */}
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="time"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  disabled={!dateValue}
                  className={cn(
                    "w-full h-11 pl-9 pr-3 rounded-xl text-sm",
                    "bg-background/60 border border-border/60",
                    "text-foreground",
                    "focus:outline-none focus:border-primary/60",
                    "transition-all duration-150",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                />
              </div>
            </div>

            {/* Date preview */}
            {dateValue && (
              <p className="text-[11px] text-muted-foreground/60 px-0.5">
                📅{" "}
                {new Date(`${dateValue}T${timeValue || "10:00"}`).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {timeValue && ` at ${timeValue}`}
              </p>
            )}
          </div>

          {/* ── Action buttons ───────────────────────────────────────────── */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={closeTaskForm}
              className="flex-1 h-11 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 active:scale-[0.98]",
                "transition-all duration-100",
                "shadow-md shadow-primary/25",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
