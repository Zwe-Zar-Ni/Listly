import { View, Text, ScrollView, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Task } from "@/types/task";
import { Button, ButtonText } from "../ui/button";
import {
  BellDot,
  Calendar,
  ChevronDown,
  Clock,
  Flag,
  NotebookPen,
  Repeat,
  Ungroup
} from "lucide-react-native";
import dayjs from "dayjs";
import DatePicker from "../ui/DatePicker";
import { DateType } from "react-native-ui-datepicker";
import priorities from "@/constants/priorities";
import { format } from "date-fns";
import { Category } from "@/types/category";
import { getCategories } from "@/db/categories";
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
import { createTask } from "@/db/tasks";
import ErrorDialog from "@/components/ui/error-dialog";
import * as Notifications from "expo-notifications";

type Props = {
  success: () => void;
  closeSheet: () => void;
};

const CreateTask = ({ closeSheet, success }: Props) => {
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

  const [additional, setAdditional] = useState<
    "due_time" | "remainder" | "due_date" | "priority" | "note" | "repeat" | ""
  >("");
  const [dueDate, setDueDate] = useState<DateType>(null);
  const [dueTime, setDueTime] = useState<DateType>(null);
  const [remainder, setRemainder] = useState<DateType>(null);

  const [error, setError] = useState({
    show: false,
    title: "",
    description: ""
  });

  const sendNoti = async ({
    content,
    info
  }: {
    content: {
      title: string;
      body: string;
      data: { data: string };
    };
    info: {
      repeat: string;
      year: number;
      month: number;
      day: number;
      weekday: number;
      hour: number;
      minute: number;
      second: number;
    };
  }) => {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
      })
    });
    // ... notification handler setup
    try {
      let tri: Notifications.NotificationTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(info.year, info.month, info.day, info.hour, info.minute)
      };
      if (tri && info.repeat == "daily") {
        tri = {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(
            info.year,
            info.month,
            info.day,
            info.hour,
            info.minute
          )
        };
      } else if (tri && info.repeat == "weekly") {
        tri = {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          hour: info.hour,
          minute: info.minute,
          weekday: info.weekday
        };
      } else if (tri && info.repeat == "monthly") {
        tri = {
          type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
          hour: info.hour,
          minute: info.minute,
          day: info.day
        };
      }
      console.log(tri);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: content.data
        },
        trigger: tri
      });
      console.log("Notification scheduled successfully");
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  };

  const create = async () => {
    if (task.name.trim()) {
      const tk = {
        ...task,
        due_date: dueDate
          ? format(dueDate.toString(), "yyyy-MM-dd")
          : undefined,
        due_time: dueTime ? format(dueTime.toString(), "HH-mm") : undefined,
        remainder: remainder
          ? format(remainder.toString(), "HH-mm")
          : undefined,
        repeat: task.repeat ?? "",
        priority: task.priority
      };
      const result = await createTask(tk);
      if (result.id) {
        console.log("created");
        if (remainder && dueDate) {
          const weekday = new Date(dueDate?.toString()).getDay();
          const day = new Date(dueDate?.toString()).getDate();
          const month = new Date(dueDate?.toString()).getMonth();
          const year = new Date(dueDate?.toString()).getFullYear();
          const hour = new Date(remainder.toString()).getHours();
          const minute = new Date(remainder.toString()).getMinutes();
          sendNoti({
            content: {
              title: task.name,
              body: "Reminder for task",
              data: { data: task.id.toString() }
            },
            info: {
              repeat: task.repeat ?? "",
              year,
              month,
              day,
              weekday: weekday,
              hour,
              minute,
              second: 0
            }
          });
        }
        success();
      } else {
        setError({
          show: true,
          title: "Error creating task.",
          description: "Error creating task. Please try again"
        });
      }
    } else {
      setError({
        show: true,
        title: "Please fill task name.",
        description: ""
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchData();
  }, []);

  return (
    <View className="w-full min-h-[500px] py-4">
      <ErrorDialog
        show={error.show}
        handleClose={() =>
          setError({ show: false, title: "", description: "" })
        }
        title={error.title}
        description={error.description}
      />
      <TextInput
        className="py-3 px-2 w-full rounded border-0 caret-[#94a3b8] bg-slate-100 dark:bg-slate-300"
        style={{ borderColor: pallatte.tint }}
        placeholder="Input new task here"
        value={task.name}
        onChangeText={(e) => setTask({ ...task, name: e })}
      />
      <View className="flex flex-row flex-wrap gap-2 mt-2 mb-4">
        <View className="w-[49%]">
          <Select
            className="w-full"
            onValueChange={(e) => setTask({ ...task, category_id: Number(e) })}
          >
            <SelectTrigger
              variant="outline"
              size="md"
              className="flex flex-row justify-center w-full gap-2 border-0"
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
                    className: `dark:text-slate-100 text-slate-700 hover:bg-transparent`
                  }}
                />
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.id}
                    label={cat.name}
                    value={cat.id.toString()}
                    textStyle={{
                      className: `dark:text-slate-100 text-slate-700 hover:bg-transparent`
                    }}
                  />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </View>

        <Button
          onPress={() => setAdditional("due_date")}
          className="h-[32px] w-[48%] flex-grow flex justify-center items-center rounded-md"
          style={{
            backgroundColor:
              additional == "due_date" ? pallatte.primary : pallatte.tint
          }}
        >
          <Calendar
            color={additional == "due_date" ? "white" : pallatte.bold}
            size={20}
          />
          <Text>
            {dueDate ? format(dueDate.toString(), "yyyy-MM-dd") : "No Date"}
          </Text>
        </Button>
        <Button
          onPress={() => {
            if (!dueTime) {
              setDueTime(dayjs());
            }
            setAdditional("due_time");
          }}
          className="h-[32px] w-[48%] flex-grow flex justify-center disabled:opacity-50 items-center rounded-md"
          style={{
            backgroundColor:
              additional == "due_time" ? pallatte.primary : pallatte.tint
          }}
        >
          <Clock
            color={additional == "due_time" ? "white" : pallatte.bold}
            size={20}
          />
          <Text>
            {dueTime ? format(dueTime.toString(), "hh-mm b") : "No Time"}
          </Text>
        </Button>
        <Button
          disabled={!dueTime}
          onPress={() => setAdditional("remainder")}
          className="h-[32px] w-[48%] flex-grow flex justify-center disabled:opacity-50 items-center rounded-md"
          style={{
            backgroundColor:
              additional == "remainder" ? pallatte.primary : pallatte.tint
          }}
        >
          <BellDot
            color={additional == "remainder" ? "white" : pallatte.bold}
            size={20}
          />
          <Text>
            {remainder
              ? format(remainder.toString(), "hh:mm b")
              : "No Remainder"}
          </Text>
        </Button>
        <Button
          onPress={() => setAdditional("repeat")}
          className="h-[32px] w-[48%] flex-grow flex justify-center items-center rounded-md"
          style={{
            backgroundColor:
              additional == "repeat" ? pallatte.primary : pallatte.tint
          }}
        >
          <Repeat
            color={additional == "repeat" ? "white" : pallatte.bold}
            size={20}
          />
          <Text>
            {task.repeat && task.repeat.length ? task.repeat : "No repeat"}
          </Text>
        </Button>
        <Button
          onPress={() => setAdditional("priority")}
          className="h-[32px] w-[48%] flex-grow flex justify-center items-center rounded-md"
          style={{
            backgroundColor: priorities.find((pr) => pr.key == task.priority)
              ?.color
          }}
        >
          <Flag color={pallatte.text} size={20} />
        </Button>
        <Button
          onPress={() => setAdditional("note")}
          className="h-[32px] flex-grow flex justify-center items-center rounded-md"
          style={{
            backgroundColor:
              additional == "note" ? pallatte.primary : pallatte.tint
          }}
        >
          <NotebookPen
            color={additional == "note" ? "white" : pallatte.bold}
            size={20}
          />
        </Button>
      </View>
      {additional == "due_date" ? (
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
                setDueDate(null);
                setAdditional("");
              }}
            >
              <ButtonText style={{ color: pallatte.bold }}>No Date</ButtonText>
            </Button>
            <Button
              style={{ backgroundColor: pallatte.tint }}
              className="flex-grow py-2"
              onPress={() => {
                setDueDate(dayjs());
                setDueTime(dayjs(new Date()));
                setAdditional("due_time");
              }}
            >
              <ButtonText style={{ color: pallatte.bold }}>Today</ButtonText>
            </Button>
            <Button
              style={{ backgroundColor: pallatte.tint }}
              className="flex-grow py-2"
              onPress={() => {
                setDueDate(dayjs().add(1, "day"));
                setDueTime(dayjs(new Date()));
                setAdditional("due_time");
              }}
            >
              <ButtonText style={{ color: pallatte.bold }}>Tomorrow</ButtonText>
            </Button>
          </View>
        </View>
      ) : null}
      {additional == "due_time" ? (
        <View>
          <Text
            className="w-full font-psemibold"
            style={{ color: pallatte.text }}
          >
            Due Time
          </Text>
          <DatePicker type="time" date={dueTime} setDate={setDueTime} />
          <View className="flex flex-row flex-wrap items-center justify-start gap-2">
            <Button
              style={{ backgroundColor: pallatte.tint }}
              className="w-full py-2"
              onPress={() => {
                setDueTime(null);
                setRemainder(null);
                setAdditional("");
              }}
            >
              <ButtonText style={{ color: pallatte.bold }}>No Time</ButtonText>
            </Button>
            <Button
              style={{ backgroundColor: pallatte.tint }}
              className="flex-grow py-2"
              onPress={() => {
                setDueTime(dayjs().set("hour", 7).set("minute", 0));
                setAdditional("remainder");
              }}
            >
              <ButtonText style={{ color: pallatte.bold }}>07:00 AM</ButtonText>
            </Button>
            <Button
              style={{ backgroundColor: pallatte.tint }}
              className="flex-grow py-2"
              onPress={() => {
                setDueTime(dayjs().set("hour", 9).set("minute", 0));
                setAdditional("remainder");
              }}
            >
              <ButtonText style={{ color: pallatte.bold }}>09:00 AM</ButtonText>
            </Button>
            <Button
              style={{ backgroundColor: pallatte.tint }}
              className="flex-grow py-2"
              onPress={() => {
                setDueTime(dayjs().set("hour", 12).set("minute", 0));
                setAdditional("remainder");
              }}
            >
              <ButtonText style={{ color: pallatte.bold }}>12:00 PM</ButtonText>
            </Button>
            <Button
              style={{ backgroundColor: pallatte.tint }}
              className="flex-grow py-2"
              onPress={() => {
                setDueTime(dayjs().set("hour", 15).set("minute", 0));
                setAdditional("remainder");
              }}
            >
              <ButtonText style={{ color: pallatte.bold }}>03:00 PM</ButtonText>
            </Button>
            <Button
              style={{ backgroundColor: pallatte.tint }}
              className="flex-grow py-2"
              onPress={() => {
                setDueTime(dayjs().set("hour", 18).set("minute", 0));
                setAdditional("remainder");
              }}
            >
              <ButtonText style={{ color: pallatte.bold }}>06:00 PM</ButtonText>
            </Button>
            <Button
              style={{ backgroundColor: pallatte.tint }}
              className="flex-grow py-2"
              onPress={() => {
                setDueTime(dayjs().set("hour", 21).set("minute", 0));
                setAdditional("remainder");
              }}
            >
              <ButtonText style={{ color: pallatte.bold }}>09:00 PM</ButtonText>
            </Button>
          </View>
        </View>
      ) : null}
      {additional == "remainder" ? (
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
              setAdditional("repeat");
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
              setAdditional("repeat");
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
              setAdditional("repeat");
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
              setAdditional("repeat");
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
              setAdditional("repeat");
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
              setAdditional("repeat");
            }}
          >
            <ButtonText style={{ color: pallatte.bold }}>
              6 hours before
            </ButtonText>
          </Button>
        </View>
      ) : null}
      {additional == "priority" ? (
        <View className="flex flex-row flex-wrap items-center justify-start gap-2">
          <Text
            className="w-full font-psemibold"
            style={{ color: pallatte.text }}
          >
            Priority
          </Text>
          {priorities.map((pr) => (
            <Button
              key={pr.key}
              style={{ backgroundColor: pr.color }}
              onPress={() => {
                setTask({ ...task, priority: pr.key });
                setAdditional("note");
              }}
              className="flex-grow py-2"
            >
              <ButtonText style={{ color: pallatte.text }}>
                <Flag color={pallatte.text} />
              </ButtonText>
            </Button>
          ))}
        </View>
      ) : null}
      {additional == "note" ? (
        <View>
          <Text
            className="w-full font-psemibold"
            style={{ color: pallatte.text }}
          >
            Add Note
          </Text>
          <TextInput
            className="py-3 px-2 w-full rounded border-0 caret-[#94a3b8] bg-slate-100 dark:bg-slate-300"
            style={{ borderColor: pallatte.tint }}
            placeholder="Add note for the task"
            value={task.note}
            onChangeText={(e) => setTask({ ...task, note: e })}
          />
        </View>
      ) : null}
      {additional == "repeat" ? (
        <View className="flex flex-row flex-wrap items-center justify-start gap-2">
          <Text
            className="w-full font-psemibold"
            style={{ color: pallatte.text }}
          >
            Repeat Task
          </Text>
          <Button
            style={{ backgroundColor: pallatte.tint }}
            className="w-full py-2"
            onPress={() => {
              setTask({ ...task, repeat: "" });
              setAdditional("priority");
            }}
          >
            <ButtonText style={{ color: pallatte.bold }}>No Repeat</ButtonText>
          </Button>
          <Button
            style={{ backgroundColor: pallatte.tint }}
            className="flex-grow py-2"
            onPress={() => {
              setTask({ ...task, repeat: "daily" });
              setAdditional("priority");
            }}
          >
            <ButtonText style={{ color: pallatte.bold }}>Daily</ButtonText>
          </Button>
          <Button
            style={{ backgroundColor: pallatte.tint }}
            className="flex-grow py-2"
            onPress={() => {
              setTask({ ...task, repeat: "weekly" });
              setAdditional("priority");
            }}
          >
            <ButtonText style={{ color: pallatte.bold }}>Weekly</ButtonText>
          </Button>
          <Button
            style={{ backgroundColor: pallatte.tint }}
            className="flex-grow py-2"
            onPress={() => {
              setTask({ ...task, repeat: "monthly" });
              setAdditional("priority");
            }}
          >
            <ButtonText style={{ color: pallatte.bold }}>Monthly</ButtonText>
          </Button>
        </View>
      ) : null}
      <View
        className="flex flex-row justify-end gap-4 pt-2 mt-4 border-t"
        style={{ borderColor: pallatte.text }}
      >
        <Button onPress={closeSheet} className="bg-transparent">
          <ButtonText style={{ color: pallatte.text }}>Cancel</ButtonText>
        </Button>
        <Button onPress={create} style={{ backgroundColor: pallatte.primary }}>
          <ButtonText style={{ color: "white" }}>Done</ButtonText>
        </Button>
      </View>
    </View>
  );
};

export default CreateTask;
