import { DatabaseSync } from 'node:sqlite';

export async function initDb(dbPath: string) : DatabaseSync {
  const database =  new DatabaseSync(dbPath);
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