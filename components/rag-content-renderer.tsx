// components/RagContentRenderer.tsx
"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import type { JSX } from "react";

interface RagContentRendererProps {
  content: string;
}

export function RagContentRenderer({ content }: RagContentRendererProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // 1) ONE-TIME CLEANUP
  const clean = content
    // a) remove any leading bullets (* or -), even if no space: "*Bước…" or "- Theo…"
    .replace(/^\s*[*-]+\s*/gm, "")
    // b) strip bold markers **
    .replace(/\*\*/g, "")
    // c) strip separator lines like ==== or ----
    .replace(/^[=*\-]{2,}\s*$/gm, "")
    // d) strip markdown hashes (##, ###) before Step
    .replace(/^\s*#+\s*/gm, "")
    .trim();

  
  // 1.5) GOM newline bên trong dấu "..." thành space
  const normalized = clean.replace(/"([\s\S]*?)"/g, (_match, inner) => {
    const oneline = inner.replace(/\r?\n/g, " ");
    return `"${oneline}"`;
  });

  // 2) SPLIT INTO LINES
  const lines = normalized
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className={cn("prose max-w-none", isDark ? "prose-invert" : "")}>
      {lines.map((line, idx) => {
        // A) RAG header: 🎯 PHẦN I: … (bỏ "(RAG pipeline)")
        if (line.startsWith("🎯")) {
          // Lấy phần text, rồi loại bỏ "(RAG pipeline)" và dấu ":" thừa
          let txt = line.slice(2).trim()
            .replace(/\s*\(RAG pipeline\)/i, "")   // gỡ cụm "(RAG pipeline)"
            .replace(/:$/, "");                    // gỡ dấu ":" cuối nếu có

          return (
            <div
              key={idx}
              className={cn(
                "flex items-start font-bold text-xl mb-4 p-2 rounded-lg",
                isDark 
                  ? "text-yellow-300 bg-yellow-900/30" 
                  : "text-red-700 bg-red-100"
              )}
            >
              <span className="mr-2 mt-1">🎯</span>
              <span className="break-words">{txt}</span>
            </div>
          );
        }

        // A1) Navigation header: 🧭 PHẦN
        if (line.startsWith("🧭")) {
          let txt = line.slice(2).trim()
            .replace(/\s*\(RAG pipeline\)/i, "")
            .replace(/:$/, "");

          return (
            <div
              key={idx}
              className={cn(
                "flex items-start font-bold text-xl mb-4 p-2 rounded-lg",
                isDark 
                  ? "text-blue-400 bg-blue-900/30" 
                  : "text-blue-700 bg-blue-100"
              )}
            >
              <span className="mr-2 mt-1">🧭</span>
              <span className="break-words">{txt}</span>
            </div>
          );
        }

        // A2) Any icon followed by PHẦN
        const iconPhanMatch = line.match(/^([^\w\s])\s*PHẦN/i);
        if (iconPhanMatch) {
          const icon = iconPhanMatch[1];
          let txt = line.slice(icon.length).trim()
            .replace(/\s*\(RAG pipeline\)/i, "")
            .replace(/:$/, "");

          return (
            <div
              key={idx}
              className={cn(
                "flex items-start font-bold text-xl mb-4 p-2 rounded-lg",
                isDark 
                  ? "text-purple-400 bg-purple-900/30" 
                  : "text-purple-700 bg-purple-100"
              )}
            >
              <span className="mr-2 mt-1">{icon}</span>
              <span className="break-words">{txt}</span>
            </div>
          );
        }

        // B) Major headers: Bước X – Y  (or Step X – Y)
        const major = line.match(/^(?:Bước|Step)\s+(\d+)\s*[–-]\s*(.+)$/i);
        if (major) {
          return (
            <div
              key={idx}
              className={cn(
                "border-l-4 pl-3 mb-4 font-semibold",
                isDark
                  ? "border-yellow-300 text-yellow-300"
                  : "border-red-600 text-red-600"
              )}
            >
              Bước {major[1]} – {major[2]}
            </div>
          );
        }

        // C) Special headings
        const special = line.match(
          /^(Trích dẫn|Giải thích & Ví dụ|Góc nhìn đối lập|Tổng hợp kết luận):?$/i
        );
        if (special) {
          return (
            <div
              key={idx}
              className={cn(
                "border-l-4 pl-3 py-1 mb-4 font-semibold",
                isDark
                  ? "border-yellow-300 text-yellow-300"
                  : "border-red-600 text-red-600"
              )}
            >
              {special[1]}
            </div>
          );
        }

        // D) Sub-headers numbered: "2.1 Tiêu đề: Nội dung…"
        const sub = line.match(/^(\d+(?:\.\d+)*)(?:[.)]?)\s+(.+?)(?::\s*(.+))?$/);
        if (sub) {
          const [, num, title, rest] = sub;
          return (
            <p key={idx} className="ml-6 mb-2">
              <span
                className={cn(
                  "font-semibold mr-1",
                  isDark ? "text-yellow-300" : "text-red-600"
                )}
              >
                {num}.
              </span>
              <span
                className={cn(
                  "font-semibold mr-1",
                  isDark ? "text-yellow-300" : "text-red-600"
                )}
              >
                {title}
                {rest ? ":" : ""}
              </span>
              {rest && (
                <span className={cn(isDark ? "text-gray-200" : "text-gray-800")}>
                  {rest}
                </span>
              )}
            </p>
          );
        }

        // E) Bullets a), b), c), d), đ) -> e)
        const bullet = line.match(/^([a-zđ])\s*\)\s*(.+)$/i);
        if (bullet) {
          // Convert 'đ' to 'e' in the bullet marker
          const marker = bullet[1].toLowerCase() === 'đ' ? 'e' : bullet[1].toLowerCase();
          return (
            <p key={idx} className="ml-6 mb-2 flex items-start">
              <span
                className={cn(
                  "mr-2 mt-1",
                  isDark ? "text-yellow-300" : "text-red-600"
                )}
              >
                •
              </span>
              <span className={cn(isDark ? "text-gray-200" : "text-gray-800")}>
                {marker}) {bullet[2]}
              </span>
            </p>
          );
        }

        // E1) Numbered list items (1., 2., etc.)
        const numberedBullet = line.match(/^(\d+)\.\s*(.+)$/);
        if (numberedBullet) {
          return (
            <p key={idx} className="ml-6 mb-2 flex items-start">
              <span
                className={cn(
                  "mr-2 mt-1",
                  isDark ? "text-yellow-300" : "text-red-600"
                )}
              >
                •
              </span>
              <span className={cn(isDark ? "text-gray-200" : "text-gray-800")}>
                {numberedBullet[1]}. {numberedBullet[2]}
              </span>
            </p>
          );
        }

        // F) Sub-bullets under "Tổng hợp kết luận"
        const conclusion = line.match(
          /^(Kết luận cuối cùng|Đề xuất\/Khuyến nghị|Lưu ý quan trọng):\s*(.+)$/
        );
        if (conclusion) {
          const [, head, body] = conclusion;
          return (
            <p key={idx} className="ml-8 mb-2">
              <span
                className={cn(
                  "font-semibold mr-1",
                  isDark ? "text-yellow-300" : "text-red-600"
                )}
              >
                {head}:
              </span>
              <span className={cn(isDark ? "text-gray-200" : "text-gray-800")}>
                {" "}{body}
              </span>
            </p>
          );
        }

        // G) Default: plain paragraph with clickable URLs
        return (
          <p
            key={idx}
            className={cn("mb-2", isDark ? "text-gray-200" : "text-gray-800")}
          >
            {line
              .replace(/\n/g, ' ') // Replace newlines with spaces
              .replace(/\s+/g, ' ') // Replace multiple spaces with single space
              .replace(/"\s*"/g, '"') // Remove spaces between quotes
              .trim()
              .split(/(https?:\/\/[^\s]+)/g)
              .map((part, i) => {
                if (part.match(/^https?:\/\//)) {
                  return (
                    <a
                      key={i}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "!text-blue-500 hover:underline",
                        isDark ? "hover:text-blue-400" : "hover:text-blue-700"
                      )}
                    >
                      {part}
                    </a>
                  );
                }
                // Handle greeting and introduction
                if (part.includes("Chào bạn,") || part.includes("Tôi là trợ lý")) {
                  return (
                    <span key={i} className="inline whitespace-normal">
                      {part}
                    </span>
                  );
                }
                // Handle text after "Sau đây mình sẽ trả lời câu hỏi:"
                if (part.includes("Sau đây mình sẽ trả lời câu hỏi:")) {
                  const [prefix, ...rest] = part.split("Sau đây mình sẽ trả lời câu hỏi:");
                  return (
                    <span key={i} className="inline whitespace-normal">
                      {prefix}
                      <span className="inline">Sau đây mình sẽ trả lời câu hỏi:</span>
                      <span className="inline ml-1">{rest.join("Sau đây mình sẽ trả lời câu hỏi:")}</span>
                    </span>
                  );
                }
                // Handle quoted text (input data)
                if (part.includes('"')) {
                  return (
                    <span key={i} className="inline whitespace-normal">
                      {part.split(/([""])/g).map((subPart, j) => {
                        if (subPart === '"') {
                          return <span key={j} className="text-gray-400">"</span>;
                        }
                        return <span key={j}>{subPart}</span>;
                      })}
                    </span>
                  );
                }
                return <span key={i} className="inline whitespace-normal">{part}</span>;
              })}
          </p>
        );
      })}
    </div>
  );
}
