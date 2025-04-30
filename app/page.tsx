"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MoonIcon,
  SunIcon,
  SendIcon,
  HistoryIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  ScaleIcon,
  GavelIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { TypingEffect } from "@/components/typing-effect"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { sendMessage, type Message } from "@/lib/api-client"

// Start with empty chat
const initialMessages: Message[] = []

// Store all model responses for each user query
interface ModelResponses {
  [queryId: string]: {
    llama?: Message
    gemini?: Message
  }
}

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<string>("llama")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [modelResponses, setModelResponses] = useState<ModelResponses>({})
  const [isLoading, setIsLoading] = useState(false)
  const [newRagMessage, setNewRagMessage] = useState<Message | null>(null)
  const [newModelMessage, setNewModelMessage] = useState<Message | null>(null)
  const [lastQueryId, setLastQueryId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | number | null>(null)

  // Fix hydration issues with theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update displayed model message when selected model changes
  useEffect(() => {
    if (lastQueryId && modelResponses[lastQueryId]) {
      const modelResponse = modelResponses[lastQueryId][selectedModel as keyof (typeof modelResponses)[string]]
      if (modelResponse) {
        // Filter out previous model response for this query
        const filteredMessages = messages.filter(
          (msg) => !(msg.source === "model" && msg.timestamp === modelResponses[lastQueryId].llama?.timestamp),
        )
        setMessages([...filteredMessages, modelResponse])
      }
    }
  }, [selectedModel])

  // Update the handleSubmit function to better handle errors
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const queryId = Date.now().toString()
    setLastQueryId(queryId)

    // Add user message
    const newUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call all three API endpoints simultaneously
      const response = await sendMessage(input)

      console.log("RAG Response:", response.ragResponse)
      console.log("Model Response:", response.llamaResponse)

      // Show RAG response with typing effect
      setNewRagMessage(response.ragResponse)

      // Wait a bit before showing model response (for better UX)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show selected model response with typing effect
      const modelResponse = selectedModel === "llama" ? response.llamaResponse : response.geminiResponse
      setNewModelMessage(modelResponse)

      // Store both model responses
      setModelResponses((prev) => ({
        ...prev,
        [queryId]: {
          llama: response.llamaResponse,
          gemini: response.geminiResponse,
        },
      }))

      // Wait for typing effects to complete (simulated)
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Add responses to the messages list
      setMessages((prev) => [...prev, response.ragResponse, modelResponse])

      // Clear the typing effects
      setNewRagMessage(null)
      setNewModelMessage(null)
    } catch (error) {
      console.error("Error sending message:", error)

      // Add error messages to the chat
      const errorTimestamp = Date.now()

      const ragErrorMessage: Message = {
        id: `rag-error-${errorTimestamp}`,
        role: "assistant",
        content: "Không thể kết nối đến máy chủ RAG. Vui lòng thử lại sau.",
        source: "rag",
        timestamp: errorTimestamp,
      }

      const modelErrorMessage: Message = {
        id: `model-error-${errorTimestamp}`,
        role: "assistant",
        content: "Không thể kết nối đến máy chủ Meta Llama. Vui lòng thử lại sau.",
        source: "model",
        model: selectedModel as "llama" | "gemini",
        timestamp: errorTimestamp,
      }

      setMessages((prev) => [...prev, ragErrorMessage, modelErrorMessage])

      // Clear any typing effects
      setNewRagMessage(null)
      setNewModelMessage(null)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string | number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Tạo các cặp tin nhắn (câu hỏi và câu trả lời) để hiển thị theo thứ tự thời gian
  const createMessagePairs = (messages: Message[], source: "rag" | "model") => {
    const pairs: { user: Message; assistant: Message | null }[] = []
    const userMessages = messages.filter((msg) => msg.role === "user")

    userMessages.forEach((userMsg) => {
      // Tìm tin nhắn trả lời tương ứng
      const assistantMsg = messages.find(
        (msg) =>
          msg.role === "assistant" &&
          msg.source === source &&
          msg.timestamp &&
          userMsg.timestamp &&
          msg.timestamp > userMsg.timestamp &&
          (pairs.length === 0 ||
            !pairs[pairs.length - 1].assistant ||
            msg.timestamp > pairs[pairs.length - 1].assistant!.timestamp),
      )

      pairs.push({
        user: userMsg,
        assistant: assistantMsg || null,
      })
    })

    return pairs
  }

  // Tạo các cặp tin nhắn cho cả hai panel
  const ragMessagePairs = createMessagePairs(messages, "rag")
  const modelMessagePairs = createMessagePairs(messages, "model")

  return (
    <div
      className={`flex flex-col min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-10 ${
          theme === "dark"
            ? "bg-gray-800 border-b border-gray-700 shadow-md"
            : "bg-white border-b border-gray-200 shadow-sm"
        } transition-colors duration-300`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${
                theme === "dark"
                  ? "bg-gradient-to-br from-red-600 to-red-800"
                  : "bg-gradient-to-br from-red-500 to-red-700"
              } text-white shadow-lg`}
            >
              <ScaleIcon className="h-6 w-6" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${theme === "dark" ? "text-yellow-400" : "text-red-700"} transition-colors duration-300`}
              >
                Luật Kinh Tế Việt Nam
              </h1>
              <p
                className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} transition-colors duration-300`}
              >
                Trợ lý AI chuyên về Luật Kinh Tế
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${
                theme === "dark" ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"
              } transition-colors duration-300`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {mounted && theme === "dark" ? (
                <SunIcon className="h-[1.2rem] w-[1.2rem] text-yellow-400" />
              ) : (
                <MoonIcon className="h-[1.2rem] w-[1.2rem] text-red-700" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - RAG Pipeline */}
        <div
          className={`flex flex-col h-[calc(100vh-200px)] rounded-xl overflow-hidden ${
            theme === "dark"
              ? "border border-gray-700 bg-gray-800 shadow-md"
              : "border border-gray-200 bg-white shadow-lg"
          } transition-all duration-300`}
        >
          <div
            className={`p-4 ${
              theme === "dark"
                ? "border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700"
                : "border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100"
            } transition-colors duration-300 flex justify-between items-center h-[60px]`}
          >
            <div className="flex items-center gap-2">
              <GavelIcon
                className={`h-5 w-5 ${theme === "dark" ? "text-yellow-400" : "text-red-700"} transition-colors duration-300`}
              />
              <h2
                className={`font-semibold ${theme === "dark" ? "text-yellow-400" : "text-red-700"} transition-colors duration-300`}
              >
                Phân Tích Pháp Luật
              </h2>
            </div>
            {/* Add an empty div to balance the header with the right panel */}
            <div className="w-[150px]"></div>
          </div>
          <div
            className={`flex-1 overflow-auto p-4 space-y-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"} transition-colors duration-300`}
          >
            {/* Hiển thị các cặp tin nhắn theo thứ tự thời gian */}
            {ragMessagePairs.map((pair, index) => (
              <div key={`rag-pair-${index}`} className="space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div
                    className={cn(
                      "max-w-[95%] rounded-lg p-4 group relative transition-all duration-300",
                      theme === "dark" ? "bg-red-600 text-white shadow-md" : "bg-red-500 text-white shadow-md",
                    )}
                  >
                    <div className="prose dark:prose-invert prose-sm">
                      {pair.user.content.split("\n").map((line, i) => (
                        <p key={i} className={i > 0 ? "mt-2" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assistant message (if available) */}
                {pair.assistant && (
                  <div className="flex justify-start">
                    <div
                      className={cn(
                        "max-w-[95%] rounded-lg p-4 group relative transition-all duration-300",
                        theme === "dark"
                          ? "bg-gray-700 border border-gray-600 text-gray-100 shadow-md"
                          : "bg-red-50 border border-red-100 text-gray-800 shadow-sm",
                      )}
                    >
                      <button
                        onClick={() => copyToClipboard(pair.assistant!.content, pair.assistant!.id)}
                        className={`absolute top-2 right-2 p-1 rounded-md ${
                          theme === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-red-100 text-black hover:bg-red-200"
                        } opacity-0 group-hover:opacity-100 transition-all duration-300`}
                        aria-label="Copy to clipboard"
                      >
                        {copiedId === pair.assistant!.id ? (
                          <CheckIcon className={`h-4 w-4 ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />
                        ) : (
                          <CopyIcon className={`h-4 w-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
                        )}
                      </button>

                      {/* Sử dụng MarkdownRenderer để hiển thị nội dung */}
                      <MarkdownRenderer
                        content={pair.assistant.content}
                        className={theme === "dark" ? "" : "light-mode"}
                      />
                    </div>
                  </div>
                )}

                {/* Typing effect for new RAG message */}
                {newRagMessage && index === ragMessagePairs.length - 1 && !pair.assistant && (
                  <div className="flex justify-start">
                    <div
                      className={`max-w-[95%] rounded-lg p-4 ${
                        theme === "dark" ? "bg-gray-700 border border-gray-600" : "bg-red-50 border border-red-100"
                      } transition-colors duration-300`}
                    >
                      <div className={`prose ${theme === "dark" ? "dark:prose-invert" : "text-gray-800"} prose-sm`}>
                        <TypingEffect text={newRagMessage.content} typingSpeed={20} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Model Response (Llama/Gemini) */}
        <div
          className={`flex flex-col h-[calc(100vh-200px)] rounded-xl overflow-hidden ${
            theme === "dark"
              ? "border border-gray-700 bg-gray-800 shadow-md"
              : "border border-gray-200 bg-white shadow-lg"
          } transition-all duration-300`}
        >
          <div
            className={`p-4 ${
              theme === "dark"
                ? "border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700"
                : "border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100"
            } transition-colors duration-300 flex justify-between items-center h-[60px]`}
          >
            <div className="flex items-center gap-2">
              <HistoryIcon
                className={`h-5 w-5 ${theme === "dark" ? "text-yellow-400" : "text-red-700"} transition-colors duration-300`}
              />
              <h2
                className={`font-semibold ${theme === "dark" ? "text-yellow-400" : "text-red-700"} transition-colors duration-300`}
              >
                Phản Hồi Mô Hình
              </h2>
            </div>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger
                className={`w-[150px] ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-gray-200"
                    : "border-gray-300 bg-white text-gray-800"
                } transition-colors duration-300`}
              >
                <SelectValue placeholder="Chọn mô hình" />
              </SelectTrigger>
              <SelectContent
                className={`${
                  theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                } transition-colors duration-300`}
              >
                <SelectItem
                  value="llama"
                  className={`${
                    theme === "dark"
                      ? "text-gray-200 focus:bg-gray-700 focus:text-white"
                      : "text-gray-800 focus:bg-red-50 focus:text-red-800"
                  } transition-colors duration-300`}
                >
                  Meta Llama
                </SelectItem>
                <SelectItem
                  value="gemini"
                  className={`${
                    theme === "dark"
                      ? "text-gray-200 focus:bg-gray-700 focus:text-white"
                      : "text-gray-800 focus:bg-red-50 focus:text-red-800"
                  } transition-colors duration-300`}
                >
                  Gemini
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div
            className={`flex-1 overflow-auto p-4 space-y-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"} transition-colors duration-300`}
          >
            {/* Hiển thị các cặp tin nhắn theo thứ tự thời gian */}
            {modelMessagePairs.map((pair, index) => (
              <div key={`model-pair-${index}`} className="space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div
                    className={cn(
                      "max-w-[95%] rounded-lg p-4 group relative transition-all duration-300",
                      theme === "dark" ? "bg-red-600 text-white shadow-md" : "bg-red-500 text-white shadow-md",
                    )}
                  >
                    <div className="prose dark:prose-invert prose-sm">
                      {pair.user.content.split("\n").map((line, i) => (
                        <p key={i} className={i > 0 ? "mt-2" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assistant message (if available) */}
                {pair.assistant && (
                  <div className="flex justify-start">
                    <div
                      className={cn(
                        "max-w-[95%] rounded-lg p-4 group relative transition-all duration-300",
                        theme === "dark"
                          ? "bg-gray-700 border border-gray-600 text-gray-100 shadow-md"
                          : "bg-red-50 border border-red-100 text-gray-800 shadow-sm",
                      )}
                    >
                      <button
                        onClick={() => copyToClipboard(pair.assistant!.content, pair.assistant!.id)}
                        className={`absolute top-2 right-2 p-1 rounded-md ${
                          theme === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-red-100 hover:bg-red-200"
                        } opacity-0 group-hover:opacity-100 transition-all duration-300`}
                        aria-label="Copy to clipboard"
                      >
                        {copiedId === pair.assistant!.id ? (
                          <CheckIcon className={`h-4 w-4 ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />
                        ) : (
                          <CopyIcon className={`h-4 w-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
                        )}
                      </button>

                      {pair.assistant.source === "model" && (
                        <div
                          className={`text-xs font-medium uppercase mb-2 ${
                            theme === "dark" ? "text-yellow-400" : "text-red-700"
                          } transition-colors duration-300 flex items-center gap-1`}
                        >
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              theme === "dark" ? "bg-yellow-400" : "bg-red-700"
                            } mr-1`}
                          ></span>
                          {pair.assistant.model === "llama" ? "META LLAMA" : "GEMINI"}
                        </div>
                      )}

                      <div className={`prose ${theme === "dark" ? "dark:prose-invert" : "text-gray-800"} prose-sm`}>
                        {pair.assistant.content.split("\n").map((line, i) => (
                          <p key={i} className={i > 0 ? "mt-2" : ""}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Typing effect for new model message */}
                {newModelMessage && index === modelMessagePairs.length - 1 && !pair.assistant && (
                  <div className="flex justify-start">
                    <div
                      className={`max-w-[95%] rounded-lg p-4 ${
                        theme === "dark" ? "bg-gray-700 border border-gray-600" : "bg-red-50 border border-red-100"
                      } transition-colors duration-300`}
                    >
                      <div
                        className={`text-xs font-medium uppercase mb-2 ${
                          theme === "dark" ? "text-yellow-400" : "text-red-700"
                        } transition-colors duration-300 flex items-center gap-1`}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            theme === "dark" ? "bg-yellow-400" : "bg-red-700"
                          } mr-1`}
                        ></span>
                        {newModelMessage.model === "llama" ? "META LLAMA" : "GEMINI"}
                      </div>
                      <div className={`prose ${theme === "dark" ? "dark:prose-invert" : "text-gray-800"} prose-sm`}>
                        <TypingEffect text={newModelMessage.content} typingSpeed={20} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Input Form */}
      <div
        className={`sticky bottom-0 ${
          theme === "dark"
            ? "bg-gray-800 border-t border-gray-700 shadow-md"
            : "bg-white border-t border-gray-200 shadow-md"
        } transition-colors duration-300`}
      >
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn về Luật Kinh Tế..."
              className={`flex-1 rounded-lg ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-700 text-gray-100 focus-visible:ring-yellow-500 placeholder-gray-400"
                  : "border-gray-300 bg-gray-50 text-gray-800 focus-visible:ring-red-500 placeholder-gray-500"
              } px-4 py-6 transition-colors duration-300`}
              disabled={isLoading}
            />
            <Button
              type="submit"
              className={`rounded-lg ${
                theme === "dark" ? "bg-red-600 hover:bg-red-700" : "bg-red-700 hover:bg-red-800"
              } text-white px-6 transition-colors duration-300 shadow-md hover:shadow-lg`}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="h-5 w-5 mr-2 animate-spin" />
                  Suy Nghĩ
                </>
              ) : (
                <>
                  <SendIcon className="h-5 w-5 mr-2" />
                  Gửi
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
