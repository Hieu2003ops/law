"use client"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { SearchToolsFormatter } from "./search-tools-formatter"
import { RagContentRenderer } from "./rag-content-renderer"

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * Component chính để render Markdown / RAG / Search Results.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const hasSearchResults =
    content.includes("--- Tavily ---") ||
    content.includes("--- Google Serper ---")
  const isRagContent = /PHẦN I:|Theo luật|Điều|Chương|Trích dẫn|Giải thích/.test(
    content
  )

  if (hasSearchResults) {
    return (
      <div className={cn("p-6 max-w-3xl mx-auto", className)}>
        <SearchToolsFormatter content={content} />
      </div>
    )
  }

  if (isRagContent) {
    return (
      <div className={cn("p-6 max-w-3xl mx-auto", className)}>
        <RagContentRenderer content={content} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 max-w-3xl mx-auto",
        className
      )}
    >
      <article
        className={cn(
          "prose prose-lg max-w-none",
          isDark ? "prose-invert" : "prose-neutral"
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}