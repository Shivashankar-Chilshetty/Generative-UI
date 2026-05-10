import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { initDb } from "./db.ts";
import { initTools } from "./tools.ts";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage } from "langchain";

//Initialize the database
const database = await initDb("mydb.sqlite");

const tools = initTools(database);
//console.log("Tools initialized:", tools);

// Initialize the LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  //apiKey: "your-api-key"
});

//Tool node - Providing tools to toolNode
const toolNode = new ToolNode(tools)

//call model node
async function callModel(state: typeof MessagesAnnotation.State) {
  //providing tools to LLM
  const llmWithTools = llm.bindTools(tools);
  const response = await llmWithTools.invoke([
    {
      role: 'system',
      content: `You are a helpful expense tracking assistant, 
      that helps users manage their expenses. Current datetime: ${new Date().toISOString()} 
      Call add_expense tool to add the expense to database.
      Call get_expenses tool to get the list of expenses for a given date range from the database.
      Call generate_expense_chart tool only when user needs to visualize the expenses.`
    },
    ...state.messages,    //store message history & send
  ])
  return { messages: [response] };  //adding message response to the state
}


//Conditional Edge - To check if the conversation should continue or not
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages.at(-1) as AIMessage; //get the last message
  if (lastMessage.tool_calls?.length) { //check if there are any tool calls in the last message i,e check if AI said to make any tool calls
    return 'tools';    //if yes - then return tools
  }
  return '__end__';
}

function shouldCallModel(state: typeof MessagesAnnotation.State) {
  //todo: change this when chart tool will be implemented
  return 'callModel';  //if no - then return callModel to continue the conversation
}
//Graph 

const graph = new StateGraph(MessagesAnnotation)
  .addNode('callModel', callModel)
  .addNode('tools', toolNode)      //calling langgraph's inbuild toolNode to execute tools & send the result back
  .addEdge('__start__', 'callModel')
  .addConditionalEdges('callModel', shouldContinue, {
    __end__: '__end__',
    tools: 'tools',
  })
  .addConditionalEdges('tools', shouldCallModel, {
    callModel: 'callModel',
  });


//compiling the graph
const agent = graph.compile({
  //adding in-memory saver - to maintain the state history
  checkpointer: new MemorySaver(),
});

async function main() {
  const response = await agent.invoke({
    messages: [{
      role: 'user',
      content: 'Can you visualize how much i have spent this year group by months?'
    }],
  },
  { configurable: { thread_id: '1' } }
  ); //adding threadId to track each message response
  console.log("Agent response:", JSON.stringify(response, null, 2));
}

main();