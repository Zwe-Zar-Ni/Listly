import db from "./database";

const categoriesMigration = async () => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL);
  `);
  } catch(e) {
    console.log('Error creating categories table - ' , e)
  }
};
const tasksMigration = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category_id INTEGER,
      note TEXT,
      due_date DATE,
      due_time TIME,
      remainder TIME,
      repeat TEXT,
      is_done BOOLEAN DEFAULT 0,
      priority INTEGER DEFAULT 1,
      progress INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    `);
  } catch(e) {
    console.log('error creating tasks table- ' , e)
  }
};

const subtasksMigration = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sub_tasks (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      task_id INTEGER,
      is_done BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE);
    `);
  } catch(e) {
    console.log('error creating sub tasks table- ' , e)
  }
};

const taskHistoryMigration = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS task_history (
      id INTEGER PRIMARY KEY,
      task_id INTEGER,
      completed_date DATE NOT NULL,
      completed_time TIME NOT NULL,
      completed_for DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE);
    `);
  } catch(e) {
    console.log('error creating task history table- ' , e)
  }
}


export const initiateDb = async () => {
  try {
    // await Promise.all([categoriesMigration, tasksMigration]);
    await categoriesMigration();
    await tasksMigration();
    await subtasksMigration();
    await taskHistoryMigration();
    return true;
  } catch (e) {
    throw new Error("Failed initiating database.");
  }
};