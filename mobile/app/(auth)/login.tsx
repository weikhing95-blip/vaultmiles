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
import { thisMonth } from "../../lib/calculator";
import { T } from "../../constants/theme";

export default function LoginScreen() {
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kfNum, setKfNum] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [kfFocused, setKfFocused] = useState(false);

  async function handleSubmit() {
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    await login({ name: name.trim(), email: email.trim(), kfNum: kfNum.trim(), joinedAt: thisMonth() });
    setSubmitting(false);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
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
            <Text style={styles.tagline}>YOUR KRIISFLYER MILES, CONSOLIDATED.</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>SIGN IN</Text>

            {/* Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={[styles.input, nameFocused && styles.inputFocused]}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                placeholder="Jane Tan"
                placeholderTextColor={T.faint}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="jane@example.com"
                placeholderTextColor={T.faint}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* KrisFlyer number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>
                {"KRIISFLYER NUMBER "}
                <Text style={styles.optionalNote}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, kfFocused && styles.inputFocused]}
                value={kfNum}
                onChangeText={setKfNum}
                onFocus={() => setKfFocused(true)}
                onBlur={() => setKfFocused(false)}
                placeholder="123456789"
                placeholderTextColor={T.faint}
                keyboardType="number-pad"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

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
                <Text style={styles.buttonText}>Continue →</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>Data stored locally on this device only.</Text>
          </View>

          {/* Feature bullets */}
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
                <Text style={styles.bulletDesc}>DBS, UOB, OCBC, Citi, HSBC, SC, Amex</Text>
              </View>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletIcon}>◎</Text>
              <View style={styles.bulletText}>
                <Text style={styles.bulletTitle}>Track month by month</Text>
                <Text style={styles.bulletDesc}>Watch your miles grow over time</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: T.bg,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },

  /* Brand */
  brand: {
    alignItems: "center",
    marginBottom: 36,
  },
  appName: {
    fontFamily: T.display,
    fontSize: 36,
    fontWeight: "bold",
    color: T.ink,
    letterSpacing: 0.5,
  },
  appNameGold: {
    color: T.gold,
  },
  tagline: {
    fontFamily: T.mono,
    fontSize: 12,
    color: T.faint,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 8,
  },

  /* Card */
  card: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  cardLabel: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 20,
  },

  /* Fields */
  fieldGroup: {
    marginBottom: 16,
  },
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
    letterSpacing: 0,
    textTransform: "lowercase",
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
  inputFocused: {
    borderColor: T.gold,
  },

  /* Error */
  errorBox: {
    backgroundColor: T.warnDim,
    borderWidth: 1,
    borderColor: T.warn,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: T.mono,
    fontSize: 12,
    color: T.warn,
  },

  /* Button */
  button: {
    backgroundColor: T.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#0E1117",
    fontSize: 15,
    fontWeight: "bold",
  },

  /* Disclaimer */
  disclaimer: {
    fontFamily: T.mono,
    fontSize: 10,
    color: T.faint,
    textAlign: "center",
    marginTop: 12,
  },

  /* Bullets */
  bullets: {
    gap: 16,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  bulletIcon: {
    fontSize: 20,
    lineHeight: 24,
    width: 28,
    textAlign: "center",
  },
  bulletText: {
    flex: 1,
  },
  bulletTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: T.ink,
    marginBottom: 2,
  },
  bulletDesc: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.mist,
  },
});
