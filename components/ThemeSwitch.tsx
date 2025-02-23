import React, { useEffect, useState } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Text, View } from "react-native";
import colors from "@/constants/colors";
import { Switch } from "./ui/switch";
import { Palette } from "lucide-react-native";
import { setItem } from "@/db/settings";

const ThemeSwitch = () => {
  const { setColor, setMode, mode, pallatte } = useTheme();
  const [darkMode, setDarkMode] = useState(mode == "dark");
  useEffect(() => {
    setDarkMode(mode == "dark");
  } , [mode])
  return (
    <View className="">
      <View className="flex flex-row items-center w-full gap-2">
        <Palette color={pallatte.text} size={18} />
        <Text style={{ color: pallatte.text }} className="text-xl font-pbold">
          Themes {mode}
        </Text>
      </View>
      <View className="flex flex-row items-center justify-between w-full border-b border-b-slate-300">
        <Text
          style={{ color: pallatte.text }}
          className="text-lg w-fit font-psemibold"
        >
          Dark Mode
        </Text>
        <Text style={{ color: pallatte.text }} className="w-fit">
          :
        </Text>
        <Switch
          trackColor={{ false: pallatte.tint, true: pallatte.tint }}
          thumbColor={pallatte.primary}
          value={darkMode}
          onToggle={(e) => {
            setDarkMode(e);
            setMode(e ? "dark" : "light");
            setItem("mode", e ? "dark" : "light");
          }}
        />
      </View>
      <View className="flex flex-row flex-wrap justify-center gap-2">
        {colors.map((cl) => (
          <Button
            key={cl.key}
            style={{ backgroundColor: cl.primary }}
            className="w-[15%] aspect-square my-2"
            onPress={() => {
              setColor(cl.key);
              setItem("color", cl.key);
            }}
          >
            <ButtonText style={{ color: cl.primary }}>.</ButtonText>
          </Button>
        ))}
      </View>
    </View>
  );
};

export default ThemeSwitch;
