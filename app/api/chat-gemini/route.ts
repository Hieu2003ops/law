import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: openai("gpt-4o"), // Using OpenAI as a stand-in for Gemini
      system:
        "Bạn là một trợ lý AI chuyên về Luật Kinh Tế Việt Nam. Hãy cung cấp thông tin chính xác, đầy đủ và dễ hiểu. Trích dẫn điều luật cụ thể khi có thể.",
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat-gemini API route:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
