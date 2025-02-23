import db from "./database";
import { Subtask, Task } from "@/types/task";

export const createSubtask = async (task: Subtask) => {
  console.log("&&&&&&&&&&&&&&&&&&&&&")
  console.log('creating task ' , task.name)
  try {
    const result = await db.runAsync(
      "INSERT INTO sub_tasks (name , task_id , is_done) VALUES (? , ? , ?)",
      task.name,
      task.task_id,
      false
    );
    if(result) {
      const tasks: Subtask[] = await db.getAllAsync(
        `SELECT * FROM sub_tasks WHERE task_id = ${task.task_id} ORDER BY created_at ASC`
      );
      if(tasks && tasks.length) {
        let count = 0;
        tasks.forEach((t) => {
          if(t.is_done) {
            count = count + 1;
          }
        });
        const percentage = Math.round((count / tasks.length) * 100);
        console.log(tasks.length , count , percentage)
        const updated = await db.runAsync('UPDATE tasks SET progress = ? WHERE id = ?' , percentage , task.task_id)
        if(updated) {
          return {tasks , percentage};
        }
      }
    }
  } catch (e) {
    console.log("error" , e)
    throw new Error("Failed to create task.");
  }
};

export const getSubtasks = async (parentId: Number) => {
  console.log('getting sub task')
  try {
    const tasks: Subtask[] = await db.getAllAsync(
      `SELECT * FROM sub_tasks WHERE task_id = ${parentId} ORDER BY created_at ASC`
    );
    return tasks;
  } catch (e) {
    console.log('error , ' , e)
    throw new Error("Failed to fetch tasks.");
  }
};

export const subMarkDone = async (task : Subtask) => {
  const is_done = !task.is_done;
  try {
    const result = await db.runAsync('UPDATE sub_tasks SET is_done = ? WHERE id = ?', is_done , task.id);
    if(result) {
      const tasks: Subtask[] = await db.getAllAsync(
        `SELECT * FROM sub_tasks WHERE task_id = ${task.task_id} ORDER BY created_at ASC`
      );
      if(tasks && tasks.length) {
        let count = 0;
        tasks.forEach((t) => {
          if(t.is_done) {
            count = count + 1;
          }
        });
        const percentage = Math.round((count / tasks.length) * 100);
        console.log(tasks.length , count , percentage)
        const updated = await db.runAsync('UPDATE tasks SET progress = ? WHERE id = ?' , percentage , task.task_id)
        if(updated) {
          return {tasks , percentage};
        }
      }
    }
  } catch (e) {
    console.log('error , ' , e)
    throw new Error("Failed to updating task.");
  }
}

export const deleteSubtask = async (task : Subtask) => {
  try {
    const result = await db.runAsync("DELETE FROM sub_tasks where id = ?", task.id);
    if(result) {
      const tasks: Subtask[] = await db.getAllAsync(
        `SELECT * FROM sub_tasks WHERE task_id = ${task.task_id} ORDER BY created_at ASC`
      );
      if(tasks && tasks.length) {
        let count = 0;
        tasks.forEach((t) => {
          if(t.is_done) {
            count = count + 1;
          }
        });
        const percentage = Math.round((count / tasks.length) * 100);
        console.log(tasks.length , count , percentage)
        const updated = await db.runAsync('UPDATE tasks SET progress = ? WHERE id = ?' , percentage , task.task_id)
        if(updated) {
          return {tasks , percentage};
        }
      }
    }
  } catch (e) {
    console.log('error , ' , e)
    throw new Error("Failed to deleting task.");
  }
}