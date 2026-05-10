import * as z from "zod"
import { tool } from "langchain";
import { Database } from "bun:sqlite";


export function initTools(database: any) {
  //Add expense tool - to add the expense to the database
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
        console.log(`Expense added: ${title} with amount: ${amount} on date: ${date}`);
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

  //get expense tool - to get the expense from the database
  const getExpenses = tool(
    ({from, to}) => {
      //args validation
      const validatedArgs = z.object({
        from: z.string().describe("Start date for filtering expenses, in YYYY-MM-DD format"),
        to: z.string().describe("End date for filtering expenses, in YYYY-MM-DD format")
      }).parse({ from, to });
      
      try {
        let stmt;
        let rows;
        if (from && to) {
          stmt = database.prepare(`SELECT * FROM expenses WHERE date BETWEEN ? AND ?`);
          rows = stmt.all(from, to);
        } else {
          stmt = database.prepare(`SELECT * FROM expenses`);
          rows = stmt.all();
        }
        return JSON.stringify(rows);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        throw new Error("Failed to fetch expenses");
      }
    },
    {
      name: "get_expenses",
      description: "Get all the expenses from the database for a given date range.",
      schema: z.object({
        from: z.string().describe("Start date for filtering expenses, in YYYY-MM-DD format"),
        to: z.string().describe("End date for filtering expenses, in YYYY-MM-DD format")
      })
    }
  );

  return [addExpense, getExpenses];
}

