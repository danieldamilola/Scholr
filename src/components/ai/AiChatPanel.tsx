"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function AiChatPanel({
  textContent,
  fileId,
}: {
  textContent: string | null;
  fileId: string;
}) {
  const storageKey = `scholr:chat:${fileId}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored).messages : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored).history : [];
    } catch {
      return [];
    }
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ messages, history: chatHistory }),
      );
    } catch {
      /* storage full or unavailable */
    }
  }, [messages, chatHistory, storageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setChatHistory([]);
    setError(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || isLoading) return;
    if (!textContent) {
      setError("AI features are not available for this file type.");
      return;
    }

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, question: q, chatHistory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
      setChatHistory(data.updatedHistory);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with clear button */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
          <span className="text-[11px] text-ink-muted">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-red-500 transition-colors"
          >
            <Trash2 className="size-3" /> Clear history
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center text-center px-4 py-16">
            <Sparkles
              className="size-8 text-ink-muted opacity-40 mb-3"
              strokeWidth={1.5}
            />
            <p className="text-sm font-medium text-ink mb-1">
              AI Study Assistant
            </p>
            <p className="text-xs text-ink-muted max-w-[200px]">
              {textContent
                ? "Ask anything about this document — summaries, explanations, key concepts."
                : "AI features are only available for text-based PDF files."}
            </p>
            {textContent && (
              <p className="text-[11px] text-ink-muted opacity-60 max-w-[220px] mt-3 leading-relaxed">
                AI answers are based on the document content and may not always
                be accurate. Verify important information.
              </p>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] p-3 text-sm leading-relaxed rounded-[14px] whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-brand text-white rounded-br-sm"
                  : "bg-surface border border-border text-ink rounded-tl-sm",
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-[14px] rounded-tl-sm px-4 py-3">
              <Loader2 className="size-4 animate-spin text-ink-muted" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-md p-3 border border-red-100 dark:border-red-900">
            <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 p-3 bg-surface border-t border-border">
        <div className="flex items-end gap-2 bg-surface border border-border rounded-[10px] focus-within:ring-2 focus-within:ring-brand focus-within:border-transparent transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question about this document…"
            rows={1}
            disabled={!textContent || isLoading}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted p-3 min-h-[44px] max-h-[100px] resize-none focus:outline-none disabled:opacity-40"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || !textContent || isLoading}
            className="m-1.5 p-2 bg-brand hover:bg-brand-hover text-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="size-4" />
          </button>
        </div>
        <p className="text-[11px] text-ink-muted mt-1.5 px-1">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
