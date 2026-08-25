"use client";

import { useEffect, useState } from "react";
import { Search, X, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTaskStore } from "@/store/taskStore";
import { cn } from "@/lib/utils";

export default function TaskFilters() {
  const { filters, setFilter, resetFilters } = useTaskStore();
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  useEffect(() => {
    const t = setTimeout(() => setFilter("search", localSearch), 400);
    return () => clearTimeout(t);
  }, [localSearch, setFilter]);

  const hasFilters = localSearch || filters.priority;

  return (
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search tasks..."
          className={cn(
            "w-full h-8 pl-8 pr-3 rounded-lg text-xs",
            "bg-muted/50 border border-border/50",
            "placeholder:text-muted-foreground/50 text-foreground",
            "focus:outline-none focus:border-primary/50 focus:bg-muted/80",
            "transition-colors duration-100"
          )}
        />
        {localSearch && (
          <button
            onClick={() => { setLocalSearch(""); setFilter("search", ""); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Priority */}
      <Select
        value={filters.priority || "all"}
        onValueChange={(v) => setFilter("priority", v === "all" ? "" : v)}
      >
        <SelectTrigger className="h-8 w-auto min-w-25 text-xs bg-muted/50 border-border/50">
          <SlidersHorizontal className="h-3 w-3 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">All</SelectItem>
          <SelectItem value="high" className="text-xs">🔴 High</SelectItem>
          <SelectItem value="medium" className="text-xs">🟡 Medium</SelectItem>
          <SelectItem value="low" className="text-xs">🟢 Low</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={`${filters.sortBy}-${filters.order}`}
        onValueChange={(v) => {
          const [sortBy, order] = v.split("-");
          setFilter("sortBy", sortBy);
          setFilter("order", order);
        }}
      >
        <SelectTrigger className="h-8 w-auto min-w-27.5 text-xs bg-muted/50 border-border/50">
          <ArrowUpDown className="h-3 w-3 mr-1.5 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt-desc" className="text-xs">Newest</SelectItem>
          <SelectItem value="createdAt-asc" className="text-xs">Oldest</SelectItem>
          <SelectItem value="dueDate-asc" className="text-xs">Due date ↑</SelectItem>
          <SelectItem value="priority-desc" className="text-xs">Priority</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <button
          onClick={() => { resetFilters(); setLocalSearch(""); }}
          className="h-8 px-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
