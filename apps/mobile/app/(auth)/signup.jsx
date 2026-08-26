import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { useSignup } from "../../hooks/useAuth";

const C = {
  bg: "#09090f",
  card: "#111118",
  border: "rgba(255,255,255,0.08)",
  primary: "#7c3aed",
  text: "#f0f0f8",
  muted: "#888899",
  error: "#f87171",
};

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: signup, isPending, error } = useSignup();

  const handleSignup = () => {
    if (!name || !email || !password) return;
    signup({ name: name.trim(), email: email.trim(), password });
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
            backgroundColor: C.primary, alignItems: "center", justifyContent: "center",
            marginBottom: 16,
            shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
          }}>
            <Text style={{ fontSize: 22, color: "#fff" }}>⚡</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: C.text, letterSpacing: -0.5 }}>
            TaskflowAI
          </Text>
          <Text style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            Create your free account
          </Text>
        </View>

        <View style={{
          backgroundColor: C.card, borderRadius: 20,
          padding: 24, borderWidth: 1, borderColor: C.border,
        }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: C.text, marginBottom: 4 }}>
            Create account
          </Text>
          <Text style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
            Start managing tasks smarter with AI
          </Text>

          {error && (
            <View style={{
              backgroundColor: "rgba(248,113,113,0.1)", borderRadius: 10,
              borderWidth: 1, borderColor: "rgba(248,113,113,0.2)",
              padding: 12, marginBottom: 16,
            }}>
              <Text style={{ fontSize: 12, color: C.error }}>{error.message}</Text>
            </View>
          )}

          {[
            { label: "Full name", value: name, setter: setName, placeholder: "Your Name", type: "default" },
            { label: "Email", value: email, setter: setEmail, placeholder: "you@example.com", type: "email-address" },
            { label: "Password", value: password, setter: setPassword, placeholder: "Min 8 chars, uppercase, number", secure: true },
          ].map(({ label, value, setter, placeholder, type, secure }) => (
            <View key={label} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{label}</Text>
              <TextInput
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor={C.muted}
                keyboardType={type || "default"}
                autoCapitalize={type === "email-address" ? "none" : "words"}
                autoCorrect={false}
                secureTextEntry={secure}
                style={{
                  height: 48, backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 12, paddingHorizontal: 16,
                  color: C.text, fontSize: 14,
                  borderWidth: 1, borderColor: C.border,
                }}
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={handleSignup}
            disabled={isPending || !name || !email || !password}
            activeOpacity={0.85}
            style={{
              height: 50, borderRadius: 14, marginTop: 8,
              backgroundColor: C.primary,
              alignItems: "center", justifyContent: "center",
              opacity: isPending || !name || !email || !password ? 0.6 : 1,
              shadowColor: C.primary, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
            }}
          >
            {isPending
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Create account →</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: "center", marginTop: 24, color: C.muted, fontSize: 13 }}>
          Already have an account?{" "}
          <Link href="/(auth)/login">
            <Text style={{ color: C.text, fontWeight: "600" }}>Sign in</Text>
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
