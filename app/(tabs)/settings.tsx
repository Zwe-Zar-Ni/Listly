import { View, Text, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeSwitch from "@/components/ThemeSwitch";
import { Image } from "react-native";
import LogoIcon from "../../assets/logo.png";

const Settings = () => {
  const { pallatte } = useTheme();
  return (
    <SafeAreaView
      className="h-full px-2"
      style={{ backgroundColor: pallatte.bg }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex flex-row items-center gap-2">
        <Image
          source={LogoIcon}
          className="w-[75px] h-[75px]"
          resizeMode="cover"
        />
        <View>
          <Text
            className="text-4xl tracking-[1.25px] font-pextrabold"
            style={{ color: pallatte.primary }}
          >
            Listify
          </Text>
          <Text className="font-pregular" style={{ color: pallatte.text }}>
            Simplify your tasks, amplify your days.
          </Text>
        </View>
      </View>
        <View className="pt-4 mt-4">
          <ThemeSwitch />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
