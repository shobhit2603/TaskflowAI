"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Loader2, Wand2 } from "lucide-react";
import { useParseTask } from "@/hooks/useAI";
import { useTaskStore } from "@/store/taskStore";
import { cn } from "@/lib/utils";

export default function AIQuickAdd() {
  const [text, setText] = useState("");
  const { mutate: parseTask, isPending } = useParseTask();
  const { openTaskForm } = useTaskStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isPending) return;

    parseTask(text, {
      onSuccess: (data) => {
        openTaskForm(data.parsed);
        setText("");
      },
    });
  };

  return (
    <div className={cn(
      "relative rounded-xl border border-border/50 overflow-hidden",
      "bg-linear-to-br from-card to-card/60",
      "animate-fade-in"
    )}>
      {/* Subtle violet glow in top-right */}
      <div className="absolute top-0 right-0 w-32 h-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
            <Wand2 className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium">AI Quick Add</span>
          <span className="text-[10px] font-medium text-primary/70 bg-primary/8 border border-primary/20 rounded-full px-2 py-0.5 ml-auto">
            Mistral AI
          </span>
        </div>

        {/* Input row */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='e.g. "Call vendor about invoice next Friday, urgent"'
            disabled={isPending}
            className={cn(
              "flex-1 h-10 px-3.5 rounded-lg text-sm",
              "bg-background/60 border border-border/60",
              "placeholder:text-muted-foreground/40",
              "focus:outline-none focus:border-primary/50 focus:bg-background/80",
              "transition-all duration-150 disabled:opacity-60"
            )}
          />
          <button
            type="submit"
            disabled={!text.trim() || isPending}
            className={cn(
              "flex items-center gap-1.5 h-10 px-4 rounded-lg text-sm font-medium shrink-0",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-[0.97]",
              "transition-all duration-100",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "shadow-sm shadow-primary/20"
            )}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {isPending ? "Parsing..." : "Parse"}
            </span>
          </button>
        </form>

        {/* Hint */}
        <p className="mt-2.5 text-[11px] text-muted-foreground/50 leading-relaxed">
          Describe your task in plain English — AI extracts title, date, priority &amp; category.
          <span className="text-primary/60"> You always review before saving.</span>
        </p>
      </div>
    </div>
  );
}
