import db from "./database";
import { History, Task } from "@/types/task";
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth
} from "date-fns";
import dayjs from "dayjs";

export const createTask = async (task: Task) => {
  try {
    const result = await db.runAsync(
      "INSERT INTO tasks (name , category_id , note , due_date , due_time , remainder , repeat , is_done , priority , progress) VALUES (? , ? , ? , ? , ? , ? , ? , ? , ? , ?)",
      task.name,
      task.category_id ?? null,
      task.note ?? null,
      task.due_date ?? null,
      task.due_time ?? null,
      task.remainder ?? null,
      task.repeat ?? null,
      false,
      task.priority,
      0
    );
    return {
      id: result.lastInsertRowId
    };
  } catch (e) {
    throw new Error("Failed to create task.");
  }
};

const getDateForRepeats = (date: string, type: string) => {
  const initial = format(date, "yyyy-MM-dd");
  const yesterday = new Date(dayjs(new Date()).subtract(1, "day").toString());
  const endOfTargetMonth = endOfMonth(new Date());
  let result = new Date(initial);
  while (isBefore(result, endOfTargetMonth) && isBefore(initial, yesterday)) {
    if (isAfter(result, yesterday)) {
      break;
    }
    if (type == "weekly") {
      result = addDays(result, 7);
    } else {
      result = addMonths(result, 1);
    }
  }
  return format(result, "yyyy-MM-dd");
};

export const getTasks = async () => {
  // does not fetch previous tasks or finished tasks
  //only when date is greater than or equal today or date is null which means task has no due date
  const tasks: Task[] = await db.getAllAsync(
    "SELECT * FROM tasks WHERE (due_date >= DATE('now') OR repeat IS NOT NULL) AND is_done = 0 ORDER BY due_date ASC"
  );
  const obj: { todayTasks: Task[]; futureTasks: Task[] } = {
    todayTasks: [],
    futureTasks: []
  };
  tasks.forEach((tk) => {
    //if repeat is weekly , today has to be 7 days ago
    const today = format(new Date(), "yyyy-MM-dd");
    const week = format(
      new Date(dayjs().subtract(7, "days").toString()),
      "yyyy-MM-dd"
    );
    const weekAgoWithCreated =
      tk.created_at && week == format(tk.created_at, "yyyy-MM-dd");
    const month = format(
      new Date(dayjs().subtract(1, "month").toString()),
      "yyyy-MM-dd"
    );
    const monthAgoWithCreated =
      tk.created_at && month == format(tk.created_at, "yyyy-MM-dd");

    const weekAgoWithDue = tk.due_date && tk.due_date == week;
    const monthAgoWithDue = tk.due_date && tk.due_date == month;
    if (tk.repeat && tk.repeat == "weekly") {
      if (tk.due_date) {
        tk.due_date = getDateForRepeats(tk.due_date, "weekly");
      } else if (tk.created_at) {
        tk.due_date = getDateForRepeats(tk.created_at, "weekly");
      }
    } else if (tk.repeat == "monthly") {
      if (tk.due_date) {
        tk.due_date = getDateForRepeats(tk.due_date, "monthly");
      } else if (tk.created_at) {
        tk.due_date = getDateForRepeats(tk.created_at, "monthly");
      }
    } else if (tk.repeat == "daily") {
      tk.due_date = format(new Date(), "yyyy-MM-dd");
    }
    if (
      (tk.repeat == "daily" &&
        ((tk.due_date && tk.due_date == today) ||
          (!tk.due_date && (weekAgoWithCreated || monthAgoWithCreated)) ||
          (tk.due_date && (weekAgoWithDue || monthAgoWithDue)))) ||
      (tk.due_date && isSameDay(new Date(tk.due_date), new Date()))
    ) {
      if (!tk.due_date) return;
      obj.todayTasks.push(tk);
      return;
      // db.getFirstAsync<any>(
      //   "SELECT * FROM task_history WHERE task_id = ? AND completed_for = ?",
      //   tk.id,
      //   tk.due_date
      // ).then((res: History) => {
      //   if (!res) {
      //     obj.todayTasks.push(tk);
      //   }
      // });
    } else if (
      tk.due_date == null ||
      isAfter(new Date(tk.due_date), new Date())
    ) {
      if (!tk.due_date) return;
      obj.todayTasks.push(tk);
      return;
      // db.getFirstAsync<any>(
      //   "SELECT * FROM task_history WHERE task_id = ? AND completed_for = ?",
      //   tk.id,
      //   tk.due_date
      // ).then((res: History) => {
      //   if (!res) {
      //     obj.todayTasks.push(tk);
      //   }
      // });
    }
  });
  return obj;
};

export const getPreviousTasks = async (): Promise<Task[]> => {
  try {
    const weekAgo = format(dayjs().subtract(7, "days").toDate(), "yyyy-MM-dd");

    const [completedTasks, taskHistory] = await Promise.all([
      db.getAllAsync<Task>(
        "SELECT * FROM tasks WHERE created_at >= ? AND is_done = 1 ORDER BY created_at DESC",
        [weekAgo]
      ),
      db.getAllAsync<History>(
        "SELECT * FROM task_history WHERE created_at >= ? ORDER BY created_at DESC",
        [weekAgo]
      )
    ]);

    const historyTasks = await Promise.all(
      taskHistory.map(async (h) => {
        const task = await db.getFirstAsync<Task>(
          "SELECT * FROM tasks WHERE id = ?",
          [h.task_id]
        );
        if (task) {
          return {
            ...task,
            due_date: h.completed_for,
            is_done: true
          };
        }
        return null;
      })
    );

    const allTasks = [
      ...completedTasks,
      ...historyTasks.filter((t): t is NonNullable<typeof t> => t !== null)
    ];

    return allTasks;
  } catch (error) {
    console.error("Error fetching previous tasks:", error);
    throw new Error("Failed to fetch previous tasks");
  }
};

export const getTaskDetails = async (id: number | string) => {
  try {
    const task: Task | null = await db.getFirstAsync(
      "SELECT * FROM tasks where id = ?",
      id
    );
    return task;
  } catch (e) {
    throw new Error("Failed to fetch task details.");
  }
};

function populateWeeklyTasksForMonth(
  dueDate: string,
  month: number,
  year: number
) {
  const dt = format(
    dayjs(dueDate).subtract(14, "days").toString(),
    "yyyy-MM-dd"
  );
  const startOfTargetMonth = startOfMonth(new Date(year, month - 1));
  const endOfTargetMonth = endOfMonth(new Date(year, month - 1));
  const initialDate = parseISO(dt);
  let currentDate = initialDate;
  const dates = [];

  // Ensure the dates fall within the target month and year
  while (
    isBefore(currentDate, endOfTargetMonth) ||
    currentDate.toISOString().startsWith(format(endOfTargetMonth, "yyyy-MM-dd"))
  ) {
    if (isSameMonth(currentDate, startOfTargetMonth)) {
      dates.push(format(currentDate, "yyyy-MM-dd"));
    }
    currentDate = addDays(currentDate, 7);
  }

  return dates;
}

export const tasksForCalendar = async (month: number, year: number) => {
  const m = month > 9 ? month : `0${month}`;
  const start = format(dayjs(`${year}-${m}-01`).toString(), "yyyy-MM-dd");
  try {
    let tasks: Task[] = await db.getAllAsync(
      `SELECT id,name,due_date,repeat,created_at FROM tasks WHERE due_date >= ? OR (repeat == 'daily' OR repeat == 'monthly' OR repeat == 'weekly') ORDER BY due_date DESC`,
      [start]
    );

    const extra: Task[] = [];

    tasks = tasks.map((tk) => {
      if (tk.repeat == "monthly") {
        const m = month > 9 ? month : `0${month}`;
        let day: string | number = "";
        if (!tk.due_date) {
          day =
            dayjs(tk.created_at).date() > 9
              ? dayjs(tk.created_at).date()
              : `0${dayjs(tk.created_at).date()}`;
          tk.due_date = tk.created_at
            ? format(tk.created_at, "yyyy-MM-dd")
            : undefined;
        } else {
          day =
            dayjs(tk.due_date).date() > 9
              ? dayjs(tk.due_date).date()
              : `0${dayjs(tk.due_date).date()}`;
        }
        const taskForThisMonth = `${year}-${m}-${day}`;
        extra.push({
          ...tk,
          due_date: taskForThisMonth
        });
      } else if (tk.repeat == "weekly") {
        if (tk.due_date) {
          const weeklyTasks = populateWeeklyTasksForMonth(
            tk.due_date,
            month,
            year
          );
          weeklyTasks.forEach((date) => {
            extra.push({
              ...tk,
              due_date: date
            });
          });
        } else if (tk.created_at) {
          const weeklyTasks = populateWeeklyTasksForMonth(
            format(tk.created_at, "yyyy-MM-dd"),
            month,
            year
          );
          weeklyTasks.forEach((date) => {
            extra.push({
              ...tk,
              due_date: date
            });
          });
        }
        tk.due_date = "";
      }
      return tk;
    });
    tasks = [...tasks, ...extra];
    return tasks;
  } catch (e) {
    throw new Error("Failed to fetch tasks");
  }
};

const checkRepeatAlignment = (
  date: string,
  type: string,
  selectedDate: string,
  name: string = ""
) => {
  if (
    type == "monthly" &&
    dayjs(new Date(date)).date() == dayjs(new Date(selectedDate)).date()
  ) {
    return true;
  }
  if (
    type == "monthly" &&
    dayjs(new Date(date)).date() != dayjs(new Date(selectedDate)).date()
  ) {
    return false;
  }

  //calculate for weekly tasks
  const initial = dayjs(new Date(format(date, "yyyy-MM-dd")))
    .subtract(14, "days")
    .toString();
  const selected = new Date(format(selectedDate, "yyyy-MM-dd"));
  const endOfTargetMonth = endOfMonth(new Date(selectedDate));
  let result = new Date(initial);
  let isAligned = false;

  while (isBefore(result, endOfTargetMonth)) {
    if (isSameDay(result, selected)) {
      isAligned = true;
      break;
    }
    result = addDays(result, 7);
  }
  return isAligned;
};

export const tasksByDay = async (date: string) => {
  try {
    const tasks: Task[] = await db.getAllAsync(
      `SELECT id,name,due_date,repeat,created_at FROM tasks WHERE due_date == ? OR (repeat == 'daily' OR repeat == 'monthly' OR repeat == 'weekly')`,
      [date]
    );
    let result: Task[] = [];
    tasks.forEach((tk) => {
      if (tk.due_date == date || tk.repeat == "daily") {
        tk.due_date = date;
        result.push(tk);
      } else if (tk.repeat == "weekly") {
        let isAligned = false;
        if (tk.due_date) {
          isAligned = checkRepeatAlignment(tk.due_date, "weekly", date);
        } else if (tk.created_at) {
          tk.name = `${tk.name}`;
          isAligned = checkRepeatAlignment(tk.created_at, "weekly", date);
        }
        if (isAligned) {
          tk.due_date = date;
          result.push(tk);
        }
      } else if (tk.repeat == "monthly") {
        let isAligned = false;
        if (tk.due_date) {
          isAligned = checkRepeatAlignment(
            tk.due_date,
            "monthly",
            date,
            tk.name
          );
        } else if (tk.created_at) {
          isAligned = checkRepeatAlignment(
            tk.created_at,
            "monthly",
            date,
            tk.name
          );
        }
        if (isAligned) {
          tk.due_date = date;
          result.push(tk);
        }
      }
    });
    result = result.map((res) => {
      if (res.due_date) {
        db.getFirstAsync<any>(
          "SELECT * FROM task_history WHERE task_id = ? AND completed_for = ?",
          res.id,
          res.due_date
        ).then((his: History) => {
          if (his) {
            res.is_done = true;
            return true;
          }
        });
      }
      return res;
    });
    console.log(result)
    return result;
  } catch (e) {
    throw new Error("Error Fetching tasks");
  }
};

export const markDone = async (
  id: number,
  isDone: boolean = true,
  compeletedFor: string = format(new Date(), "yyyy-MM-dd")
) => {
  try {
    // console.log(compeletedFor)
    // for (let i = 0; i < 100; i++) {
    //   await db.runAsync("DELETE FROM tasks WHERE id = ?", i);
    // }
    // for (let i = 0; i < 100; i++) {
    //   await db.runAsync("DELETE FROM task_history WHERE id = ?", i);
    // }
    const task: Task | null = await db.getFirstAsync(
      "SELECT * FROM tasks WHERE id = ?",
      id
    );
    if (
      (task && task.repeat === "daily") ||
      task?.repeat === "weekly" ||
      task?.repeat === "monthly"
    ) {
      const date = format(new Date(), "yyyy-MM-dd");
      const time = format(new Date(), "hh-mm");
      await db.runAsync(
        "INSERT INTO task_history (task_id , completed_date , completed_time , completed_for) VALUES (? , ? , ? , ?)",
        id,
        date,
        time,
        compeletedFor
      );
      const history = await db.getAllAsync(
        "SELECT * FROM task_history WHERE task_id = ?",
        id
      );
      console.log(history);
      return true;
    } else {
      await db.getAllAsync(
        "UPDATE tasks SET is_done = ? , progress = ? WHERE id = ?",
        !isDone,
        !isDone ? 100 : 0,
        id
      );
      return true;
    }
  } catch (e) {
    throw new Error("Failed to update task.");
  }
};

export const changePriority = async (id: number, pr: number) => {
  try {
    await db.runAsync("UPDATE tasks SET priority = ? WHERE id = ?", pr, id);
    return true;
  } catch (e) {
    throw new Error("Failed to update task.");
  }
};

export const updateName = async (id: number, name: string) => {
  try {
    await db.runAsync("UPDATE tasks SET name = ? WHERE id = ?", name, id);
    return true;
  } catch (e) {
    throw new Error("Failed to update task name.");
  }
};

export const updateCategoryId = async (id: number, category_id: number) => {
  try {
    await db.runAsync(
      "UPDATE tasks SET category_id = ? WHERE id = ?",
      category_id,
      id
    );
    return true;
  } catch (e) {
    throw new Error("Failed to update task category.");
  }
};

export const updateAdditionalFields = async (id: number, task: Task) => {
  try {
    await db.runAsync(
      "UPDATE tasks SET due_date = ? , due_time = ? , remainder = ? , repeat = ? WHERE id = ?",
      task.due_date ?? null,
      task.due_time ?? null,
      task.remainder ?? null,
      task.repeat ?? null,
      id
    );
    return true;
  } catch (e) {
    throw new Error("Failed to update task additional fields.");
  }
};

export const updateDueDate = async (id: number, date: string | undefined) => {
  try {
    await db.runAsync(
      "UPDATE tasks SET due_date = ? WHERE id = ?",
      date ?? null,
      id
    );
    return true;
  } catch (e) {
    throw new Error("Failed to update task due date.");
  }
};

export const updateDueTime = async (id: number, time: string | undefined) => {
  try {
    await db.runAsync(
      "UPDATE tasks SET due_time = ? WHERE id = ?",
      time ?? null,
      id
    );
    return true;
  } catch (e) {
    throw new Error("Failed to update task due time.");
  }
};

export const updateRemainder = async (id: number, time: string | undefined) => {
  try {
    await db.runAsync(
      "UPDATE tasks SET remainder = ? WHERE id = ?",
      time ?? null,
      id
    );
    return true;
  } catch (e) {
    throw new Error("Failed to update task remainder.");
  }
};

export const updateRepeat = async (id: number, repeat: string) => {
  try {
    await db.runAsync(
      "UPDATE tasks SET repeat = ? WHERE id = ?",
      repeat ?? null,
      id
    );
    return true;
  } catch (e) {
    throw new Error("Failed to update task repeatition.");
  }
};

export const updateNote = async (id: number, note: string) => {
  try {
    await db.runAsync(
      "UPDATE tasks SET note = ? WHERE id = ?",
      note ?? null,
      id
    );
    return true;
  } catch (e) {
    throw new Error("Failed to update task repeatition.");
  }
};

export const updateProgress = async (id: number, progress: number) => {
  try {
    await db.runAsync(
      "UPDATE tasks SET progress = ? WHERE id = ?",
      progress,
      id
    );
    return true;
  } catch (e) {
    throw new Error("Failed to update task progress.");
  }
};

export const deleteTask = async (id: number) => {
  try {
    await db.runAsync("DELETE FROM tasks where id = ?", id);
    return true;
  } catch (e) {
    throw new Error("Failed to delete task.");
  }
};
