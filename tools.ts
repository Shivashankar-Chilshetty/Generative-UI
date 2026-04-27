import * as z from "zod"
import { tool } from "langchain"
import { DatabaseSync } from 'node:sqlite';

export function initTools(database: DatabaseSync) {
  const addExpense = tool(
    ({ title, amount }) => {
      console.log(`Adding expense: ${title} with amount: ${amount}`);
      return JSON.stringify({ status: "success" });
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

