import { useTheme } from "@/contexts/ThemeContext";
import dayjs from "dayjs";
import React from "react";
import DateTimePicker, { DateType } from "react-native-ui-datepicker";

type Props = {
  date : DateType;
  setDate : React.Dispatch<React.SetStateAction<DateType>>;
  type?: 'day' | 'time'
}

const DatePicker = ({date , setDate , type = 'day'} : Props) => {
  const {pallatte} = useTheme();
  return (
    <DateTimePicker
      mode="single"
      date={date}
      timePicker={type != 'day'}
      initialView={type}
      calendarTextStyle={{ color: pallatte.text }}
      selectedItemColor={pallatte.primary}
      headerTextStyle={{ color: pallatte.text }}
      headerButtonColor={pallatte.text}
      todayTextStyle={{ borderColor: pallatte.tint }}
      weekDaysTextStyle={{ color: pallatte.text }}
      monthContainerStyle={{backgroundColor : pallatte.bg}}
      yearContainerStyle={{backgroundColor : pallatte.bg}}
      timePickerIndicatorStyle={{backgroundColor : pallatte.primary}}
      timePickerTextStyle={{color : pallatte.text}}
      onChange={({date}) => {
        setDate(date);
      }}
    />
  );
};

export default DatePicker;
