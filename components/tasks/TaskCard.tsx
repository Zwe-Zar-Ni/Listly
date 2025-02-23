import { View, Text, Dimensions, ViewProps, ViewStyle } from "react-native";
import React, { useRef } from "react";
import { Task } from "@/types/task";
import {
  BellDot,
  Calendar,
  Check,
  Circle,
  Clock,
  Flag,
  Repeat2
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { format } from "date-fns";
import priorities from "@/constants/priorities";
import { Link } from "expo-router";
import { changePriority, markDone } from "@/db/tasks";
import { Button, ButtonText } from "../ui/button";
import { Menu, MenuItem } from "@/components/ui/menu";

import * as Animatable from "react-native-animatable";
const screenWidth = Dimensions.get("window").width;

const TaskCard = ({
  task,
  refresh,
  index,
  disableDone = false,
}: {
  task: Task;
  refresh: () => Promise<void>;
  index: number;
  disableDone?: boolean;
}) => {
  const { pallatte } = useTheme();
  const viewRef =
    useRef<Animatable.AnimatableComponent<ViewProps, ViewStyle>>(null);

  const customSlideInRight = {
    from: { transform: [{ translateX: -screenWidth }] },
    to: { transform: [{ translateX: 0 }] }
  };

  const customSlideOutLeft = {
    from: { transform: [{ translateX: 0 }] },
    to: { transform: [{ translateX: -screenWidth }] }
  };

  const markTaskDone = async () => {
    viewRef?.current?.animate(customSlideOutLeft, 200).then(async () => {
      const result = await markDone(task.id, task.is_done , task.due_date);
      if (result) {
        await refresh();
      } else {
        console.log("error updating task.");
      }
    });
  };

  const changePr = async (key: number) => {
    if (key == task.priority) {
      return;
    }
    const result = await changePriority(task.id, key);
    if (result) {
      await refresh();
    } else {
      console.log("error updating task.");
    }
  };

  return (
    <>
      <Animatable.View
        ref={viewRef}
        animation={customSlideInRight}
        delay={index * 100}
        duration={200}
        easing={"ease-out"}
        className="flex flex-row items-center justify-between gap-3 min-h-[60px] px-3 py-2 my-2 rounded-md bg-slate-50 dark:bg-slate-800"
      >
        {
          !disableDone ? (
            task.is_done ? (
              <Button
                onPress={markTaskDone}
                size="sm"
                className="w-[22px] h-[22px] p-0 rounded-full"
                style={{ backgroundColor: pallatte.primary, borderRadius: "50%" }}
              >
                <Check size={18} style={{ borderRadius: "50%" }} color={"white"} />
              </Button>
            ) : (
              <Button
                onPress={markTaskDone}
                size="sm"
                className="w-[18px] h-[24px] rounded-full bg-transparent"
              >
                <Circle size={23} color={pallatte.text} />
              </Button>
            )
          ) : null
        }
        <View className="flex-grow max-w-[80%]">
          <Link
            href={`/tasks/${task.id}`}
            style={{ color: pallatte.text }}
            className="text-lg font-pmedium"
          >
            {task.name}
          </Link>
          <View className="flex flex-row items-center gap-2 mt-1">
            {task.repeat ? (
              <View className="h-[24px] flex flex-row rounded-md gap-1 items-center px-2 bg-slate-200 dark:bg-slate-700">
                <Repeat2 size={15} color={pallatte.text} />
                <Text style={{ color: pallatte.text }} className="text-sm">
                  {task.repeat}
                </Text>
              </View>
            ) : null}
            {task.due_date ? (
              <View className="h-[24px] bg-slate-200 dark:bg-slate-700 px-2 rounded-md flex flex-row items-center gap-1">
                <Calendar size={15} color={pallatte.text} />
                <Text className="text-sm" style={{ color: pallatte.text }}>
                  {format(task.due_date, "MM-dd")}
                </Text>
              </View>
            ) : null}
            {task.due_time ? (
              <View className="h-[24px] bg-slate-200 dark:bg-slate-700 px-2 rounded-md flex flex-row items-center gap-1">
                <Clock size={15} color={pallatte.text} />
                <Text className="text-sm" style={{ color: pallatte.text }}>
                  {task.due_time}
                </Text>
              </View>
            ) : null}
            {task.remainder ? (
              <View className="h-[24px] bg-slate-200 dark:bg-slate-700 px-2 rounded-md flex flex-row items-center gap-1">
                <BellDot size={15} color={pallatte.text} />
                <Text className="text-sm" style={{ color: pallatte.text }}>
                  {task.remainder}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <Menu
          placement="bottom left"
          offset={2}
          className="w-[65px] mr-4"
          crossOffset={20}
          trigger={({ ...triggerProps }) => {
            return (
              <Button
                {...triggerProps}
                className="p-0 bg-transparent"
                size="sm"
              >
                <Flag
                  size={20}
                  color={priorities.find((p) => p.key == task.priority)?.color ?? pallatte.text}
                />
              </Button>
            );
          }}
        >
          {priorities.map((pr) => (
            <MenuItem
              className="flex flex-row items-center w-full gap-2 mx-2 my-1"
              key={pr.key}
              textValue={pr.color}
            >
              <Flag onPress={() => changePr(pr.key)} color={pr.color} />
            </MenuItem>
          ))}
        </Menu>
      </Animatable.View>
    </>
  );
};

export default TaskCard;
