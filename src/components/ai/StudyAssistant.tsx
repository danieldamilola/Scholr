'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface StudyAssistantProps {
  textContent: string | null
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function StudyAssistant({ textContent }: StudyAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<{ role: string; parts: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!textContent) {
      setError('AI features are not available for this file type.')
      return
    }

    const userMessage = input.trim()
    setInput('')
    setError(null)

    // Add user message to display
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textContent,
          question: userMessage,
          chatHistory,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      // Add assistant response to display
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
      setChatHistory(data.updatedHistory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-zinc-50 rounded-md min-h-[400px] max-h-[500px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <p className="text-sm">Ask questions about this file to get started.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-md px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-200 rounded-md px-4 py-2">
              <Loader2 className="size-4 animate-spin text-zinc-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 mb-3 p-2 bg-red-50 rounded-md">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this file..."
          disabled={isLoading || !textContent}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input.trim() || !textContent}>
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>

      {!textContent && (
        <p className="text-xs text-zinc-500 mt-2">
          AI features not available for this file type.
        </p>
      )}
    </div>
  )
}
