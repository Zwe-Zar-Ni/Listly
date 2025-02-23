import { View, Text, FlatList } from "react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useFocusEffect } from "expo-router";
import { tasksByDay, tasksForCalendar } from "@/db/tasks";
import { Task } from "@/types/task";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import TaskCard from "@/components/tasks/TaskCard";
import { format } from "date-fns";

LocaleConfig.locales["fr"] = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "Novenber",
    "December"
  ],
  monthNamesShort: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "Novenber",
    "December"
  ],
  dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  today: "Today"
};
LocaleConfig.defaultLocale = "fr";

const normal = {
  key: "normal",
  color: "green"
};
const daily = {
  key: "daily",
  color: "blue"
};
const weekly = { key: "weekly", color: "orange" };
const monthly = { key: "monthly", color: "red" };

const CalendarPage = () => {
  const { pallatte } = useTheme();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<{
    [key: string]: { dots: { key: string; color: string }[] };
  }>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);

  const fetchData = async (m: number, y: number) => {
    setLoading(true);
    const result = await tasksForCalendar(m, y);
    let obj: { [key: string]: { dots: { key: string; color: string }[] } } = {};
    let hasDaily = false;
    result.forEach((res) => {
      //check if the task is daily,
      //if yes, no need to go further as we will insert task to everyday later
      if (res.repeat == "daily") {
        hasDaily = true;
        return;
      }

      //pass over tasks without due date
      if (!res.due_date) {
        return;
      }

      //just check if the date in already marked with the same task date or repeat type
      if (
        obj[res.due_date] &&
        obj[res.due_date].dots &&
        obj[res.due_date].dots.length
      ) {
        let isInArray = false;
        const key = !res.repeat
          ? normal.key
          : res.repeat == "daily"
          ? daily.key
          : res.repeat == "weekly"
          ? weekly.key
          : monthly.key;
        obj[res.due_date].dots.forEach((dot) => {
          if (dot.key == key) {
            isInArray = true;
          }
        });
        if (isInArray) return;
      }

      //insert to calendar object
      if (!obj[res.due_date]) {
        obj[res.due_date] = { dots: [] };
      }
      obj[res.due_date].dots.push(
        !res.repeat
          ? normal
          : res.repeat == "daily"
          ? daily
          : res.repeat == "weekly"
          ? weekly
          : monthly
      );
    });

    //insert daily tasks
    if (hasDaily) {
      const m = month > 9 ? month : `0${month}`;
      for (let i = 1; i <= 31; i++) {
        const d = i > 9 ? i : `0${i}`;
        const dateString = `${year}-${m}-${d}`;
        if (
          obj[dateString] &&
          obj[dateString].dots &&
          obj[dateString].dots.length
        ) {
          let included = false;
          obj[dateString].dots.forEach((dot) => {
            if (dot.key == "daily") {
              included = true;
              return;
            }
          });
          if (included) {
            return;
          } else {
            obj[dateString].dots.push(daily);
          }
        } else {
          if (
            obj[dateString] &&
            obj[dateString].dots &&
            obj[dateString].dots.length
          ) {
            obj[dateString].dots.push(daily);
          } else {
            obj[dateString] = { dots: [] };
            obj[dateString].dots.push(daily);
          }
        }
      }
    }

    setTasks(obj);
    setLoading(false);
  };

  const handleDayChange = async (date: DateData) => {
    const result = await tasksByDay(date.dateString);
    setSelectedDate(format(date.dateString, "yyyy-MM-dd"));
    setDailyTasks(result);
  };

  const handleMonthChange = async (date: DateData) => {
    setMonth(date.month);
    setYear(date.year);
    await fetchData(date.month, date.year);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(month, year);
    }, [])
  );

  return (
    <SafeAreaView
      className="h-full px-2"
      style={{ backgroundColor: pallatte.bg }}
    >
      <View key={`${pallatte.bg}-${pallatte.primary}/${month}-${year}`}>
        <Calendar
          initialDate={`${year}-${
            month > 9 ? month : "0" + month.toString()
          }-01`}
          enableSwipeMonths={true}
          markingType={"multi-dot"}
          markedDates={tasks}
          hideExtraDays={true}
          onDayPress={handleDayChange}
          onMonthChange={handleMonthChange}
          theme={{
            backgroundColor: pallatte.bg,
            calendarBackground: pallatte.bg,
            // textSectionTitleColor: '#b6c1cd',
            // textSectionTitleDisabledColor: '#d9e1e8',
            selectedDayBackgroundColor: pallatte.primary,
            selectedDayTextColor: "#ffffff",
            todayTextColor: pallatte.primary,
            dayTextColor: pallatte.text,
            textDisabledColor: pallatte.tint,
            dotColor: pallatte.primary,
            selectedDotColor: "#ffffff",
            arrowColor: pallatte.primary,
            disabledArrowColor: pallatte.tint,
            monthTextColor: pallatte.text,
            indicatorColor: pallatte.text,
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "300",
            textDayFontSize: 18,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 12
          }}
        />
      </View>
      <View className="flex flex-row justify-center gap-2 my-4">
        <Text
          className="px-2 py-1 text-xs rounded-sm"
          style={{ backgroundColor: "green", color: "white" }}
        >
          Normal
        </Text>
        <Text
          className="px-2 py-1 text-xs rounded-sm"
          style={{ backgroundColor: "#4667D1", color: "white" }}
        >
          Daily
        </Text>
        <Text
          className="px-2 py-1 text-xs rounded-sm"
          style={{ backgroundColor: "orange", color: "white" }}
        >
          Weekly
        </Text>
        <Text
          className="px-2 py-1 text-xs rounded-sm"
          style={{ backgroundColor: "red", color: "white" }}
        >
          Monthly
        </Text>
      </View>
      <FlatList
        data={dailyTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <>
            <TaskCard
              index={index}
              disableDone={true}
              refresh={async () => {
                handleDayChange({
                  dateString: selectedDate,
                  month: month,
                  year: year,
                  day: 0,
                  timestamp: 0
                });
              }}
              task={item}
            />
          </>
        )}
        ListHeaderComponent={() => (
          <View className="mt-4">
            <Text
              style={{ color: pallatte.text }}
              className="underline font-psemibold"
            >
              {selectedDate}
            </Text>
          </View>
        )}
        // ListFooterComponent={() => (
        //   <Text>{JSON.stringify(dailyTasks)}</Text>
        // )}
      />
    </SafeAreaView>
  );
};

export default CalendarPage;
