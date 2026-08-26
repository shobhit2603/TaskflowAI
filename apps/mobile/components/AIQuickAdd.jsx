import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useParseTask } from "../hooks/useAI";
import { useTaskStore } from "../store/taskStore";

const C = {
  card: "#111118",
  border: "rgba(255,255,255,0.08)",
  primary: "#7c3aed",
  primaryLight: "rgba(124,58,237,0.12)",
  text: "#f0f0f8",
  muted: "#666677",
};

/**
 * AIQuickAdd — same concept as the web component.
 * User types a natural language task description → AI parses it →
 * opens the form pre-filled. User always reviews before saving.
 */
export default function AIQuickAdd() {
  const [text, setText] = useState("");
  const { mutate: parse, isPending } = useParseTask();
  const { openForm } = useTaskStore();

  const handleParse = () => {
    if (!text.trim() || isPending) return;
    parse(text, {
      onSuccess: (data) => {
        openForm(data.parsed);
        setText("");
      },
    });
  };

  return (
    <View style={{
      backgroundColor: C.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: C.border,
      padding: 14,
    }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <View style={{
          width: 26, height: 26, borderRadius: 8,
          backgroundColor: C.primaryLight,
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name="sparkles" size={14} color={C.primary} />
        </View>
        <Text style={{ fontSize: 13, fontWeight: "700", color: C.text }}>AI Quick Add</Text>
        <View style={{
          marginLeft: "auto", paddingHorizontal: 8, paddingVertical: 3,
          backgroundColor: C.primaryLight,
          borderRadius: 20, borderWidth: 1, borderColor: "rgba(124,58,237,0.25)",
        }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: C.primary }}>Mistral AI</Text>
        </View>
      </View>

      {/* Input row */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder='e.g. "Call vendor Friday, urgent"'
          placeholderTextColor={C.muted}
          style={{
            flex: 1, height: 42,
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: 10, paddingHorizontal: 14,
            color: C.text, fontSize: 13,
            borderWidth: 1, borderColor: C.border,
          }}
          returnKeyType="send"
          onSubmitEditing={handleParse}
        />
        <TouchableOpacity
          onPress={handleParse}
          disabled={!text.trim() || isPending}
          style={{
            width: 42, height: 42, borderRadius: 10,
            backgroundColor: C.primary,
            alignItems: "center", justifyContent: "center",
            opacity: !text.trim() || isPending ? 0.5 : 1,
          }}
        >
          {isPending
            ? <ActivityIndicator color="#fff" size="small" />
            : <Ionicons name="arrow-forward" size={18} color="#fff" />
          }
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 10, color: C.muted, marginTop: 8, lineHeight: 14 }}>
        Describe your task in plain English — AI extracts title, priority &amp; category.
        You review before saving.
      </Text>
    </View>
  );
}
