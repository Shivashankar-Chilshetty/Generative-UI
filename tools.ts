import * as z from "zod"
import { tool } from "langchain";
import { Database } from "bun:sqlite";


export function initTools(database: any) {
  const addExpense = tool(
    ({ title, amount }) => {
      console.log(`Adding expense: ${title} with amount: ${amount}`);
      const validatedArgs = z.object({
        title: z.string().max(255),
        amount: z.number().positive()
      }).parse({ title, amount });

      const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      // '?' are the placeholders for the values to be inserted, which helps prevent SQL injection attacks
      try {
        const stmt = database.prepare(
          `INSERT INTO expenses (title, amount, date) VALUES (?, ?, ?)`
        );
        stmt.run(title, amount, date);
        // database.run(
        //   `INSERT INTO expenses (title, amount, date) VALUES (?, ?, ?)`,
        //   [title, amount, date]
        // );
        return JSON.stringify({ status: "success" });
      } catch (error) {
        console.error("Error adding expense:", error);
        throw new Error("Failed to add expense");
      }
    },
    {
      name: "add_expense",
      description: "Add the given expense to the database.",
      schema: z.object({
        title: z.string().describe("The expense title"),
        amount: z.number().describe("The amount spent on the expense"),
      }),
    }
  );
  return [addExpense];
}

