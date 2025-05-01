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

  // 2) SPLIT INTO LINES
  const lines = clean
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className={cn("prose max-w-none", isDark ? "prose-invert" : "")}>
      {lines.map((line, idx) => {
        // A) RAG header: 🎯 PHẦN I: …
        if (line.startsWith("🎯")) {
          const txt = line.slice(2).trim();
          return (
            <div
              key={idx}
              className={cn(
                "flex items-center font-bold text-xl mb-4",
                isDark ? "text-yellow-300" : "text-red-700"
              )}
            >
              <span className="mr-2">🎯</span>
              {txt}
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

        // E) Bullets a), b)
        const bullet = line.match(/^([a-z])\)\s*(.+)$/i);
        if (bullet) {
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
                {bullet[1]}) {bullet[2]}
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

        // G) Default: plain paragraph
        return (
          <p
            key={idx}
            className={cn("mb-2", isDark ? "text-gray-200" : "text-gray-800")}
          >
            {line}
          </p>
        );
      })}
    </div>
  );
}
