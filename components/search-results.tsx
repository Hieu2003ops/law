"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Globe, Search, ExternalLink, Calendar, FileText } from "lucide-react"
import { useTheme } from "next-themes"

interface SearchResult {
  title?: string
  url?: string
  snippet?: string
  source?: string
  date?: string
  content?: string
}

interface SearchResultsProps {
  tool: "tavily" | "google-serper"
  results: SearchResult[]
}

export function SearchResults({ tool, results }: SearchResultsProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const getToolIcon = () => {
    if (tool === "tavily") {
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">
          <Search className="w-3.5 h-3.5" />
        </div>
      )
    } else {
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
          <Globe className="w-3.5 h-3.5" />
        </div>
      )
    }
  }

  const getToolName = () => {
    if (tool === "tavily") {
      return "Tavily AI Search"
    } else {
      return "Google Serper"
    }
  }

  const getToolColor = () => {
    if (tool === "tavily") {
      return isDark ? "text-blue-400" : "text-blue-600"
    } else {
      return isDark ? "text-green-400" : "text-green-600"
    }
  }

  const getBgColor = () => {
    if (tool === "tavily") {
      return isDark ? "bg-blue-950/30" : "bg-blue-50"
    } else {
      return isDark ? "bg-green-950/30" : "bg-green-50"
    }
  }

  const getBorderColor = () => {
    if (tool === "tavily") {
      return isDark ? "border-blue-800/50" : "border-blue-200"
    } else {
      return isDark ? "border-green-800/50" : "border-green-200"
    }
  }

  return (
    <div className={`my-4 rounded-lg border ${getBorderColor()} overflow-hidden`}>
      <div className={`flex items-center justify-between p-3 ${getBgColor()} cursor-pointer`} onClick={toggleExpand}>
        <div className="flex items-center gap-2">
          {getToolIcon()}
          <span className={`font-medium ${getToolColor()}`}>{getToolName()}</span>
        </div>
        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className={`p-3 ${isDark ? "bg-gray-800/50" : "bg-white"}`}>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
                } transition-colors duration-200`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                          tool === "tavily"
                            ? isDark
                              ? "bg-blue-900 text-blue-200"
                              : "bg-blue-100 text-blue-700"
                            : isDark
                              ? "bg-green-900 text-green-200"
                              : "bg-green-100 text-green-700"
                        } text-xs font-medium`}
                      >
                        {index + 1}
                      </span>
                      {result.title && (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-medium ${
                            tool === "tavily"
                              ? isDark
                                ? "text-blue-400 hover:text-blue-300"
                                : "text-blue-600 hover:text-blue-700"
                              : isDark
                                ? "text-green-400 hover:text-green-300"
                                : "text-green-600 hover:text-green-700"
                          } line-clamp-2`}
                        >
                          {result.title}
                        </a>
                      )}
                    </div>

                    {result.snippet && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{result.snippet}</p>
                    )}
                    {result.content && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{result.content}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-2">
                      {result.source && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <FileText size={12} />
                          <span>{result.source}</span>
                        </div>
                      )}
                      {result.date && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Calendar size={12} />
                          <span>{result.date}</span>
                        </div>
                      )}
                      {result.url && (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1 ${
                            tool === "tavily"
                              ? isDark
                                ? "text-blue-400 hover:text-blue-300"
                                : "text-blue-600 hover:text-blue-500"
                              : isDark
                                ? "text-green-400 hover:text-green-300"
                                : "text-green-600 hover:text-green-500"
                          }`}
                        >
                          <ExternalLink size={12} />
                          <span className="truncate max-w-[200px]">
                            {result.url.replace(/^https?:\/\//, "").split("/")[0]}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
