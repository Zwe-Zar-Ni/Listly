import { View, Text, TextInput, ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Task } from "@/types/task";
import {
  changePriority,
  deleteTask,
  getTaskDetails,
  markDone,
  updateCategoryId,
  updateDueDate,
  updateDueTime,
  updateName,
  updateNote,
  updateRemainder,
  updateRepeat
} from "@/db/tasks";
import Navbar from "@/components/layout/Navbar";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem
} from "@/components/ui/select";
import {
  BellDot,
  Calendar,
  Check,
  Circle,
  CircleCheck,
  Clock,
  Edit2,
  Flag,
  Notebook,
  Repeat,
  Trash,
  Ungroup,
  X
} from "lucide-react-native";
import { getCategories } from "@/db/categories";
import { Category } from "@/types/category";
import { Divider } from "@/components/ui/divider";
import { Button, ButtonText } from "@/components/ui/button";
import { format, set } from "date-fns";
import { DateType } from "react-native-ui-datepicker";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper
} from "@/components/ui/action-sheet";
import DatePicker from "@/components/ui/DatePicker";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { Menu, MenuItem } from "@/components/ui/menu";
import dayjs from "dayjs";
import priorities from "@/constants/priorities";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogFooter,
  AlertDialogBody
} from "@/components/ui/alert-dialog";
import SubTasks from "@/components/tasks/SubTasks";

const TaskDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pallatte } = useTheme();
  const [task, setTask] = useState<Task>({
    id: 0,
    name: "",
    due_date: "",
    due_time: "",
    repeat: "",
    is_done: false,
    remainder: "",
    priority: 1,
    progress: 0
  });
  const [categories, setCategories] = useState<Category[]>([]);

  const [edit, setEdit] = useState({ open: false, type: "" });
  const [dueDate, setDueDate] = useState<DateType>(null);
  const [dueTime, setDueTime] = useState<DateType>(null);
  const [remainder, setRemainder] = useState<DateType>(null);
  const [repeat, setRepeat] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [editName, setEditName] = useState({ open: false, name: "" });

  const [showAlertDialog, setShowAlertDialog] = useState(false);

  const updateNameFun = async () => {
    await updateName(task.id, editName.name);
    setEditName({ ...editName, open: false });
    fetchTask();
  };

  const fetchTask = async () => {
    const tk = await getTaskDetails(id);
    if (tk) {
      setEditName({ open: false, name: tk.name });
      if (tk.due_date) {
        setDueDate(dayjs(tk.due_date));
      } else {
        setDueDate(dayjs());
      }
      if (tk.due_time) {
        const hour = Number(tk.due_time.split("-")[0]);
        const minute = Number(tk.due_time.split("-")[1]);
        const result = set(new Date(), { hours: hour, minutes: minute });
        tk.due_time = format(result, "hh:mm a");
        setDueTime(dayjs(result));
      } else {
        setDueTime(dayjs());
      }
      if (tk.due_time && tk.remainder) {
        const remainderHour = Number(tk.remainder.split("-")[0]);
        const remainderMinute = Number(tk.remainder.split("-")[1]);
        const remainder = set(new Date(), {
          hours: remainderHour,
          minutes: remainderMinute
        });
        setRemainder(dayjs(remainder));
        tk.remainder = format(remainder, "hh:mm a");
      } else {
        setRemainder(dayjs());
      }
      if (tk?.repeat) {
        setRepeat(tk.repeat);
      }
      if (tk.note) {
        setNote(tk.note);
      }
      setTask(tk);
    } else {
      console.log("task not found");
    }
  };

  const updateCategory = async (id: number) => {
    const result = await updateCategoryId(task.id, id);
    if (result) {
      setTask({ ...task, category_id: id });
    }
  };

  const updateFields = async () => {
    if (edit.type == "due_date") {
      const date = dueDate
        ? format(dueDate.toString(), "yyyy-MM-dd")
        : undefined;
      await updateDueDate(task.id, date);
      fetchTask();
    } else if (edit.type == "due_time") {
      const time = dueTime ? format(dueTime.toString(), "HH-mm") : undefined;
      await updateDueTime(task.id, time);
      fetchTask();
    } else if (edit.type == "remainder") {
      console.log('remainder - ' , remainder)
      const time = remainder
        ? format(remainder.toString(), "HH-mm")
        : undefined;
      await updateRemainder(task.id, time);
      fetchTask();
    } else if (edit.type == "repeat") {
      await updateRepeat(task.id, repeat);
      fetchTask();
    } else if (edit.type == "note") {
      await updateNote(task.id, note);
      fetchTask();
    }
    setEdit({ open: false, type: "" });
  };

  const changePr = async (key: number) => {
    if (key == task.priority) {
      return;
    }
    const result = await changePriority(task.id, key);
    if (result) {
      await fetchTask();
    } else {
      console.log("error updating task.");
    }
  };

  const removeTask = async () => {
    const result = await deleteTask(Number(id));
    if (result) {
      router.replace("/home");
    }
  };

  const completeTask = async () => {
    const result = await markDone(task.id, task.is_done);
    if (result) {
      await fetchTask();
    } else {
      console.log("error updating task.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTask();
    }, [id])
  );

  return (
    <SafeAreaView
      className="relative min-h-full px-2"
      style={{ backgroundColor: pallatte.bg }}
    >
      <Navbar />
      <ScrollView className="h-screen" showsVerticalScrollIndicator={false}>
        <View className="flex flex-row items-center justify-between pt-2 pb-4">
          <Select
            className="w-1/3 rounded-full"
            onValueChange={(e) => updateCategory(Number(e))}
          >
            <SelectTrigger
              variant="outline"
              size="md"
              className="flex flex-row justify-center w-full gap-2 border-0 rounded-full"
              style={{ backgroundColor: pallatte.tint }}
            >
              <SelectIcon
                className=""
                as={Ungroup}
                style={{ color: pallatte.bold }}
              />
              <SelectInput
                placeholder={
                  task.category_id
                    ? categories.find((cat) => cat.id == task.category_id)?.name
                    : "All"
                }
              />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent
                style={{
                  backgroundColor: pallatte.bg,
                  borderColor: pallatte.bg
                }}
              >
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectItem
                  label="All"
                  value="0"
                  textStyle={{
                    className: `dark:text-slate-100 text-lg text-slate-700 hover:bg-transparent`
                  }}
                />
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.id}
                    label={cat.name}
                    value={cat.id.toString()}
                    textStyle={{
                      className: `dark:text-slate-100 text-lg text-slate-700 hover:bg-transparent`
                    }}
                  />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
          <Menu
            placement="bottom left"
            offset={32}
            className="w-[65px] mr-4"
            style={{backgroundColor : pallatte.tint}}
            crossOffset={20}
            trigger={({ ...triggerProps }) => {
              return (
                <Button
                  {...triggerProps}
                  style={{
                    color: "#0f172a",
                    backgroundColor: priorities.find(
                      (p) => p.key == task.priority
                    )?.color
                  }}
                  className="px-2 py-1.5 rounded-full"
                  size="sm"
                >
                  <Flag size={20} color={"white"} />
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
        </View>
        {editName.open ? (
          <View className="flex flex-row items-center gap-x-4">
            <TextInput
              className="h-[40px] px-2 flex-grow w-[60%] rounded border caret-[#94a3b8] bg-transparent dark:bg-transparent"
              style={{ color: pallatte.text, borderColor: pallatte.tint }}
              placeholder="Task Name"
              value={editName.name}
              onChangeText={(e) => setEditName({ ...editName, name: e })}
            />
            <Button
              onPress={() => {
                setEditName({ open: false, name: task.name });
              }}
              className="w-[39px] h-[39px] bg-transparent border border-red-500"
            >
              <X color={"red"} size={20} />
            </Button>
            <Button
              onPress={updateNameFun}
              className="w-[39px] h-[39px]"
              style={{ backgroundColor: pallatte.primary }}
            >
              <Check color={"white"} size={20} />
            </Button>
          </View>
        ) : (
          <Text
            style={{ color: pallatte.text }}
            className="my-2 text-2xl font-psemibold"
            onPress={() => setEditName({ ...editName, open: true })}
          >
            {task.name}
          </Text>
        )}
        <View className="flex flex-row items-center gap-4 my-4">
          <Progress
            className="w-[80%] flex-grow"
            value={task.progress}
            size="md"
            orientation="horizontal"
          >
            <ProgressFilledTrack
              style={{ backgroundColor: pallatte.primary }}
            />
          </Progress>
          <Text
            style={{ color: pallatte.text }}
            className="text-lg font-psemibold"
          >
            {task.progress}%
          </Text>
        </View>
        <SubTasks
          updateProgress={(p) => setTask({ ...task, progress: p })}
          id={task.id}
          tasks={task.sub_tasks ?? []}
        />
        <Divider orientation="horizontal" className="mt-8" />
        <Button
          onPress={() => setEdit({ open: true, type: "due_date" })}
          className="flex flex-row items-center w-full gap-4 px-0 my-1 bg-transparent"
        >
          <Calendar color={pallatte.text} size={20} />
          <Text
            className="flex-grow font-pmedium"
            style={{ color: pallatte.text }}
          >
            Due Date
          </Text>
          <Text
            className="px-3 pb-1 min-w-[125px] text-center pt-1.5 rounded font-pmedium"
            style={{ color: "#0f172a", backgroundColor: pallatte.tint }}
          >
            {task.due_date ?? "No Date"}
          </Text>
        </Button>
        <Divider orientation="horizontal" />
        <Button
          onPress={() => {
            if (!dueTime) {
              setDueTime(dayjs());
            }
            setEdit({ open: true, type: "due_time" });
          }}
          className="flex flex-row items-center w-full gap-4 px-0 my-1 bg-transparent"
        >
          <Clock color={pallatte.text} size={20} />
          <Text
            className="flex-grow font-pmedium"
            style={{ color: pallatte.text }}
          >
            Due Time
          </Text>
          <Text
            className="px-3 pb-1 min-w-[125px] text-center pt-1.5 rounded font-pmedium"
            style={{ color: "#0f172a", backgroundColor: pallatte.tint }}
          >
            {task.due_time ? task.due_time : "No Time"}
          </Text>
        </Button>
        <Divider orientation="horizontal" />
        <Button
          onPress={() => {
            if (!remainder) {
              setRemainder(dayjs());
            }
            setEdit({ open: true, type: "remainder" });
          }}
          className="flex flex-row items-center w-full gap-4 px-0 my-1 bg-transparent"
        >
          <BellDot color={pallatte.text} size={20} />
          <Text
            className="flex-grow font-pmedium"
            style={{ color: pallatte.text }}
          >
            Remainder
          </Text>
          <Text
            className="px-3 pb-1 min-w-[125px] text-center pt-1.5 rounded font-pmedium"
            style={{ color: "#0f172a", backgroundColor: pallatte.tint }}
          >
            {task.remainder ?? "No Remainder"}
          </Text>
        </Button>
        <Divider orientation="horizontal" />
        <Button
          onPress={() => setEdit({ open: true, type: "repeat" })}
          className="flex flex-row items-center w-full gap-4 px-0 my-1 bg-transparent"
        >
          <Repeat color={pallatte.text} size={20} />
          <Text
            className="flex-grow font-pmedium"
            style={{ color: pallatte.text }}
          >
            Repeat
          </Text>
          <Text
            className="px-3 pb-1 min-w-[125px] text-center pt-1.5 rounded font-pmedium"
            style={{ color: "#0f172a", backgroundColor: pallatte.tint }}
          >
            {task.repeat?.trim() ? task.repeat : "No Repeat"}
          </Text>
        </Button>
        <Divider orientation="horizontal" />
        <View className="pb-8">
          <Button className="px-0 my-1 text-lg bg-transparent gap-x-4 font-pmedium">
            <Notebook color={pallatte.text} size={20} />
            <ButtonText
              style={{ color: pallatte.text }}
              className="flex-grow font-pmedium"
            >
              Note
            </ButtonText>
            <Edit2
              onPress={() => setEdit({ open: true, type: "note" })}
              color={pallatte.text}
              size={16}
            />
          </Button>
          <Text numberOfLines={5} style={{ color: pallatte.text }}>
            {task.note ?? "-"}
          </Text>
        </View>
        <Actionsheet
          isOpen={edit.open}
          onClose={() => setEdit({ open: false, type: "" })}
        >
          <ActionsheetBackdrop />
          <ActionsheetContent
            style={{ backgroundColor: pallatte.bg, borderWidth: 0 }}
          >
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            {edit.type == "due_date" ? (
              <View>
                <Text
                  className="w-full font-psemibold"
                  style={{ color: pallatte.text }}
                >
                  Due Date
                </Text>
                <DatePicker type="day" date={dueDate} setDate={setDueDate} />
                <View className="flex flex-row flex-wrap items-center justify-start gap-2">
                  <Button
                    style={{ backgroundColor: pallatte.tint }}
                    className="w-full py-2"
                    onPress={() => {
                      setDueDate(() => null);
                    }}
                  >
                    <ButtonText style={{ color: pallatte.bold }}>
                      No Date
                    </ButtonText>
                  </Button>
                  <Button
                    style={{ backgroundColor: pallatte.tint }}
                    className="flex-grow py-2"
                    onPress={() => {
                      setDueDate(dayjs());
                    }}
                  >
                    <ButtonText style={{ color: pallatte.bold }}>
                      Today
                    </ButtonText>
                  </Button>
                  <Button
                    style={{ backgroundColor: pallatte.tint }}
                    className="flex-grow py-2"
                    onPress={() => {
                      setDueDate(dayjs().add(1, "day"));
                    }}
                  >
                    <ButtonText style={{ color: pallatte.bold }}>
                      Tomorrow
                    </ButtonText>
                  </Button>
                </View>
              </View>
            ) : null}
            {edit.type == "due_time" ? (
              <View>
                <Text
                  className="w-full font-psemibold"
                  style={{ color: pallatte.text }}
                >
                  Due Time
                </Text>
                <View>
                  <DatePicker type="time" date={dueTime} setDate={setDueTime} />
                </View>
                <View className="flex flex-row flex-wrap items-center justify-start gap-2">
                  <Button
                    style={{ backgroundColor: pallatte.tint }}
                    className="w-full py-2"
                    onPress={() => {
                      setDueTime(null);
                    }}
                  >
                    <ButtonText style={{ color: pallatte.bold }}>
                      No Time
                    </ButtonText>
                  </Button>
                  <Button
                    style={{ backgroundColor: pallatte.tint }}
                    className="flex-grow py-2"
                    onPress={() => {
                      setDueTime(dayjs().set("hour", 7).set("minute", 0));
                    }}
                  >
                    <ButtonText style={{ color: pallatte.bold }}>
                      07:00 AM
                    </ButtonText>
                  </Button>
                  <Button
                    style={{ backgroundColor: pallatte.tint }}
                    className="flex-grow py-2"
                    onPress={() => {
                      setDueTime(dayjs().set("hour", 9).set("minute", 0));
                    }}
                  >
                    <ButtonText style={{ color: pallatte.bold }}>
                      09:00 AM
                    </ButtonText>
                  </Button>
                  <Button
                    style={{ backgroundColor: pallatte.tint }}
                    className="flex-grow py-2"
                    onPress={() => {
                      setDueTime(dayjs().set("hour", 12).set("minute", 0));
                    }}
                  >
                    <ButtonText style={{ color: pallatte.bold }}>
                      12:00 PM
                    </ButtonText>
                  </Button>
                  <Button
                    style={{ backgroundColor: pallatte.tint }}
                    className="flex-grow py-2"
                    onPress={() => {
                      setDueTime(dayjs().set("hour", 15).set("minute", 0));
                    }}
                  >
                    <ButtonText style={{ color: pallatte.bold }}>
                      03:00 PM
                    </ButtonText>
                  </Button>
                  <Button
                    style={{ backgroundColor: pallatte.tint }}
                    className="flex-grow py-2"
                    onPress={() => {
                      setDueTime(dayjs().set("hour", 18).set("minute", 0));
                    }}
                  >
                    <ButtonText style={{ color: pallatte.bold }}>
                      06:00 PM
                    </ButtonText>
                  </Button>
                  <Button
                    style={{ backgroundColor: pallatte.tint }}
                    className="flex-grow py-2"
                    onPress={() => {
                      setDueTime(dayjs().set("hour", 21).set("minute", 0));
                    }}
                  >
                    <ButtonText style={{ color: pallatte.bold }}>
                      09:00 PM
                    </ButtonText>
                  </Button>
                </View>
              </View>
            ) : null}
            {edit.type == "remainder" ? (
              <View className="flex flex-row flex-wrap items-center justify-start gap-2">
                <Text
                  className="w-full font-psemibold"
                  style={{ color: pallatte.text }}
                >
                  Remainder
                </Text>
                <Button
                  style={{ backgroundColor: pallatte.tint }}
                  className="w-full py-2"
                  onPress={() => {
                    setRemainder(null);
                  }}
                >
                  <ButtonText style={{ color: pallatte.bold }}>
                    No Remainder
                  </ButtonText>
                </Button>
                <Button
                  style={{ backgroundColor: pallatte.tint }}
                  className="flex-grow py-2 min-w-[48%]"
                  onPress={() => {
                    setRemainder(dayjs(dueTime).subtract(5, "minute"));
                  }}
                >
                  <ButtonText style={{ color: pallatte.bold }}>
                    5 minutes before
                  </ButtonText>
                </Button>
                <Button
                  style={{ backgroundColor: pallatte.tint }}
                  className="flex-grow py-2 min-w-[48%]"
                  onPress={() => {
                    setRemainder(dayjs(dueTime).subtract(30, "minute"));
                  }}
                >
                  <ButtonText style={{ color: pallatte.bold }}>
                    30 minutes before
                  </ButtonText>
                </Button>
                <Button
                  style={{ backgroundColor: pallatte.tint }}
                  className="flex-grow py-2 min-w-[48%]"
                  onPress={() => {
                    setRemainder(dayjs(dueTime).subtract(1, "hour"));
                  }}
                >
                  <ButtonText style={{ color: pallatte.bold }}>
                    1 hour before
                  </ButtonText>
                </Button>
                <Button
                  style={{ backgroundColor: pallatte.tint }}
                  className="flex-grow py-2 min-w-[48%]"
                  onPress={() => {
                    setRemainder(dayjs(dueTime).subtract(3, "hour"));
                  }}
                >
                  <ButtonText style={{ color: pallatte.bold }}>
                    3 hours before
                  </ButtonText>
                </Button>
                <Button
                  style={{ backgroundColor: pallatte.tint }}
                  className="flex-grow py-2 min-w-[48%]"
                  onPress={() => {
                    setRemainder(dayjs(dueTime).subtract(6, "hour"));
                  }}
                >
                  <ButtonText style={{ color: pallatte.bold }}>
                    6 hours before
                  </ButtonText>
                </Button>
              </View>
            ) : null}
            {edit.type == "repeat" ? (
              <View className="flex flex-row flex-wrap items-center justify-start gap-2">
                <Text
                  className="w-full font-psemibold"
                  style={{ color: pallatte.text }}
                >
                  Repeat Task
                </Text>
                <Button
                  style={{
                    backgroundColor:
                      repeat == "" ? pallatte.primary : pallatte.tint
                  }}
                  className="w-full py-2"
                  onPress={() => {
                    setRepeat("");
                  }}
                >
                  <ButtonText
                    style={{ color: repeat == "" ? "white" : pallatte.bold }}
                  >
                    No Repeat
                  </ButtonText>
                </Button>
                <Button
                  style={{
                    backgroundColor:
                      repeat == "daily" ? pallatte.primary : pallatte.tint
                  }}
                  className="flex-grow py-2"
                  onPress={() => {
                    setRepeat("daily");
                  }}
                >
                  <ButtonText
                    style={{
                      color: repeat == "daily" ? "white" : pallatte.bold
                    }}
                  >
                    Daily
                  </ButtonText>
                </Button>
                <Button
                  style={{
                    backgroundColor:
                      repeat == "weekly" ? pallatte.primary : pallatte.tint
                  }}
                  className="flex-grow py-2"
                  onPress={() => {
                    setRepeat("weekly");
                  }}
                >
                  <ButtonText
                    style={{
                      color: repeat == "weekly" ? "white" : pallatte.bold
                    }}
                  >
                    Weekly
                  </ButtonText>
                </Button>
                <Button
                  style={{
                    backgroundColor:
                      repeat == "monthly" ? pallatte.primary : pallatte.tint
                  }}
                  className="flex-grow py-2"
                  onPress={() => {
                    setRepeat("monthly");
                  }}
                >
                  <ButtonText
                    style={{
                      color: repeat == "monthly" ? "white" : pallatte.bold
                    }}
                  >
                    Monthly
                  </ButtonText>
                </Button>
              </View>
            ) : null}
            {edit.type == "note" ? (
              <View className="w-full">
                <Text
                  className="w-full font-psemibold"
                  style={{ color: pallatte.text }}
                >
                  Note
                </Text>
                <TextInput
                  className="py-3 px-2 w-full rounded border-0 caret-[#94a3b8] bg-slate-100 dark:bg-slate-300"
                  style={{ borderColor: pallatte.tint }}
                  placeholder="Add note for the task"
                  value={note}
                  onChangeText={(e) => setNote(e)}
                />
              </View>
            ) : null}
            <View
              className="flex flex-row justify-end w-full gap-4 pt-2 mt-4 border-t"
              style={{ borderColor: pallatte.text }}
            >
              <Button
                onPress={() => setEdit({ open: false, type: "" })}
                className="bg-transparent"
              >
                <ButtonText style={{ color: pallatte.text }}>Cancel</ButtonText>
              </Button>
              <Button
                onPress={updateFields}
                style={{ backgroundColor: pallatte.primary }}
              >
                <ButtonText style={{ color: "white" }}>Done</ButtonText>
              </Button>
            </View>
          </ActionsheetContent>
        </Actionsheet>
        <AlertDialog
          isOpen={showAlertDialog}
          onClose={() => setShowAlertDialog(false)}
          size="md"
        >
          <AlertDialogBackdrop />
          <AlertDialogContent>
            <AlertDialogHeader>
              <Text className="text-lg font-psemibold">
                Are you sure you want to delete this task?
              </Text>
            </AlertDialogHeader>
            <AlertDialogBody className="mt-3 mb-4">
              <Text>
                Deleting the task will remove it permanently and cannot be
                undone. Please confirm if you want to proceed.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter className="">
              <Button
                variant="outline"
                onPress={() => setShowAlertDialog(false)}
                size="sm"
                style={{ borderColor: pallatte.primary }}
              >
                <ButtonText style={{ color: "#303030" }}>Cancel</ButtonText>
              </Button>
              <Button
                size="sm"
                style={{ backgroundColor: pallatte.primary }}
                onPress={removeTask}
              >
                <ButtonText style={{ color: "white" }}>Delete</ButtonText>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <View className="h-[200px]"></View>
      </ScrollView>
      <View
        className="absolute flex flex-row items-center w-full gap-4 ml-2 bottom-[56px] p-1"
        style={{ backgroundColor: pallatte.bg }}
      >
        <Button
          onPress={() => setShowAlertDialog(true)}
          size="lg"
          className="w-[48%] border border-red-500 bg-transparent"
        >
          <Trash size={20} color={pallatte.text} />
          <ButtonText style={{ color: pallatte.text }}>Delete</ButtonText>
        </Button>
        {!task.is_done ? (
          <Button
            onPress={completeTask}
            size="lg"
            className="w-[48%]"
            style={{ backgroundColor: pallatte.primary }}
          >
            <CircleCheck size={20} color={"white"} />
            <ButtonText style={{ color: "white" }}>Complete</ButtonText>
          </Button>
        ) : (
          <Button
            onPress={completeTask}
            size="lg"
            className="w-[48%]"
            style={{ backgroundColor: pallatte.primary }}
          >
            <Circle size={20} color={"white"} />
            <ButtonText style={{ color: "white" }}>Undone</ButtonText>
          </Button>
        )}
      </View>
      <StatusBar style="light" backgroundColor={pallatte.bg} />
    </SafeAreaView>
  );
};

export default TaskDetails;
