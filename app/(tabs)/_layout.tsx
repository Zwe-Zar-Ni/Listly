import React from "react";
import { Tabs } from "expo-router";
import { Bolt, Calendar1, Check } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Text, View } from "react-native";

const TabLayout = () => {
  const { pallatte, mode } = useTheme();
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: pallatte.primary,
          tabBarStyle: {
            backgroundColor: mode == "light" ? "#eee" : "#161622"
          }
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <View className="w-[75px] pt-2 justify-center items-center flex flex-col">
                <Check color={color} size={24} strokeWidth={3} />
                <Text style={{ color: color }} className="text-sm text-center">
                  Tasks
                </Text>
              </View>
            )
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <View className="w-[75px] pt-2 justify-center items-center flex flex-col">
                <Calendar1 color={color} size={24} />
                <Text style={{ color: color }} className="text-sm text-center">
                  Calendar
                </Text>
              </View>
            )
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <View className="w-[75px] pt-2 justify-center items-center flex flex-col">
                <Bolt color={color} size={24} />
                <Text style={{ color: color }} className="text-sm text-center">
                  Settings
                </Text>
              </View>
            )
          }}
        />
      </Tabs>
    </>
  );
};

export default TabLayout;
