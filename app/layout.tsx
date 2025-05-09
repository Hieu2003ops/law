import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Be_Vietnam_Pro } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

// Sử dụng font Be Vietnam Pro cho toàn bộ ứng dụng
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Luật Kinh Tế Việt Nam - Trợ lý AI",
  description: "Trợ lý AI chuyên về Luật Kinh Tế Việt Nam",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${beVietnamPro.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
