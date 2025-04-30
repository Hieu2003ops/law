import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json()

    // Different system prompts based on selected model
    const systemPrompt =
      model === "llama"
        ? "Bạn là trợ lý AI Meta Llama chuyên về Luật Kinh Tế Việt Nam. Hãy trả lời ngắn gọn, súc tích và dễ hiểu."
        : "Bạn là trợ lý AI Gemini chuyên về Luật Kinh Tế Việt Nam. Hãy trả lời chi tiết, đầy đủ với phân tích sâu sắc."

    const result = streamText({
      model: openai("gpt-4o"), // Using OpenAI as a stand-in for both models
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat-model API route:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
