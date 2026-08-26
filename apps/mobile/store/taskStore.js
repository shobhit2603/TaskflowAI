import { create } from "zustand";

export const useTaskStore = create((set, get) => ({
  filters: {
    search: "",
    priority: "",
    completed: false,
    sortBy: "createdAt",
    order: "desc",
    page: 1,
    limit: 20,
  },
  activeTab: "pending",
  isFormOpen: false,
  editingTask: null,

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value, page: 1 } })),

  setActiveTab: (tab) => {
    const completedMap = { pending: false, completed: true };
    set({
      activeTab: tab,
      filters: {
        ...get().filters,
        completed: completedMap[tab],
        page: 1,
      },
    });
  },

  openForm: (task = null) => set({ isFormOpen: true, editingTask: task }),
  closeForm: () => set({ isFormOpen: false, editingTask: null }),
}));
