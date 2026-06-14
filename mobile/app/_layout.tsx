import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { T } from "../constants/theme";

export default function RootLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    if (!user && !inAuth) router.replace("/(auth)/login");
    if (user && inAuth) router.replace("/(tabs)");
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: T.bg }}>
        <ActivityIndicator color={T.gold} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: T.bg },
      }}
    />
  );
}
