// // components/search-results.tsx
// "use client"

// import { useState } from "react"
// import { ChevronDown, ChevronUp, Search, Globe, ExternalLink, Calendar, FileText } from "lucide-react"
// import { useTheme } from "next-themes"

// interface SearchResult {
//   title?: string
//   url?: string
//   snippet?: string
//   source?: string
//   date?: string
//   content?: string
// }

// interface SearchResultsProps {
//   tool: "tavily" | "google-serper"
//   results: SearchResult[]
// }

// export function SearchResults({ tool, results }: SearchResultsProps) {
//   const { theme } = useTheme()
//   const isDark = theme === "dark"
//   const [open, setOpen] = useState(true)

//   // Màu sắc theo tool và theme
//   const palette = tool === "tavily"
//     ? { bgLight: "bg-blue-50", bgDark: "bg-blue-900/10", text: "text-blue-600 dark:text-blue-300" }
//     : { bgLight: "bg-green-50", bgDark: "bg-green-900/10", text: "text-green-600 dark:text-green-300" }
//   const Icon = tool === "tavily" ? <Search size={16} /> : <Globe size={16} />

//   return (
//     <article className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
//       {/* Header */}
//       <header
//         className={`flex items-center justify-between px-5 py-3 cursor-pointer ${isDark ? palette.bgDark : palette.bgLight}`}
//         onClick={() => setOpen(!open)}
//       >
//         <div className="flex items-center gap-2">
//           <div className={`w-6 h-6 flex items-center justify-center rounded-full ${palette.text}`}>
//             {Icon}
//           </div>
//           <h2 className={`text-lg font-semibold ${palette.text}`}>
//             {tool === "tavily" ? "Tavily AI Search" : "Google Serper"}
//           </h2>
//         </div>
//         {open
//           ? <ChevronUp size={20} className="text-gray-500 hover:text-gray-700 dark:text-gray-400" />
//           : <ChevronDown size={20} className="text-gray-500 hover:text-gray-700 dark:text-gray-400" />
//         }
//       </header>

//       {/* Nội dung khi mở */}
//       {open && (
//         <div className="p-5 bg-white dark:bg-gray-800 rounded-b-lg space-y-6">
//           {results.map((r, i) => {
//             const domain = r.url?.replace(/^https?:\/\//, "").split("/")[0] || ""
//             const desc = r.snippet || r.content || ""
//             return (
//               <div key={i} className="space-y-2">
//                 {/* Tiêu đề */}
//                 {r.title && (
//                   <h3 className="text-base font-medium">
//                     <a
//                       href={r.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="hover:underline"
//                     >
//                       {i + 1}. {r.title}
//                     </a>
//                   </h3>
//                 )}

//                 {/* Mô tả */}
//                 {desc && (
//                   <p className="text-sm text-gray-700 dark:text-gray-300">
//                     {desc}
//                   </p>
//                 )}

//                 {/* Thông tin phụ */}
//                 <dl className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
//                   {r.source && (
//                     <div className="flex items-center gap-1">
//                       <FileText size={12} /> <span>{r.source}</span>
//                     </div>
//                   )}
//                   {r.date && (
//                     <div className="flex items-center gap-1">
//                       <Calendar size={12} /> <span>{r.date}</span>
//                     </div>
//                   )}
//                   {domain && (
//                     <div className="flex items-center gap-1">
//                       <ExternalLink size={12} />
//                       <a
//                         href={r.url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="hover:underline truncate max-w-[150px] block"
//                       >
//                         {domain}
//                       </a>
//                     </div>
//                   )}
//                 </dl>
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </article>
//   )
// }


"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Search, Globe, ExternalLink, Calendar, FileText } from "lucide-react"
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
  customStyle?: boolean // Thêm prop để kiểm soát việc sử dụng style tùy chỉnh
}

export function SearchResults({ tool, results, customStyle = false }: SearchResultsProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [open, setOpen] = useState(true)

  // Màu sắc theo tool và theme
  const palette =
    tool === "tavily"
      ? { bgLight: "bg-blue-50", bgDark: "bg-blue-900/10", text: "text-blue-600 dark:text-blue-300" }
      : customStyle
        ? { bgLight: "bg-red-50", bgDark: "bg-red-900/20", text: "text-red-600 dark:text-yellow-400" }
        : { bgLight: "bg-green-50", bgDark: "bg-green-900/10", text: "text-green-600 dark:text-green-300" }

  const Icon = tool === "tavily" ? <Search size={16} /> : <Globe size={16} />

  // Nếu sử dụng style tùy chỉnh, trả về null để không render component này
  if (customStyle) {
    return null
  }

  return (
    <article className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <header
        className={`flex items-center justify-between px-5 py-3 cursor-pointer ${isDark ? palette.bgDark : palette.bgLight}`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 flex items-center justify-center rounded-full ${palette.text}`}>{Icon}</div>
          <h2 className={`text-lg font-semibold ${palette.text}`}>
            {tool === "tavily" ? "Tavily AI Search" : "Google Serper"}
          </h2>
        </div>
        {open ? (
          <ChevronUp size={20} className="text-gray-500 hover:text-gray-700 dark:text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-500 hover:text-gray-700 dark:text-gray-400" />
        )}
      </header>

      {/* Nội dung khi mở */}
      {open && (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-b-lg space-y-6">
          {results.map((r, i) => {
            const domain = r.url?.replace(/^https?:\/\//, "").split("/")[0] || ""
            const desc = r.snippet || r.content || ""
            return (
              <div key={i} className="space-y-2">
                {/* Tiêu đề */}
                {r.title && (
                  <h3 className="text-base font-medium">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {i + 1}. {r.title}
                    </a>
                  </h3>
                )}

                {/* Mô tả */}
                {desc && <p className="text-sm text-gray-700 dark:text-gray-300">{desc}</p>}

                {/* Thông tin phụ */}
                <dl className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {r.source && (
                    <div className="flex items-center gap-1">
                      <FileText size={12} /> <span>{r.source}</span>
                    </div>
                  )}
                  {r.date && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} /> <span>{r.date}</span>
                    </div>
                  )}
                  {domain && (
                    <div className="flex items-center gap-1">
                      <ExternalLink size={12} />
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline truncate max-w-[150px] block"
                      >
                        {domain}
                      </a>
                    </div>
                  )}
                </dl>
              </div>
            )
          })}
        </div>
      )}
    </article>
  )
}
