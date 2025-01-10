import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Icon library

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3A8E44", // Active tab color
        tabBarInactiveTintColor: "#999", // Inactive tab color
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            height: 60,
          },
          android: {
            height: 60,
          },
        }),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Match route names to the actual files
          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else if (route.name === "communities") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "droneservice") {
            iconName = focused ? "cloud" : "cloud-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Define tabs with the exact file names */}
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="communities" options={{ title: "Communities" }} />
      <Tabs.Screen name="droneservice" options={{ title: "Drone Service" }} />
    </Tabs>
  );
}
