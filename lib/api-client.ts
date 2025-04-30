import axios from "axios"
// 127.0.0.1 ko duoc thi qua localhost
// This file contains functions to interact with your backend API

export interface Message {
  id: number | string
  role: "user" | "assistant"
  content: string
  source?: "rag" | "model"
  model?: "llama" | "gemini"
  timestamp?: number
}

export interface ApiResponse {
  ragResponse: Message
  llamaResponse: Message
  geminiResponse: Message
}

// Function to send a message to the backend and get responses from all three endpoints
export async function sendMessage(message: string): Promise<ApiResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001" 

    // Call all three endpoints simultaneously using Promise.all
    const [ragResponse, llamaResponse, geminiResponse] = await Promise.all([
      axios.post(`${baseUrl}/rag`, { query: message }),
      axios.post(`${baseUrl}/meta_llama`, { query: message }),
      axios.post(`${baseUrl}/rag`, { query: message }),
    ])

    const timestamp = Date.now()

    // Format the responses into the expected structure
    return {
      ragResponse: {
        id: `rag-${timestamp}`,
        role: "assistant",
        content: ragResponse.data.result,
        source: "rag",
        timestamp,
      },
      llamaResponse: {
        id: `llama-${timestamp}`,
        role: "assistant",
        content: llamaResponse.data.result,
        source: "model",
        model: "llama",
        timestamp,
      },
      geminiResponse: {
        id: `gemini-${timestamp}`,
        role: "assistant",
        content: geminiResponse.data.result,
        source: "model",
        model: "gemini",
        timestamp,
      },
    }
  } catch (error) {
    console.error("Error sending message:", error)
    // Return mock responses in case of error (for development)
    const timestamp = Date.now()
    return {
      ragResponse: {
        id: `rag-${timestamp}`,
        role: "assistant",
        content: "Không thể kết nối đến máy chủ RAG. Vui lòng thử lại sau.",
        source: "rag",
        timestamp,
      },
      llamaResponse: {
        id: `llama-${timestamp}`,
        role: "assistant",
        content: "Không thể kết nối đến máy chủ Meta Llama. Vui lòng thử lại sau.",
        source: "model",
        model: "llama",
        timestamp,
      },
      geminiResponse: {
        id: `gemini-${timestamp}`,
        role: "assistant",
        content: "Không thể kết nối đến máy chủ Gemini. Vui lòng thử lại sau.",
        source: "model",
        model: "gemini",
        timestamp,
      },
    }
  }
}
