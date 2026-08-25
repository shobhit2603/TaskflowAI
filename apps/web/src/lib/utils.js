import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — combines clsx + tailwind-merge.
 *
 * Why both?
 *  - clsx: handles conditional class names cleanly (arrays, objects, falsy values)
 *  - tailwind-merge: resolves Tailwind conflicts (e.g. "p-4 p-6" → "p-6")
 *
 * This is the standard shadcn/ui utility. Every component uses it.
 *
 * @param {...any} inputs - class names, arrays, or objects
 * @returns {string} - merged, deduplicated class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * formatDate — formats a date string or Date object for display.
 * @param {string|Date} date
 * @param {object} options - Intl.DateTimeFormat options
 */
export function formatDate(date, options = {}) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

/**
 * formatRelativeDate — returns a human-friendly relative date label.
 * e.g. "Today", "Tomorrow", "Yesterday", "Aug 28"
 * @param {string|Date} date
 */
export function formatRelativeDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diffMs = d - today;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= 7) return `In ${diffDays} days`;
  return formatDate(date);
}

/**
 * isPastDue — true if a task's due date has already passed.
 * @param {string|Date} date
 */
export function isPastDue(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

/**
 * getPriorityConfig — returns colour class + label for a priority value.
 * Centralised so priority colouring is consistent everywhere.
 */
export function getPriorityConfig(priority) {
  const configs = {
    high: {
      label: "High",
      badge: "bg-red-500/15 text-red-400 border-red-500/20",
      dot: "bg-red-500",
    },
    medium: {
      label: "Medium",
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      dot: "bg-amber-500",
    },
    low: {
      label: "Low",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-500",
    },
  };
  return configs[priority] ?? configs.medium;
}
