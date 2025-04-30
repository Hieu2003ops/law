"use client"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import type { JSX } from "react"

interface RagContentRendererProps {
  content: string
}

export function RagContentRenderer({ content }: RagContentRendererProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Xử lý nội dung RAG
  const processRagContent = () => {
    // Tách nội dung thành các dòng để xử lý
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    // Mảng chứa các phần tử HTML đã xử lý
    const processedElements: JSX.Element[] = []

    // Biến để theo dõi phần đang xử lý
    let currentSection = ""
    let sectionContent: string[] = []

    // Xử lý từng dòng
    lines.forEach((line, index) => {
      // Xử lý tiêu đề chính
      if (line.includes("PHẦN I:") || line.includes("🎯") || line.startsWith("===")) {
        if (line.includes("PHẦN I:") || line.includes("🎯")) {
          processedElements.push(
            <div
              key={`header-${index}`}
              className={`text-xl font-bold my-4 ${isDark ? "text-yellow-400" : "text-red-700"} flex items-center`}
            >
              {line.includes("🎯") && <span className="mr-2">🎯</span>}
              PHẦN I: Phân tích từ văn bản pháp luật (RAG pipeline):
            </div>,
          )
        } else {
          processedElements.push(
            <div
              key={`divider-${index}`}
              className={`my-4 border-b ${isDark ? "border-gray-600" : "border-gray-300"}`}
            ></div>,
          )
        }
        return
      }

      // Xử lý lời chào
      if (line.startsWith("Chào") || line.includes("Tôi là trợ lý")) {
        processedElements.push(
          <p key={`intro-${index}`} className={`my-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
            {line}
          </p>,
        )
        return
      }

      // Xử lý câu hỏi
      if (line.includes("Sau đây mình sẽ trả lời câu hỏi:") || line.includes("?")) {
        processedElements.push(
          <p key={`question-${index}`} className={`my-3 font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}>
            {line}
          </p>,
        )
        return
      }

      // Xử lý các điều luật
      if (line.match(/^[a-z]\)/) || line.startsWith("*") || line.startsWith("-") || line.match(/^\d+\./)) {
        // Định dạng điều luật
        let formattedLine = line

        // Xử lý các điều luật dạng a), b)
        if (line.match(/^[a-z]\)/)) {
          formattedLine = line.replace(/^([a-z]\))/, (match) => {
            return `<span class="font-medium ${isDark ? "text-yellow-300" : "text-red-600"}">${match}</span>`
          })

          processedElements.push(
            <div
              key={`law-item-${index}`}
              className="ml-6 my-2"
              dangerouslySetInnerHTML={{ __html: formattedLine }}
            ></div>,
          )
          return
        }

        // Xử lý các mục có dấu * hoặc -
        if (line.startsWith("*") || line.startsWith("-")) {
          formattedLine = line.replace(/^[*-]\s*/, "")

          // Kiểm tra nếu là tiêu đề phần
          if (formattedLine.includes("**")) {
            const cleanTitle = formattedLine.replace(/\*\*/g, "").trim()

            processedElements.push(
              <div
                key={`section-title-${index}`}
                className={`font-bold mt-4 mb-2 ${isDark ? "text-yellow-400 border-yellow-500" : "text-red-700 border-red-600"} border-l-4 pl-3 py-1`}
              >
                {cleanTitle}
              </div>,
            )

            // Cập nhật phần hiện tại
            currentSection = cleanTitle
            sectionContent = []
            return
          }

          processedElements.push(
            <div key={`bullet-${index}`} className="ml-4 my-2 flex">
              <span className={`mr-2 ${isDark ? "text-yellow-400" : "text-red-600"}`}>•</span>
              <span>{formattedLine}</span>
            </div>,
          )
          return
        }

        // Xử lý các mục có số
        if (line.match(/^\d+\./)) {
          formattedLine = line.replace(/^(\d+\.)/, (match) => {
            return `<span class="font-medium ${isDark ? "text-yellow-300" : "text-red-600"}">${match}</span>`
          })

          processedElements.push(
            <div
              key={`numbered-${index}`}
              className="ml-4 my-2"
              dangerouslySetInnerHTML={{ __html: formattedLine }}
            ></div>,
          )
          return
        }
      }

      // Xử lý trích dẫn
      if (line.startsWith('"') || line.includes("Trích dẫn")) {
        if (line.includes("Trích dẫn")) {
          processedElements.push(
            <div
              key={`quote-title-${index}`}
              className={`font-semibold mt-4 mb-2 ${isDark ? "text-yellow-400" : "text-red-700"}`}
            >
              Trích dẫn:
            </div>,
          )
          return
        }

        processedElements.push(
          <blockquote
            key={`quote-${index}`}
            className={`my-2 pl-4 border-l-4 ${isDark ? "border-yellow-500 text-gray-300" : "border-red-500 text-gray-700"} italic`}
          >
            {line}
          </blockquote>,
        )
        return
      }

      // Xử lý các phần giải thích
      if (line.includes("Giải thích") || currentSection.includes("Giải thích")) {
        if (line.includes("Giải thích") && !currentSection.includes("Giải thích")) {
          currentSection = "Giải thích"
          processedElements.push(
            <div
              key={`explanation-title-${index}`}
              className={`font-semibold mt-4 mb-2 ${isDark ? "text-yellow-400" : "text-red-700"}`}
            >
              Giải thích:
            </div>,
          )
          return
        }

        if (currentSection === "Giải thích" && line.trim() !== "") {
          processedElements.push(
            <p key={`explanation-${index}`} className={`my-2 ml-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
              {line}
            </p>,
          )
          return
        }
      }

      // Xử lý các phần ví dụ
      if (line.includes("Ví dụ") || currentSection.includes("Ví dụ")) {
        if (line.includes("Ví dụ") && !currentSection.includes("Ví dụ")) {
          currentSection = "Ví dụ"
          processedElements.push(
            <div
              key={`example-title-${index}`}
              className={`font-semibold mt-4 mb-2 ${isDark ? "text-yellow-400" : "text-red-700"}`}
            >
              Ví dụ:
            </div>,
          )
          return
        }

        if (currentSection === "Ví dụ" && line.trim() !== "") {
          processedElements.push(
            <p key={`example-${index}`} className={`my-2 ml-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
              {line}
            </p>,
          )
          return
        }
      }

      // Xử lý kết luận
      if (line.includes("Kết luận") || line.includes("Tổng hợp")) {
        processedElements.push(
          <div
            key={`conclusion-title-${index}`}
            className={`font-semibold mt-4 mb-2 ${isDark ? "text-yellow-400" : "text-red-700"}`}
          >
            Kết luận:
          </div>,
        )
        return
      }

      // Xử lý các dòng còn lại
      if (line.trim() !== "") {
        processedElements.push(
          <p key={`text-${index}`} className={`my-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
            {line}
          </p>,
        )
      }
    })

    return processedElements
  }

  return <div className={`prose max-w-none ${isDark ? "prose-invert" : ""}`}>{processRagContent()}</div>
}
