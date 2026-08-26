import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { useLogin } from "../../hooks/useAuth";

const C = {
  bg: "#09090f",
  card: "#111118",
  border: "rgba(255,255,255,0.08)",
  primary: "#7c3aed",
  primaryLight: "rgba(124,58,237,0.15)",
  text: "#f0f0f8",
  muted: "#888899",
  error: "#f87171",
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, error } = useLogin();

  const handleLogin = () => {
    if (!email || !password) return;
    login({ email: email.trim(), password });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: C.bg }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View style={{
            width: 52, height: 52, borderRadius: 16,
            backgroundColor: C.primary,
            alignItems: "center", justifyContent: "center",
            marginBottom: 16,
            shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8
          }}>
            <Text style={{ fontSize: 22, color: "#fff" }}>⚡</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: C.text, letterSpacing: -0.5 }}>
            TaskflowAI
          </Text>
          <Text style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            AI-powered task management
          </Text>
        </View>

        {/* Form card */}
        <View style={{
          backgroundColor: C.card,
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: C.border,
        }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: C.text, marginBottom: 4 }}>
            Welcome back
          </Text>
          <Text style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
            Sign in to continue
          </Text>

          {/* Error */}
          {error && (
            <View style={{
              backgroundColor: "rgba(248,113,113,0.1)", borderRadius: 10,
              borderWidth: 1, borderColor: "rgba(248,113,113,0.2)",
              padding: 12, marginBottom: 16
            }}>
              <Text style={{ fontSize: 12, color: C.error }}>{error.message}</Text>
            </View>
          )}

          {/* Email */}
          <Text style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={C.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              height: 48, backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 12, paddingHorizontal: 16,
              color: C.text, fontSize: 14,
              borderWidth: 1, borderColor: C.border,
              marginBottom: 16,
            }}
          />

          {/* Password */}
          <Text style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={C.muted}
            secureTextEntry
            style={{
              height: 48, backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 12, paddingHorizontal: 16,
              color: C.text, fontSize: 14,
              borderWidth: 1, borderColor: C.border,
              marginBottom: 24,
            }}
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isPending || !email || !password}
            activeOpacity={0.85}
            style={{
              height: 50, borderRadius: 14,
              backgroundColor: C.primary,
              alignItems: "center", justifyContent: "center",
              opacity: isPending || !email || !password ? 0.6 : 1,
              shadowColor: C.primary, shadowOpacity: 0.35,
              shadowRadius: 12, elevation: 6,
            }}
          >
            {isPending
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Sign in →</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Link */}
        <Text style={{ textAlign: "center", marginTop: 24, color: C.muted, fontSize: 13 }}>
          No account?{" "}
          <Link href="/(auth)/signup">
            <Text style={{ color: C.text, fontWeight: "600" }}>Sign up free</Text>
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
