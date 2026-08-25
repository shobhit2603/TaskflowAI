"use client";

import { useQuery } from "@tanstack/react-query";
import { ListTodo, CheckSquare2, Clock, Sparkles } from "lucide-react";
import api from "@/lib/api";
import { taskKeys } from "@/hooks/useTasks";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const STATS = [
  { key: "total",     label: "Total",     icon: ListTodo,    color: "text-blue-400",    bg: "bg-blue-400/10",   ring: "ring-blue-400/15"   },
  { key: "pending",   label: "Pending",   icon: Clock,       color: "text-amber-400",   bg: "bg-amber-400/10",  ring: "ring-amber-400/15"  },
  { key: "completed", label: "Done",      icon: CheckSquare2,color: "text-emerald-400", bg: "bg-emerald-400/10",ring: "ring-emerald-400/15"},
  { key: "upcoming",  label: "This week", icon: Sparkles,    color: "text-violet-400",  bg: "bg-violet-400/10", ring: "ring-violet-400/15" },
];

export default function TaskStats() {
  const { isAuthenticated } = useAuthStore();

  const q = (params) =>
    useQuery({
      queryKey: taskKeys.list({ ...params, limit: 1 }),
      queryFn: () => api.get("/tasks", { params: { ...params, limit: 1 } }),
      enabled: isAuthenticated,
    });

  /* eslint-disable react-hooks/rules-of-hooks */
  const all       = q({});
  const pending   = q({ completed: false });
  const completed = q({ completed: true });
  const upcoming  = q({ completed: false, sortBy: "dueDate", order: "asc" });
  /* eslint-enable react-hooks/rules-of-hooks */

  const values = {
    total:     all.data?.pagination?.total ?? "—",
    pending:   pending.data?.pagination?.total ?? "—",
    completed: completed.data?.pagination?.total ?? "—",
    upcoming:  upcoming.data?.pagination?.total ?? "—",
  };

  const isLoading = all.isLoading;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in stagger-1">
      {STATS.map(({ key, label, icon: Icon, color, bg, ring }, i) => (
        <div
          key={key}
          className={cn(
            "flex flex-col gap-3 rounded-xl p-4",
            "border border-border/50 bg-card/50",
            "hover:border-border hover:bg-card transition-all duration-150"
          )}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", bg, "ring-1", ring)}>
            <Icon className={cn("h-4 w-4", color)} />
          </div>
          {isLoading ? (
            <div className="space-y-1.5">
              <div className="h-6 w-12 rounded skeleton-shimmer" />
              <div className="h-3 w-16 rounded skeleton-shimmer" />
            </div>
          ) : (
            <div>
              <div className="text-xl font-bold">{values[key]}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
