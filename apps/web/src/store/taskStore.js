"use client";

import { create } from "zustand";

export const useTaskStore = create((set, get) => ({
  // ─── Active filters ──────────────────────────────────────────────────────
  filters: {
    search: "",
    priority: "",
    category: "",
    completed: false, // Default: show pending tasks
    sortBy: "createdAt",
    order: "desc",
    page: 1,
    limit: 20,
  },

  // ─── UI state ────────────────────────────────────────────────────────────
  activeTab: "pending",
  isTaskFormOpen: false,
  editingTask: null,
  isSidebarOpen: true,       // desktop sidebar collapsed/expanded
  isMobileSidebarOpen: false, // mobile sheet open/closed

  // ─── Filter actions ───────────────────────────────────────────────────────
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: 1 },
    })),

  resetFilters: () =>
    set((state) => ({
      filters: {
        search: "",
        priority: "",
        category: "",
        completed: state.filters.completed, // keep tab filter
        sortBy: "createdAt",
        order: "desc",
        page: 1,
        limit: 20,
      },
    })),

  setPage: (page) =>
    set((state) => ({ filters: { ...state.filters, page } })),

  setActiveTab: (tab) => {
    const completedMap = {
      pending: false,
      completed: true,
      reminders: undefined,
    };
    set({
      activeTab: tab,
      filters: {
        ...get().filters,
        completed: completedMap[tab],
        page: 1,
      },
    });
  },

  // ─── Task form actions ────────────────────────────────────────────────────
  openTaskForm: (task = null) =>
    set({ isTaskFormOpen: true, editingTask: task }),

  closeTaskForm: () =>
    set({ isTaskFormOpen: false, editingTask: null }),

  // ─── Sidebar actions ──────────────────────────────────────────────────────
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setMobileSidebarOpen: (open) =>
    set({ isMobileSidebarOpen: open }),
}));
