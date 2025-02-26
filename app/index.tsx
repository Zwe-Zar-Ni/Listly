import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { Image, ScrollView, Text, TextInput, View } from "react-native";
import LogoIcon from "../assets/logo.png";
import ThemeSwitch from "@/components/ThemeSwitch";
import { CircleCheck, User } from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { getItem } from "@/db/settings";
const Index = () => {
  const { pallatte } = useTheme();
  const [info, setInfo] = useState({
    name: "",
    dark_mode: false,
    pallatte: 0
  });
  useEffect(() => {
    getItem('mode').then((mode) => {
      if(mode) {
        router.push('/home')
      }
    })
  })
  return (
    <SafeAreaView
      style={{ backgroundColor: pallatte.bg }}
      className="justify-center h-full p-2"
    >
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
            Listly
          </Text>
          <Text className="font-pregular" style={{ color: pallatte.text }}>
            Simplify your tasks, amplify your days.
          </Text>
        </View>
      </View>

      <View
        className="flex flex-row flex-wrap justify-center py-4 mt-8 mb-4 rounded-lg gap-x-2"
        style={{ backgroundColor: pallatte.tint }}
      >
        <View className="flex flex-row w-[48%] items-center gap-2 p-2 mb-2 rounded-lg">
          <CircleCheck size={20} color={pallatte.bold} />
          <Text
            className="text-lg font-pmedium"
            style={{ color: '#161622' }}
          >
            Categorized Tasks
          </Text>
        </View>
        <View className="flex flex-row w-[48%] items-center gap-2 p-2 mb-2 rounded-lg">
          <CircleCheck size={20} color={pallatte.bold} />
          <Text
            className="text-lg font-pmedium"
            style={{ color: '#161622' }}
          >
            Repeatitions
          </Text>
        </View>
        <View className="flex flex-row w-[48%] items-center gap-2 p-2 mb-2 rounded-lg">
          <CircleCheck size={20} color={pallatte.bold} />
          <Text
            className="text-lg font-pmedium"
            style={{ color: '#161622' }}
          >
            Calendar View
          </Text>
        </View>
        <View className="flex flex-row w-[48%] items-center gap-2 p-2 mb-2 rounded-lg">
          <CircleCheck size={20} color={pallatte.bold} />
          <Text
            className="text-lg font-pmedium"
            style={{ color: '#161622' }}
          >
            Remainders
          </Text>
        </View>
      </View>

      <View className="pt-4 pb-8 border-b border-b-slate-500">
        <ThemeSwitch />
      </View>

      <Button
        size="xl"
        style={{ backgroundColor: pallatte.primary }}
        className="mt-8"
      >
        <Link
          className="w-full text-center font-psemibold"
          style={{ color: "white" }}
          href="/home"
        >
          Go to home page
        </Link>
      </Button>
      <StatusBar style="light" backgroundColor={pallatte.bg} />
    </SafeAreaView>
  );
};

export default Index;
