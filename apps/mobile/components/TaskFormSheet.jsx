import {
  View, Text, TextInput, TouchableOpacity, Modal,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTaskStore } from "../store/taskStore";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";
import { useSuggestCategory } from "../hooks/useAI";

const C = {
  bg: "#09090f",
  sheet: "#13131f",
  card: "#1a1a28",
  border: "rgba(255,255,255,0.08)",
  primary: "#7c3aed",
  text: "#f0f0f8",
  muted: "#666677",
};

const PRIORITIES = [
  { value: "low",    label: "Low",    color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  { value: "medium", label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  { value: "high",   label: "High",   color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
];

export default function TaskFormSheet() {
  const { isFormOpen, editingTask, closeForm } = useTaskStore();
  const { mutate: create, isPending: isCreating } = useCreateTask();
  const { mutate: update, isPending: isUpdating } = useUpdateTask();
  const { mutate: suggest, data: suggestion } = useSuggestCategory();

  const isEditing = !!(editingTask?.id);
  const isPending = isCreating || isUpdating;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");

  // Pre-fill on open
  useEffect(() => {
    if (isFormOpen) {
      if (editingTask) {
        setTitle(editingTask.title || "");
        setDescription(editingTask.description || "");
        setPriority(editingTask.priority || "medium");
        setCategory(editingTask.category || "");
      } else {
        setTitle(""); setDescription(""); setPriority("medium"); setCategory("");
      }
    }
  }, [isFormOpen, editingTask]);

  // AI suggestion when title changes
  useEffect(() => {
    if (!isEditing && title.length > 5) {
      const t = setTimeout(() => suggest({ title, description }), 900);
      return () => clearTimeout(t);
    }
  }, [title, isEditing]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const payload = { title: title.trim(), description, priority, category };
    if (isEditing) {
      update({ id: editingTask.id, ...payload });
    } else {
      create(payload);
    }
  };

  return (
    <Modal
      visible={isFormOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeForm}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: C.sheet }}
      >
        {/* Handle bar */}
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.border }} />
        </View>

        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 20, paddingVertical: 14,
          borderBottomWidth: 1, borderBottomColor: C.border,
        }}>
          <Text style={{ fontSize: 17, fontWeight: "700", color: C.text }}>
            {isEditing ? "Edit task" : "New task"}
          </Text>
          <TouchableOpacity onPress={closeForm}>
            <Ionicons name="close" size={22} color={C.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">

          {/* Title */}
          <View>
            <Text style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>TITLE *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={C.muted}
              style={{
                height: 52, backgroundColor: C.card, borderRadius: 14,
                paddingHorizontal: 16, color: C.text, fontSize: 15,
                borderWidth: 1, borderColor: C.border,
              }}
              autoFocus
            />
            {/* AI suggestion */}
            {suggestion && !isEditing && (
              <TouchableOpacity
                onPress={() => { setCategory(suggestion.category); setPriority(suggestion.priority); }}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 6,
                  marginTop: 10, padding: 10, borderRadius: 10,
                  backgroundColor: "rgba(124,58,237,0.08)",
                  borderWidth: 1, borderColor: "rgba(124,58,237,0.2)",
                }}
              >
                <Text style={{ fontSize: 12, color: "rgba(167,139,250,0.7)" }}>AI suggests:</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#a78bfa" }}>
                  ✦ {suggestion.category} · {suggestion.priority}
                </Text>
                <Text style={{ fontSize: 11, color: C.muted }}>Tap to apply</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notes */}
          <View>
            <Text style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>NOTES</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add details..."
              placeholderTextColor={C.muted}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: C.card, borderRadius: 14,
                paddingHorizontal: 16, paddingTop: 14,
                color: C.text, fontSize: 14,
                borderWidth: 1, borderColor: C.border,
                minHeight: 80, textAlignVertical: "top",
              }}
            />
          </View>

          {/* Priority toggle */}
          <View>
            <Text style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>PRIORITY</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {PRIORITIES.map((p) => {
                const active = priority === p.value;
                return (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => setPriority(p.value)}
                    style={{
                      flex: 1, height: 44, borderRadius: 12,
                      alignItems: "center", justifyContent: "center",
                      flexDirection: "row", gap: 6,
                      backgroundColor: active ? p.bg : C.card,
                      borderWidth: 1.5,
                      borderColor: active ? p.color + "60" : C.border,
                    }}
                  >
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: p.color }} />
                    <Text style={{ fontSize: 13, fontWeight: "600", color: active ? p.color : C.muted }}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category */}
          <View>
            <Text style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>CATEGORY</Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="work, personal, health…"
              placeholderTextColor={C.muted}
              style={{
                height: 48, backgroundColor: C.card, borderRadius: 12,
                paddingHorizontal: 16, color: C.text, fontSize: 14,
                borderWidth: 1, borderColor: C.border,
              }}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!title.trim() || isPending}
            activeOpacity={0.85}
            style={{
              height: 52, borderRadius: 16,
              backgroundColor: C.primary,
              alignItems: "center", justifyContent: "center",
              opacity: !title.trim() || isPending ? 0.5 : 1,
              shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
            }}
          >
            {isPending
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                  {isEditing ? "Save changes" : "Create task"}
                </Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
