import { View, Text } from "react-native";
import React from "react";

import { useTheme } from "@/contexts/ThemeContext";
import Sidebar from "./Sidebar";
import {
  ArrowDownNarrowWide,
  ArrowLeft,
  DiamondPlus,
  EllipsisVertical,
  Home,
  Printer,
  Search,
  Ungroup
} from "lucide-react-native";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { Button } from "../ui/button";
import { Link, router } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { format } from "date-fns";

const Navbar = () => {
  const { pallatte, mode } = useTheme();
  const r = useRoute();
  return (
    <View className="relative flex flex-row items-center justify-between w-full py-2">
      {/* <Sidebar /> */}
      {r.name != "home" ? (
        <Button className="p-0 bg-transparent" onPress={() => router.back()}>
          <ArrowLeft color={pallatte.text} />
        </Button>
      ) : (
        <Text style={{color : pallatte.primary , borderColor : pallatte.primary}} className="border-b font-pbold">{format(new Date() , 'dd-MMM')}</Text>
      )}
      <Text
        className="flex-grow w-1/3 mt-1 text-center font-pblack"
        style={{ color: pallatte.text }}
      >
        Listly
      </Text>
      <Menu
        placement="bottom right"
        offset={5}
        disabledKeys={["Settings"]}
        style={{
          backgroundColor: mode == "light" ? "#f8fafc" : "#0F172A",
          borderWidth: 0
        }}
        trigger={({ ...triggerProps }) => {
          return (
            <Button
              className="bg-transparent w-[30px] h-[30px]"
              {...triggerProps}
            >
              <EllipsisVertical size={24} color={pallatte.text} />
            </Button>
          );
        }}
      >
        <MenuItem
          className="flex flex-row gap-3"
          key="Manage Categories"
          textValue="Manage Categories"
        >
          <Ungroup size="18" color={pallatte.text} />
          <MenuItemLabel style={{ color: pallatte.text }}>
            <Link href="/categories">Manage Categories</Link>
          </MenuItemLabel>
        </MenuItem>
        <MenuItem
          className="flex flex-row gap-3"
          key="Search"
          textValue="Search"
        >
          <Search size="18" color={pallatte.text} />
          <MenuItemLabel style={{ color: pallatte.text }}>Search</MenuItemLabel>
        </MenuItem>
        <MenuItem
          className="flex flex-row gap-3"
          key="Sort By"
          textValue="Sort By"
        >
          <ArrowDownNarrowWide size="18" color={pallatte.text} />
          <MenuItemLabel style={{ color: pallatte.text }}>
            Sort By
          </MenuItemLabel>
        </MenuItem>
        <MenuItem className="flex flex-row gap-3" key="Print" textValue="Print">
          <Printer size="18" color={pallatte.text} />
          <MenuItemLabel style={{ color: pallatte.text }}>Print</MenuItemLabel>
        </MenuItem>
        <MenuItem
          className="flex flex-row gap-3"
          key="Upgrade to PRO"
          textValue="Upgrade to PRO"
        >
          <DiamondPlus size="18" color={pallatte.text} />
          <MenuItemLabel style={{ color: pallatte.text }}>
            Upgrade to PRO
          </MenuItemLabel>
        </MenuItem>
      </Menu>
    </View>
  );
};

export default Navbar;
