//import { DatabaseSync } from 'node:sqlite';
import { Database } from "bun:sqlite";
//import { Database } from "bun:sqlite";

//const db = new Database("mydb.sqlite");

export async function initDb(dbPath: string) {
  const database = new Database(dbPath);
  const query = `
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `;
  database.exec(query);
  return database;
}