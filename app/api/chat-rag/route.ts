import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Simulate RAG pipeline by adding context to the system prompt
    const result = streamText({
      model: openai("gpt-4o"),
      system: `
        Bạn là một trợ lý AI chuyên về Luật Kinh Tế Việt Nam sử dụng RAG pipeline.
        
        Thông tin tham khảo:
        - Luật Doanh nghiệp 2020 (Luật số 59/2020/QH14)
        - Luật Đầu tư 2020 (Luật số 61/2020/QH14)
        - Luật Thương mại 2005 (Luật số 36/2005/QH11)
        - Bộ luật Dân sự 2015 (Luật số 91/2015/QH13)
        - Luật Cạnh tranh 2018 (Luật số 23/2018/QH14)
        
        Hãy trả lời dựa trên thông tin pháp luật chính xác, trích dẫn điều luật cụ thể khi có thể.
        Đây là phản hồi từ RAG pipeline, nên hãy tập trung vào việc trích dẫn thông tin từ nguồn dữ liệu.
      `,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat-rag API route:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
