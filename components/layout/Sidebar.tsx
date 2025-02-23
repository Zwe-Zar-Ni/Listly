import { View, Text } from "react-native";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Menu, X } from "lucide-react-native";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader
} from "../ui/drawer";
import ThemeSwitch from "../ThemeSwitch";

const Sidebar = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const { pallatte } = useTheme();
  return (
    <View className="w-[30px] h-[30px] flex justify-center items-center">
      <Button
        onPress={() => {
          setShowDrawer(true);
        }}
        className="w-[30px] h-[30px] bg-transparent"
      >
        <Menu size={24} color={pallatte.text} />
      </Button>
      <Drawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
        }}
        size="lg"
        anchor="left"
        style={{ backgroundColor: pallatte.bg }}
      >
        <DrawerBackdrop />
        <DrawerContent
          className="px-1 border-r-0"
          style={{ backgroundColor: pallatte.bg, borderWidth: 0 }}
        >
          <DrawerHeader className="flex justify-between gap-2 mt-8">
            <Text className="text-3xl font-psemibold" style={{color : pallatte.primary}}>Heading</Text>
            <Button
              onPress={() => {
                setShowDrawer(false);
              }}
              className="w-[30px] h-[30px] bg-transparent"
            >
              <X size={20} color={pallatte.text} />
            </Button>
          </DrawerHeader>
          <DrawerBody className="mt-4">
            <ThemeSwitch />
          </DrawerBody>
          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </View>
  );
};

export default Sidebar;
