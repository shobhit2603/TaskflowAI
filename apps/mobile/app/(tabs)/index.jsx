import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert
} from "react-native";
import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTasks, useToggleTask, useDeleteTask } from "../../hooks/useTasks";
import { useTaskStore } from "../../store/taskStore";
import { useAuthStore } from "../../store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "../../hooks/useTasks";
import TaskFormSheet from "../../components/TaskFormSheet";
import AIQuickAdd from "../../components/AIQuickAdd";

const C = {
  bg: "#09090f",
  card: "#111118",
  border: "rgba(255,255,255,0.07)",
  primary: "#7c3aed",
  primaryLight: "rgba(124,58,237,0.12)",
  text: "#f0f0f8",
  muted: "#666677",
  mutedLight: "#444455",
  error: "#f87171",
  success: "#34d399",
  amber: "#fbbf24",
};

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Done" },
];

const PRIORITY_COLORS = {
  high: { dot: "#ef4444", bg: "rgba(239,68,68,0.12)", text: "#f87171" },
  medium: { dot: "#f59e0b", bg: "rgba(245,158,11,0.12)", text: "#fbbf24" },
  low: { dot: "#10b981", bg: "rgba(16,185,129,0.12)", text: "#34d399" },
};

function TaskCard({ task }) {
  const { mutate: toggle } = useToggleTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { openForm } = useTaskStore();
  const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const taskId = task.id || task._id;

  const handleDelete = () => {
    Alert.alert("Delete Task", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTask(taskId) },
    ]);
  };

  const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <View style={{
      flexDirection: "row", alignItems: "flex-start",
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: C.border,
    }}>
      {/* Toggle circle */}
      <TouchableOpacity
        onPress={() => toggle(taskId)}
        style={{
          width: 22, height: 22, borderRadius: 11,
          borderWidth: 2,
          borderColor: task.completed ? C.success : C.mutedLight,
          backgroundColor: task.completed ? C.success : "transparent",
          alignItems: "center", justifyContent: "center",
          marginTop: 1, marginRight: 12, flexShrink: 0,
        }}
      >
        {task.completed && <Ionicons name="checkmark" size={13} color="#fff" />}
      </TouchableOpacity>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 14, fontWeight: "600", color: task.completed ? C.muted : C.text,
          textDecorationLine: task.completed ? "line-through" : "none",
          lineHeight: 20,
        }}>
          {task.title}
        </Text>

        {task.description ? (
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 3 }} numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          {/* Priority badge */}
          <View style={{ backgroundColor: p.bg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: p.dot }} />
            <Text style={{ fontSize: 11, fontWeight: "600", color: p.text }}>{task.priority}</Text>
          </View>

          {/* Category */}
          {task.category && task.category !== "general" && (
            <View style={{ backgroundColor: C.mutedLight, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text style={{ fontSize: 11, color: C.muted }}>{task.category}</Text>
            </View>
          )}

          {/* Due date */}
          {task.dueDate && (
            <Text style={{ fontSize: 11, color: new Date(task.dueDate) < new Date() && !task.completed ? C.error : C.muted }}>
              📅 {formatDate(task.dueDate)}
            </Text>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: "row", gap: 4, marginLeft: 8 }}>
        <TouchableOpacity onPress={() => openForm(task)} style={{ padding: 6 }}>
          <Ionicons name="pencil-outline" size={16} color={C.muted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={{ padding: 6 }}>
          <Ionicons name="trash-outline" size={16} color={C.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TasksScreen() {
  const { user } = useAuthStore();
  const { activeTab, setActiveTab, openForm } = useTaskStore();
  const { data, isLoading, isFetching } = useTasks();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const tasks = data?.tasks ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: taskKeys.lists() });
    setRefreshing(false);
  }, [qc]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: C.text, letterSpacing: -0.5 }}>
            {greeting},{" "}
            <Text style={{ color: C.primary }}>{user?.name?.split(" ")[0]}</Text> 👋
          </Text>
          <Text style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            Here's your task overview
          </Text>
        </View>

        {/* AI Quick Add */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <AIQuickAdd />
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", paddingHorizontal: 16, marginBottom: 4 }}>
          {TABS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              style={{
                paddingHorizontal: 18, paddingVertical: 8,
                borderRadius: 20, marginRight: 8,
                backgroundColor: activeTab === key ? C.primaryLight : "transparent",
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: "700",
                color: activeTab === key ? C.primary : C.muted,
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task list */}
        <View style={{
          marginHorizontal: 16, borderRadius: 16,
          backgroundColor: C.card, borderWidth: 1,
          borderColor: C.border, overflow: "hidden",
          marginBottom: 100,
        }}>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator color={C.primary} />
            </View>
          ) : tasks.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 32, marginBottom: 12 }}>
                {activeTab === "pending" ? "✅" : "📭"}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "700", color: C.text, marginBottom: 6 }}>
                {activeTab === "pending" ? "All caught up!" : "Nothing completed yet"}
              </Text>
              <Text style={{ fontSize: 13, color: C.muted, textAlign: "center" }}>
                {activeTab === "pending"
                  ? "Tap + to add a new task"
                  : "Complete tasks to see them here"}
              </Text>
            </View>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => openForm()}
        style={{
          position: "absolute", bottom: 80, right: 20,
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: C.primary,
          alignItems: "center", justifyContent: "center",
          shadowColor: C.primary, shadowOpacity: 0.5,
          shadowRadius: 16, elevation: 10,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Task Form */}
      <TaskFormSheet />
    </SafeAreaView>
  );
}
