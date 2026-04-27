import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MessagesAnnotation } from "@langchain/langgraph";
import { initDb } from "./db.ts";
import { initTools } from "./tools.ts";
import { ToolNode } from "@langchain/langgraph/prebuilt";

//Initialize the database
const database = initDb("./expenses.db").then((db: any) => {
  console.log("Database initialized");
}).catch((error: any) => {
  console.error("Error initializing database:", error);
});

const tools = initTools(database);

// Initialize the LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: "your-api-key"
});

//Tool node - Providing tools to toolNode
const toolNode = new ToolNode(tools) 


async function callModel(state: typeof MessagesAnnotation.State) {
  //providing tools to LLM
  const llmWithTools = llm.bindTools(tools);
  const response = await llmWithTools.invoke([
    {
      role: 'system',
      content: `You are a helpful expense tracking assistant, 
      that helps users manage their expenses. Current datetime: ${new Date().toISOString()} 
      Call add_expense tool to add the expense to database.`
    },
    ...state.messages,    //store message history & send
  ])
  return { messages: [response] };  //adding message response to the state
}