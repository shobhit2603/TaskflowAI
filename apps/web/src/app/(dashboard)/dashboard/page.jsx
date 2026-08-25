"use client";

import { useAuthStore } from "@/store/authStore";
import { useTaskStore } from "@/store/taskStore";
import AIQuickAdd from "@/components/ai/AIQuickAdd";
import TaskStats from "@/components/tasks/TaskStats";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskList from "@/components/tasks/TaskList";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "pending",   label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "reminders", label: "Reminders" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeTab, setActiveTab } = useTaskStore();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="animate-fade-in">
        <h1 className="text-xl font-bold tracking-tight">
          {getGreeting()},{" "}
          <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Here&apos;s your task overview for today.
        </p>
      </div>

      {/* ── AI Quick Add — flagship, above the fold ──────────────── */}
      <AIQuickAdd />

      {/* ── Stats ────────────────────────────────────────────────── */}
      <TaskStats />

      {/* ── Tabs + Filters + List ───────────────────────────────── */}
      <div className="space-y-4 animate-fade-in stagger-2">
        {/* Tab row + filters inline */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Tab pills */}
          <div className="flex gap-0.5 p-1 rounded-xl bg-muted/50 w-fit shrink-0">
            {TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                  activeTab === value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Filters inline with tabs on desktop */}
          <div className="flex-1">
            <TaskFilters />
          </div>
        </div>

        {/* Task list */}
        <TaskList />
      </div>
    </div>
  );
}
