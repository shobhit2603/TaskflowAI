import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";

const C = {
  bg: "#09090f",
  card: "#111118",
  border: "rgba(255,255,255,0.07)",
  primary: "#7c3aed",
  text: "#f0f0f8",
  muted: "#666677",
  error: "#f87171",
};

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const logout = useLogout();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const infoRows = [
    { icon: "person-outline", label: "Name", value: user?.name },
    { icon: "mail-outline", label: "Email", value: user?.email },
    { icon: "shield-checkmark-outline", label: "Auth", value: "JWT • Secure" },
    { icon: "sparkles-outline", label: "AI Model", value: "Mistral AI" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: C.text, letterSpacing: -0.5, marginBottom: 24 }}>
          Profile
        </Text>

        {/* Avatar */}
        <View style={{ alignItems: "center", marginBottom: 28 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: "rgba(124,58,237,0.15)",
            borderWidth: 2, borderColor: "rgba(124,58,237,0.3)",
            alignItems: "center", justifyContent: "center",
            marginBottom: 12,
          }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: C.primary }}>{initials}</Text>
          </View>
          <Text style={{ fontSize: 17, fontWeight: "700", color: C.text }}>{user?.name}</Text>
          <Text style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{user?.email}</Text>
        </View>

        {/* Info rows */}
        <View style={{
          backgroundColor: C.card, borderRadius: 16,
          borderWidth: 1, borderColor: C.border, overflow: "hidden",
          marginBottom: 20,
        }}>
          {infoRows.map(({ icon, label, value }, i) => (
            <View
              key={label}
              style={{
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: 16, paddingVertical: 14,
                borderBottomWidth: i < infoRows.length - 1 ? 1 : 0,
                borderBottomColor: C.border,
              }}
            >
              <View style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: "rgba(124,58,237,0.1)",
                alignItems: "center", justifyContent: "center", marginRight: 12,
              }}>
                <Ionicons name={icon} size={16} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: C.muted, marginBottom: 1 }}>{label}</Text>
                <Text style={{ fontSize: 14, color: C.text, fontWeight: "500" }}>{value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          onPress={logout}
          activeOpacity={0.8}
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            gap: 8, height: 50, borderRadius: 14,
            backgroundColor: "rgba(248,113,113,0.1)",
            borderWidth: 1, borderColor: "rgba(248,113,113,0.2)",
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={C.error} />
          <Text style={{ color: C.error, fontWeight: "700", fontSize: 14 }}>Sign out</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: "center", color: C.muted, fontSize: 11, marginTop: 24, opacity: 0.5 }}>
          TaskflowAI v1.0.0 • Built with Expo + Mistral AI
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
