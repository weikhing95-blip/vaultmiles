import { Tabs } from "expo-router";
import { Text } from "react-native";
import { T } from "../../constants/theme";

function TabIcon({ char, focused }: { char: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? T.gold : T.faint, fontSize: 20 }}>
      {char}
    </Text>
  );
}

export default function TabLayout() {
  return (
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
        tabBarActiveTintColor: T.gold,
        tabBarInactiveTintColor: T.faint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Cards",
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
          title: "History",
          tabBarIcon: ({ focused }) => <TabIcon char="◎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <TabIcon char="⚙" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
