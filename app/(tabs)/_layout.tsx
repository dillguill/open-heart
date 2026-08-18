/**
 * Tab navigation — Home, Records, Trends, Settings.
 * Doctor Summary moved out of the tabs into a full-screen route (app/doctor-summary.tsx),
 * reached from the Home callout. Real authored SVG icons, labels at 11px+ (critique P0).
 */
import { Tabs } from "expo-router";

import { colors, fonts } from "../../src/theme/tokens";
import { HomeIcon, RecordsIcon, SettingsIcon, TrendsIcon } from "../../src/components/icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.paper },
        headerTitleStyle: { fontFamily: fonts.display, color: colors.ink, fontWeight: "600" },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.rule,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          fontFamily: fonts.body,
        },
        sceneStyle: { backgroundColor: colors.paper },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: "Records",
          tabBarIcon: ({ color, size }) => <RecordsIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: "Trends",
          tabBarIcon: ({ color, size }) => <TrendsIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
