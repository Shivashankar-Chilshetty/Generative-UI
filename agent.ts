import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MessagesAnnotation } from "@langchain/langgraph";
import { initDb } from "./db.ts";

//Initialize the database
const database = initDb("./expenses.db").then((db:any) => {
  console.log("Database initialized");
}).catch((error:any) => {
  console.error("Error initializing database:", error);
});
// Initialize the LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: "your-api-key"
});

async function callModel(state: typeof MessagesAnnotation.State) {
  
  return state;
}