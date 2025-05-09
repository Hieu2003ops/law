// components/search-tools-formatter.tsx
"use client"

import { useTheme } from "next-themes"
import { ClockIcon, FileText, Calendar, ExternalLink } from "lucide-react"

interface SearchToolsFormatterProps {
  content: string
}

interface SearchResult {
  title?: string
  url?: string
  snippet?: string
  source?: string
  date?: string
}

/**
 * Parser Google Serper: trích mảng SearchResult[]
 */
function parseGoogleSerperResults(text: string): SearchResult[] | null {
  const headerMatch = text.match(/Kết quả Tìm kiếm Tin tức:\s*([\s\S]*)/i)
  if (!headerMatch) return null

  const body = headerMatch[1].trim()
  const results: SearchResult[] = []
  const itemRegex =
    /(\d+)\.\s*(.*?)\nNguồn:\s*([^|]+)\|\s*Ngày:\s*([^\n]+)\nMô tả:\s*([\s\S]*?)(?=\n\d+\.|\n*$)/g

  let m: RegExpExecArray | null
  while ((m = itemRegex.exec(body)) !== null) {
    const [, , rawTitle, rawSource, rawDate, rawDesc] = m
    const linkMatch = rawDesc.match(/Link:\s*(https?:\/\/[^\s]+)/i)
    const url = linkMatch?.[1] ?? ""
    const snippet = rawDesc.replace(/Link:\s*https?:\/\/[^\s]+/i, "").trim()

    results.push({
      title:   rawTitle.trim(),
      url,
      snippet,
      source:  rawSource.trim(),
      date:    rawDate.trim(),
    })
  }

  return results.length > 0 ? results : null
}

// Helper function to make URLs clickable
function makeUrlsClickable(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export function SearchToolsFormatter({ content }: SearchToolsFormatterProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const results = parseGoogleSerperResults(content) || []

  // Check if content starts with "🧭 PHẦN"
  const isPartSection = content.trim().startsWith("🧭 PHẦN");

  return (
    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-lg">
      {/* ==== HEADER PHẦN II ==== */}
      <header
        className={
          "flex items-center font-bold text-xl whitespace-nowrap mb-4 " +
          "text-red-700 dark:text-red-500"
        }
      >
        <ClockIcon className="mr-2" />
        PHẦN II: Các nguồn thông tin bổ sung từ công cụ tìm kiếm:
      </header>

      {/* ==== NẾU CÓ KẾT QUẢ ==== */}
      {results.length > 0 ? (
        <ol className="list-decimal list-outside pl-6 space-y-6">
          {results.map((r, i) => (
            <li
              key={i}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm"
            >
              {/* Tiêu đề */}
              <p
                className={
                  "text-lg font-semibold " +
                  (isDark ? "text-red-500" : "text-red-600")
                }
              >
                {r.title}
              </p>

              {/* Metadata thụt dòng */}
              <div className="mt-2 ml-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {r.source  && <p><strong className="text-red-600 dark:text-red-500">Nguồn:</strong> {r.source}</p>}
                {r.date    && <p><strong className="text-red-600 dark:text-red-500">Ngày:</strong> {r.date}</p>}
                {r.snippet && <p>{makeUrlsClickable(r.snippet)}</p>}
                {r.url     && (
                  <p>
                    <strong className="text-red-600 dark:text-red-500">Link:</strong>{" "}
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {new URL(r.url).hostname}
                    </a>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        /* ==== FALLBACK ==== */
        <ol className="list-decimal list-outside pl-6">
          <li className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
            <p
              className={
                "text-lg font-semibold " +
                (isDark ? "text-red-500" : "text-red-600")
              }
            >
              {content.split("\n")[0] || ""}
            </p>
            <div className="mt-2 ml-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {content
                .split("\n")
                .slice(1)
                .map((l, idx) => (
                  <p key={idx}>
                    {l.startsWith("🧭 PHẦN") ? (
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">{l}</span>
                    ) : (
                      makeUrlsClickable(l)
                    )}
                  </p>
                ))}
            </div>
          </li>
        </ol>
      )}
    </div>
  )
}


// "use client"

// import { useTheme } from "next-themes"

// interface SearchToolsFormatterProps {
//   content: string
// }

// interface SearchResult {
//   title?: string
//   url?: string
//   snippet?: string
//   source?: string
//   date?: string
// }

// /**
//  * Parser Google Serper: trích mảng SearchResult[]
//  */
// function parseGoogleSerperResults(text: string): SearchResult[] | null {
//   const headerMatch =
//     text.match(/Kết quả Tìm kiếm Tin tức:\s*([\s\S]*)/i) || text.match(/Kết quả Tìm kiếm:\s*([\s\S]*)/i)
//   if (!headerMatch) return null

//   const body = headerMatch[1].trim()
//   const results: SearchResult[] = []

//   // Cải thiện regex để bắt được nhiều định dạng hơn
//   const itemRegex =
//     /(\d+)[.|)]?\s*(.*?)(?:\n|\s+)Nguồn:\s*([^|]+)(?:\|\s*Ngày:\s*([^\n]+))?(?:\n|\s+)Mô tả:\s*([\s\S]*?)(?=\n\d+[.|)]?\.|\s*\n\d+[.|)]?\.|\n*$)/g

//   let m: RegExpExecArray | null

//   while ((m = itemRegex.exec(body + "\n999. ")) !== null) {
//     const [, , rawTitle, rawSource, rawDate, rawDesc] = m
//     const linkMatch = rawDesc?.match(/Link:\s*(https?:\/\/[^\s]+)/i)
//     const url = linkMatch?.[1] ?? ""
//     const snippet = rawDesc?.replace(/Link:\s*https?:\/\/[^\s]+/i, "").trim() || ""

//     if (rawTitle) {
//       results.push({
//         title: rawTitle.trim(),
//         url,
//         snippet,
//         source: rawSource?.trim() || "",
//         date: rawDate?.trim() || "",
//       })
//     }
//   }

//   // Nếu không tìm thấy kết quả với regex phức tạp, thử với regex đơn giản hơn
//   if (results.length === 0) {
//     const simpleItemRegex = /(\d+)[.|)]?\s*(.*?)(?=\n\d+[.|)]?\.|\n*$)/g
//     while ((m = simpleItemRegex.exec(body + "\n999. ")) !== null) {
//       const [, , rawContent] = m
//       if (rawContent) {
//         const lines = rawContent.split("\n")
//         const title = lines[0]?.trim() || ""
//         let source = ""
//         let date = ""
//         let snippet = ""
//         let url = ""

//         for (const line of lines.slice(1)) {
//           if (line.includes("Nguồn:")) source = line.replace("Nguồn:", "").trim()
//           else if (line.includes("Ngày:")) date = line.replace("Ngày:", "").trim()
//           else if (line.includes("Mô tả:")) snippet = line.replace("Mô tả:", "").trim()
//           else if (line.includes("Link:")) {
//             const linkMatch = line.match(/Link:\s*(https?:\/\/[^\s]+)/i)
//             url = linkMatch?.[1] || ""
//           } else {
//             snippet += " " + line.trim()
//           }
//         }

//         results.push({ title, url, snippet, source, date })
//       }
//     }
//   }

//   return results.length > 0 ? results : null
// }

// /**
//  * Component chính: render theo đúng định dạng yêu cầu
//  * KHÔNG sử dụng SearchResults component
//  */
// export function SearchToolsFormatter({ content }: SearchToolsFormatterProps) {
//   const { theme } = useTheme()
//   const isDark = theme === "dark"
//   const results = parseGoogleSerperResults(content) || []

//   // Render trực tiếp kết quả, không sử dụng SearchResults component
//   return (
//     <div className={`${isDark ? "bg-red-900/20" : "bg-red-50"} p-6 rounded-lg`}>
//       {/* ==== Header PHẦN II ==== */}
//       <header className={`flex items-center font-bold text-xl mb-4 ${isDark ? "text-yellow-400" : "text-red-800"}`}>
//         <span className="mr-2">🕒</span>
//         PHẦN II: Các nguồn thông tin bổ sung từ công cụ tìm kiếm:
//       </header>

//       <div className="mt-4 mb-2">
//         <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-800"}`}>Kết quả Tìm kiếm Tin tức:</p>
//       </div>

//       {results.length > 0 ? (
//         /* Nếu parse được kết quả: hiển thị list */
//         <div className="space-y-6">
//           {results.map((r, i) => (
//             <div key={i} className="ml-0">
//               {/* 1) Số thứ tự và tiêu đề */}
//               <p className="mb-2">
//                 <span className={`font-bold ${isDark ? "text-yellow-400" : "text-red-600"}`}>{i + 1}. </span>
//                 <span className={`font-bold ${isDark ? "text-yellow-400" : "text-red-600"}`}>{r.title}</span>
//               </p>

//               {/* 2) Nguồn và ngày */}
//               {(r.source || r.date) && (
//                 <p className={`mb-2 ${isDark ? "text-gray-300" : "text-gray-800"}`}>
//                   <span className="font-medium">Nguồn: </span>
//                   {r.source}
//                   {r.date && (
//                     <>
//                       <span className="mx-2">|</span>
//                       <span className="font-medium">Ngày: </span>
//                       {r.date}
//                     </>
//                   )}
//                 </p>
//               )}

//               {/* 3) Mô tả */}
//               {r.snippet && (
//                 <p className={`mb-2 ${isDark ? "text-gray-300" : "text-gray-800"}`}>
//                   <span className="font-medium">Mô tả: </span>
//                   {r.snippet}
//                 </p>
//               )}

//               {/* 4) Link */}
//               {r.url && (
//                 <p className={`mb-2 ${isDark ? "text-gray-300" : "text-gray-800"}`}>
//                   <span className="font-medium">Link: </span>
//                   <a
//                     href={r.url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className={`${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} hover:underline`}
//                   >
//                     {r.url}
//                   </a>
//                 </p>
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         /* Fallback: hiển thị nguyên content với định dạng tương tự */
//         <div className={`${isDark ? "text-gray-300" : "text-gray-800"}`}>
//           {content.split("\n").map((line, idx) => {
//             // Định dạng số thứ tự và tiêu đề
//             if (/^\d+\./.test(line)) {
//               const parts = line.split(/^(\d+\.\s*)/)
//               if (parts.length >= 3) {
//                 return (
//                   <p key={idx} className="mb-2">
//                     <span className={`font-bold ${isDark ? "text-yellow-400" : "text-red-600"}`}>{parts[1]}</span>
//                     <span className={`font-bold ${isDark ? "text-yellow-400" : "text-red-600"}`}>{parts[2]}</span>
//                   </p>
//                 )
//               }
//             }

//             // Định dạng các dòng khác
//             if (line.startsWith("Nguồn:") || line.startsWith("Mô tả:") || line.startsWith("Link:")) {
//               const [prefix, ...rest] = line.split(":")
//               return (
//                 <p key={idx} className="mb-2">
//                   <span className="font-medium">{prefix}: </span>
//                   {rest.join(":")}
//                 </p>
//               )
//             }

//             return (
//               <p key={idx} className="mb-2">
//                 {line}
//               </p>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }


