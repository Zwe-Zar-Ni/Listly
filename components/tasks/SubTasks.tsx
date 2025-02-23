import { View, Text, FlatList, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { Subtask } from "@/types/task";
import {
  createSubtask,
  deleteSubtask,
  getSubtasks,
  subMarkDone
} from "@/db/sub_tasks";
import { Button, ButtonText } from "../ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Check,
  Circle,
  Menu as MenuIcon,
  Plus,
  Trash
} from "lucide-react-native";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper
} from "@/components/ui/action-sheet";
import { Menu, MenuItem } from "@/components/ui/menu";

type Props = {
  id: number;
  tasks: Subtask[];
  updateProgress: (p: number) => void;
};
const SubTasks = ({ id, tasks: tks, updateProgress }: Props) => {
  const { pallatte } = useTheme();
  const [tasks, setTasks] = useState<Subtask[]>(tks.length ? tks : []);
  const [creating, setCreating] = useState(false);
  const [newtask, setNewTask] = useState<Subtask>({
    id: 0,
    name: "",
    task_id: id,
    is_done: false
  });

  const fetchTasks = async () => {
    console.log("fetching subtasks , ", id);
    const result = await getSubtasks(id);
    // console.log(result);
    setTasks(result);
  };

  const create = async () => {
    const result = await createSubtask({ ...newtask, task_id: id });
    // console.log('created task - ' , result)
    if (result) {
      setCreating(false);
      setNewTask({
        id: 0,
        name: "",
        task_id: id,
        is_done: false
      });
      setTasks(result.tasks);
      updateProgress(result.percentage);
    }
  };

  const markTaskDone = async (task: Subtask) => {
    console.log("calling");
    const result = await subMarkDone(task);
    if (result) {
      setTasks(result.tasks);
      updateProgress(result.percentage);
    }
  };

  const deleteItem = async (task: Subtask) => {
    const result = await deleteSubtask(task);
    if (result) {
      setTasks(result.tasks);
      updateProgress(result.percentage);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [id]);
  return (
    <View>
      {/* <FlatList
        data={tasks}
        className="pb-4"
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View
            className="flex flex-row items-center justify-between gap-2 py-2 border-b"
            style={{ borderColor: pallatte.tint }}
          >
            {item.is_done ? (
              <Button
                onPress={() => markTaskDone(item)}
                size="sm"
                className="w-[22px] h-[22px] p-0 rounded-full"
                style={{
                  backgroundColor: pallatte.primary,
                  borderRadius: "50%"
                }}
              >
                <Check
                  size={18}
                  style={{ borderRadius: "50%" }}
                  color={"white"}
                />
              </Button>
            ) : (
              <Button
                onPress={() => markTaskDone(item)}
                size="sm"
                className="w-[22px] h-[22px] rounded-full p-0 bg-transparent"
              >
                <Circle size={23} color={pallatte.text} />
              </Button>
            )}
            <Text className="flex-grow" style={{color : pallatte.text}}>{item.name}</Text>
            <Menu
              placement="left"
              offset={2}
              className=""
              crossOffset={20}
              trigger={({ ...triggerProps }) => {
                return (
                  <Button
                    {...triggerProps}
                    className="bg-transparent"
                    size="sm"
                  >
                    <MenuIcon size={18} color={pallatte.text} />
                  </Button>
                );
              }}
            >
                <MenuItem
                  className="flex flex-row items-center w-full gap-2 mx-2 my-1"
                  textValue="delete"
                  onPress={() => deleteItem(item)}
                >
                  <Trash color={pallatte.text} />
                  <Text style={{color : pallatte.text}}>Delete</Text>
                </MenuItem>
            </Menu>
          </View>
        )}
      /> */}
      {tasks.map((item) => (
        <View
          className="flex flex-row items-center justify-between gap-2 py-2 border-b"
          style={{ borderColor: pallatte.tint }}
          key={item.id}
        >
          {item.is_done ? (
            <Button
              onPress={() => markTaskDone(item)}
              size="sm"
              className="w-[22px] h-[22px] p-0 rounded-full"
              style={{
                backgroundColor: pallatte.primary,
                borderRadius: "50%"
              }}
            >
              <Check
                size={18}
                style={{ borderRadius: "50%" }}
                color={"white"}
              />
            </Button>
          ) : (
            <Button
              onPress={() => markTaskDone(item)}
              size="sm"
              className="w-[22px] h-[22px] rounded-full p-0 bg-transparent"
            >
              <Circle size={23} color={pallatte.text} />
            </Button>
          )}
          <Text className="flex-grow" style={{ color: pallatte.text }}>
            {item.name}
          </Text>
          <Menu
            placement="left"
            offset={2}
            style={{backgroundColor : pallatte.tint}}
            crossOffset={20}
            trigger={({ ...triggerProps }) => {
              return (
                <Button {...triggerProps} className="bg-transparent" size="sm">
                  <MenuIcon size={18} color={pallatte.text} />
                </Button>
              );
            }}
          >
            <MenuItem
              className="flex flex-row items-center w-full gap-2 mx-2 my-1"
              textValue="delete"
              onPress={() => deleteItem(item)}
            >
              <Trash color={pallatte.text} />
              <Text style={{ color: pallatte.text }}>Delete</Text>
            </MenuItem>
          </Menu>
        </View>
      ))}
      <Button
        onPress={() => setCreating(true)}
        variant="outline"
        style={{ borderColor: pallatte.primary }}
      >
        <Plus color={pallatte.primary} size={20} />
        <ButtonText style={{ color: pallatte.primary }}>
          Add sub task
        </ButtonText>
      </Button>
      <Actionsheet isOpen={creating} onClose={() => setCreating(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent
          style={{ backgroundColor: pallatte.bg, borderWidth: 0 }}
        >
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View className="w-full pt-12 pb-4">
            <TextInput
              className="py-3 px-2 w-full rounded border-0 caret-[#94a3b8] bg-slate-100 dark:bg-slate-300"
              style={{ borderColor: pallatte.tint }}
              placeholder="sub task name"
              value={newtask.name}
              onChangeText={(e) => setNewTask({ ...newtask, name: e })}
            />
          </View>
          <View
            className="flex flex-row justify-end w-full gap-4 pb-12"
            style={{ borderColor: pallatte.text }}
          >
            <Button
              onPress={() => setCreating(false)}
              className="bg-transparent"
            >
              <ButtonText style={{ color: pallatte.text }}>Cancel</ButtonText>
            </Button>
            <Button
              onPress={create}
              style={{ backgroundColor: pallatte.primary }}
            >
              <ButtonText style={{ color: "white" }}>Done</ButtonText>
            </Button>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};

export default SubTasks;
