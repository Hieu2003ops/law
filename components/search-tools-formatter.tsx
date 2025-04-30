"use client"

import { SearchResults } from "./search-results"

interface SearchToolsFormatterProps {
  content: string
}

export function SearchToolsFormatter({ content }: SearchToolsFormatterProps) {
  // Phân tích nội dung để tìm kết quả từ Tavily và Google Serper
  const parseTavilyResults = (content: string) => {
    const tavilyRegex = /--- Tavily ---[\s\S]*?Kết quả từ Tavily:([\s\S]*?)(?=---|$)/i
    const tavilyMatch = content.match(tavilyRegex)

    if (!tavilyMatch) return null

    const tavilyContent = tavilyMatch[1].trim()
    const results = []

    // Phân tích từng kết quả Tavily
    const resultRegex = /###\s*(\d+)\.([^#]*?)(?=###\s*\d+\.|$)/g
    let match

    while ((match = resultRegex.exec(tavilyContent + "###")) !== null) {
      if (match[2]) {
        const resultText = match[2].trim()

        // Tìm URL nếu có
        const urlMatch = resultText.match(/(https?:\/\/[^\s]+)/)
        const url = urlMatch ? urlMatch[1].replace(/\.$/, "") : ""

        // Tìm tiêu đề và nội dung
        let title = ""
        let content = resultText

        if (url) {
          // Lấy phần trước URL làm tiêu đề nếu có
          const parts = resultText.split(url)
          if (parts[0]) {
            title = parts[0].trim()
            content = parts[1] ? parts[1].trim() : ""
          }
        }

        // Tìm thông tin nguồn
        const sourceMatch = resultText.match(/Loại nguồn:\s*([^\n]+)/i)
        const source = sourceMatch ? sourceMatch[1].trim() : ""

        results.push({
          title: title || url,
          url,
          content,
          source,
        })
      }
    }

    return results.length > 0 ? results : null
  }

  const parseGoogleSerperResults = (content: string) => {
    // Thử nhiều mẫu regex khác nhau để phù hợp với định dạng của backend
    const serperRegexes = [
      /--- Google Serper (?:$$Tin tức$$|$$Tin tức$$) ---[\s\S]*?Kết quả Tìm kiếm Tin tức:([\s\S]*?)(?=---|$)/i,
      /--- Google Serper ---[\s\S]*?Kết quả Tìm kiếm:([\s\S]*?)(?=---|$)/i,
      /Google Serper $$Tin tức$$[\s\S]*?Kết quả Tìm kiếm Tin tức:([\s\S]*?)(?=---|$)/i,
    ]

    let serperMatch = null
    for (const regex of serperRegexes) {
      serperMatch = content.match(regex)
      if (serperMatch) break
    }

    if (!serperMatch) return null

    const serperContent = serperMatch[1].trim()
    const results = []

    // Phân tích từng kết quả Google Serper
    const resultRegex = /(\d+)\.\s*(.*?)(?=\d+\.\s*|$)/gs
    let match

    while ((match = resultRegex.exec(serperContent + "999. ")) !== null) {
      if (match[2]) {
        const resultText = match[2].trim()

        // Tìm URL
        const urlMatch = resultText.match(/Link:\s*(https?:\/\/[^\s]+)/i)
        const url = urlMatch ? urlMatch[1].trim() : ""

        // Tìm nguồn
        const sourceMatch = resultText.match(/Nguồn:\s*([^|]+)/i)
        const source = sourceMatch ? sourceMatch[1].trim() : ""

        // Tìm ngày
        const dateMatch = resultText.match(/Ngày:\s*([^-]+)/i)
        const date = dateMatch ? dateMatch[1].trim() : ""

        // Tìm mô tả
        const descMatch = resultText.match(/Mô tả:\s*(.*?)(?=\s*-\s*Link:|$)/is)
        const description = descMatch ? descMatch[1].trim() : ""

        // Lấy tiêu đề (phần đầu tiên của kết quả)
        let title = resultText.split(" - Nguồn:")[0].trim()
        if (title.length > 100) {
          title = title.substring(0, 100) + "..."
        }

        results.push({
          title,
          url,
          snippet: description,
          source,
          date,
        })
      }
    }

    return results.length > 0 ? results : null
  }

  // Thêm hàm debug để kiểm tra nội dung
  const debugContent = () => {
    console.log("Content to parse:", content)
    console.log("Has Tavily:", content.includes("--- Tavily ---"))
    console.log("Has Google Serper:", content.includes("--- Google Serper"))
  }

  // Gọi hàm debug để kiểm tra
  debugContent()

  const tavilyResults = parseTavilyResults(content)
  const serperResults = parseGoogleSerperResults(content)

  if (!tavilyResults && !serperResults) {
    // Nếu không tìm thấy kết quả tìm kiếm, trả về nội dung gốc
    return (
      <div className="prose max-w-none dark:prose-invert">
        <p>{content}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {content.includes("PHẦN II: Các nguồn thông tin bổ sung từ công cụ tìm kiếm") && (
        <div className="font-medium text-lg mt-4 mb-2">PHẦN II: Các nguồn thông tin bổ sung từ công cụ tìm kiếm:</div>
      )}

      {tavilyResults && <SearchResults tool="tavily" results={tavilyResults} />}
      {serperResults && <SearchResults tool="google-serper" results={serperResults} />}
    </div>
  )
}
