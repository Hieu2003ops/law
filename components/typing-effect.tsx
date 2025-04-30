"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface TypingEffectProps {
  text: string
  typingSpeed?: number
  className?: string
}

export function TypingEffect({ text, typingSpeed = 30, className }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("")
    setCurrentIndex(0)
    setIsComplete(false)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, typingSpeed)

      return () => clearTimeout(timeout)
    } else if (!isComplete) {
      setIsComplete(true)
    }
  }, [currentIndex, text, typingSpeed, isComplete])

  // Split text into paragraphs and render each
  return (
    <div className={cn(`font-mono ${isDark ? "text-gray-100" : "text-gray-800"}`, className)}>
      {displayedText.split("\n").map((line, i) => (
        <p key={i} className={i > 0 ? "mt-2" : ""}>
          {line}
        </p>
      ))}
      {!isComplete && <span className={`animate-pulse ${isDark ? "text-yellow-400" : "text-red-700"}`}>▌</span>}
    </div>
  )
}
