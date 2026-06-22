import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import { T } from "../../constants/theme";

export default function LoginScreen() {
  const { signUp, signIn } = useAuth();

  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kfNum, setKfNum] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  async function handleSubmit() {
    setError("");

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const result = await signUp(email.trim(), password, name.trim(), kfNum.trim());
        if (result === "confirm_email") setPendingConfirm(true);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isSignUp = mode === "signup";

  if (pendingConfirm) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.scrollContent}>
          <View style={styles.brand}>
            <Text style={styles.appName}>
              {"Vault"}
              <Text style={styles.appNameGold}>{"Miles"}</Text>
            </Text>
          </View>
          <View
            style={[styles.modeRow, { borderColor: "transparent", backgroundColor: "transparent" }]}
          >
            <View style={{ flex: 1, alignItems: "center", paddingVertical: 8 }}>
              <Text
                style={{
                  fontFamily: T.mono,
                  fontSize: 28,
                  color: T.auroraPrimary,
                  marginBottom: 16,
                }}
              >
                ☑
              </Text>
              <Text
                style={{
                  fontFamily: T.display,
                  fontSize: 22,
                  fontWeight: "bold",
                  color: T.ink,
                  marginBottom: 8,
                }}
              >
                Check your inbox
              </Text>
              <Text
                style={{
                  fontFamily: T.mono,
                  fontSize: 12,
                  color: T.mist,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {"We sent a confirmation link to\n"}
                <Text style={{ color: T.auroraPrimary }}>{email}</Text>
                {"\n\nOpen it to activate your account."}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setPendingConfirm(false);
              setMode("signin");
            }}
          >
            <Text style={styles.buttonText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brand}>
            <Text style={styles.appName}>
              {"Vault"}
              <Text style={styles.appNameGold}>{"Miles"}</Text>
            </Text>
            <Text style={styles.tagline}>YOUR KRISFLYER MILES, CONSOLIDATED.</Text>
          </View>

          {/* Mode toggle */}
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, isSignUp && styles.modeBtnActive]}
              onPress={() => {
                setMode("signup");
                setError("");
              }}
            >
              <Text style={[styles.modeBtnText, isSignUp && styles.modeBtnTextActive]}>
                Create account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, !isSignUp && styles.modeBtnActive]}
              onPress={() => {
                setMode("signin");
                setError("");
              }}
            >
              <Text style={[styles.modeBtnText, !isSignUp && styles.modeBtnTextActive]}>
                Sign in
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            {/* Name — sign up only */}
            {isSignUp && (
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Jane Tan"
                  placeholderTextColor={T.faint}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="jane@example.com"
                placeholderTextColor={T.faint}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={isSignUp ? "Min. 6 characters" : "Your password"}
                placeholderTextColor={T.faint}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType={isSignUp ? "next" : "done"}
                onSubmitEditing={isSignUp ? undefined : handleSubmit}
              />
            </View>

            {/* KrisFlyer number — sign up only */}
            {isSignUp && (
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>
                  {"KRISFLYER NUMBER "}
                  <Text style={styles.optionalNote}>(optional)</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={kfNum}
                  onChangeText={setKfNum}
                  placeholder="e.g. 1234567890"
                  placeholderTextColor={T.faint}
                  keyboardType="number-pad"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            )}

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#0E1117" />
              ) : (
                <Text style={styles.buttonText}>{isSignUp ? "Create account →" : "Sign in →"}</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              {isSignUp
                ? "Your data syncs securely to the cloud."
                : "Data synced to your account across devices."}
            </Text>
          </View>

          {/* Feature bullets — sign up only */}
          {isSignUp && (
            <View style={styles.bullets}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletIcon}>📷</Text>
                <View style={styles.bulletText}>
                  <Text style={styles.bulletTitle}>Scan any bank screenshot</Text>
                  <Text style={styles.bulletDesc}>AI reads your balance automatically</Text>
                </View>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletIcon}>✦</Text>
                <View style={styles.bulletText}>
                  <Text style={styles.bulletTitle}>All Singapore banks</Text>
                  <Text style={styles.bulletDesc}>
                    DBS, UOB, OCBC, Citi, HSBC, SC, Amex, Maybank
                  </Text>
                </View>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletIcon}>☁</Text>
                <View style={styles.bulletText}>
                  <Text style={styles.bulletTitle}>Syncs across devices</Text>
                  <Text style={styles.bulletDesc}>
                    Your miles are safe, even if you change phones
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: T.bg },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 48 },

  brand: { alignItems: "center", marginBottom: 28 },
  appName: {
    fontFamily: T.display,
    fontSize: 36,
    fontWeight: "bold",
    color: T.ink,
    letterSpacing: 0.5,
  },
  appNameGold: { color: T.gold },
  tagline: { fontFamily: T.mono, fontSize: 11, color: T.faint, letterSpacing: 2, marginTop: 8 },

  modeRow: {
    flexDirection: "row",
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    padding: 3,
    marginBottom: 16,
  },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  modeBtnActive: { backgroundColor: T.auroraPrimary },
  modeBtnText: { fontFamily: T.mono, fontSize: 11, color: T.faint, letterSpacing: 1 },
  modeBtnTextActive: { color: "#fff", fontWeight: "bold" },

  card: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  fieldGroup: { marginBottom: 16 },
  inputLabel: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.mist,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  optionalNote: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textTransform: "lowercase",
    letterSpacing: 0,
  },
  input: {
    backgroundColor: T.surfaceHi,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 10,
    color: T.ink,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 6,
  },

  errorBox: {
    backgroundColor: T.warnDim,
    borderWidth: 1,
    borderColor: T.warn,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  errorText: { fontFamily: T.mono, fontSize: 12, color: T.warn },

  button: {
    backgroundColor: T.auroraPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  disclaimer: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textAlign: "center",
    marginTop: 12,
  },

  bullets: { gap: 16 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  bulletIcon: { fontSize: 20, lineHeight: 24, width: 28, textAlign: "center" },
  bulletText: { flex: 1 },
  bulletTitle: { fontSize: 13, fontWeight: "500", color: T.ink, marginBottom: 2 },
  bulletDesc: { fontFamily: T.mono, fontSize: 11, color: T.mist },
});
