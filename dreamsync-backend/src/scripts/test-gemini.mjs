import "dotenv/config";
import { generateInterpretationWithLLM } from "./src/services/llm.service.js";

async function run() {
  try {
    const res = await generateInterpretationWithLLM("Analyze this dream: driving a flying car.");
    console.log("Success:", res);
  } catch(e) {
    console.error("Failed:", e.message);
  }
}
run();
