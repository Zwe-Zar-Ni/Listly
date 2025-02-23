import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabaseSync("listly");
export default db;
