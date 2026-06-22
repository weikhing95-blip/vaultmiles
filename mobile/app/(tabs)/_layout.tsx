import { Tabs } from "expo-router";
import { Text } from "react-native";
import { T } from "../../constants/theme";
import { HoldingsProvider } from "../../context/holdings";

function TabIcon({ char, focused }: { char: string; focused: boolean }) {
  return <Text style={{ color: focused ? T.auroraPrimary : T.faint, fontSize: 20 }}>{char}</Text>;
}

export default function TabLayout() {
  return (
    <HoldingsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: T.surface,
            borderTopColor: T.border,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarActiveTintColor: T.auroraPrimary,
          tabBarInactiveTintColor: T.faint,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Wallet",
            tabBarIcon: ({ focused }) => <TabIcon char="▤" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="fly"
          options={{
            title: "Fly",
            tabBarIcon: ({ focused }) => <TabIcon char="✈" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "Progress",
            tabBarIcon: ({ focused }) => <TabIcon char="◎" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "You",
            tabBarIcon: ({ focused }) => <TabIcon char="⚙" focused={focused} />,
          }}
        />
      </Tabs>
    </HoldingsProvider>
  );
}
