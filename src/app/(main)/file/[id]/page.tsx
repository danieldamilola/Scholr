"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClientSingleton } from "@/lib/supabase/client";
import type { FileRecord, DiscussionReply, UserProfile } from "@/types";
import {
  Download,
  Bookmark,
  Share2,
  Sparkles,
  BrainCircuit,
  Send,
  Loader2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  CornerDownRight,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/useBookmarks";
import {
  useDiscussion,
  type DiscussionThreadWithReplies,
} from "@/hooks/useDiscussion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { QuizQuestion } from "@/lib/groq";

type SidebarTab = "ai" | "quiz";
type QuizState = "idle" | "generating" | "active";
type ChatMessage = { role: "user" | "assistant"; content: string };

// ─────────────────────────────────────────────────────────────
// AI CHAT PANEL
// ─────────────────────────────────────────────────────────────
function AiChatPanel({
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

  // Persist messages + history to localStorage on every change
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
        body: JSON.stringify({ textContent, question: q, chatHistory }),
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
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 shrink-0">
          <span className="text-[11px] text-zinc-400">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="size-3" /> Clear history
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center text-center px-4 py-16">
            <Sparkles className="size-8 text-zinc-300 mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-900 mb-1">
              AI Study Assistant
            </p>
            <p className="text-xs text-zinc-400 max-w-[200px]">
              {textContent
                ? "Ask anything about this document — summaries, explanations, key concepts."
                : "AI features are only available for text-based PDF files."}
            </p>
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
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white border border-zinc-200 text-zinc-900 rounded-tl-sm",
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-200 rounded-[14px] rounded-tl-sm px-4 py-3">
              <Loader2 className="size-4 animate-spin text-zinc-400" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-md p-3 border border-red-100">
            <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 p-3 bg-white border-t border-zinc-200">
        <div className="flex items-end gap-2 bg-white border border-zinc-200 rounded-[10px] focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all">
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
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 p-3 min-h-[44px] max-h-[100px] resize-none focus:outline-none disabled:opacity-40"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || !textContent || isLoading}
            className="m-1.5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="size-4" />
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 mt-1.5 px-1">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUIZ PANEL
// ─────────────────────────────────────────────────────────────
function QuizPanel({ textContent }: { textContent: string | null }) {
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async () => {
    if (!textContent) {
      setError("AI features are not available for this file type.");
      return;
    }
    setQuizState("generating");
    setError(null);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textContent, questionCount, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz");
      setQuestions(data.questions);
      setUserAnswers({});
      setShowResults(false);
      setQuizState("active");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
      setQuizState("idle");
    }
  };

  const reset = () => {
    setQuizState("idle");
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
  };
  const score = questions.filter(
    (q, i) => userAnswers[i] === q.correctAnswer,
  ).length;

  return (
    <div className="h-full overflow-y-auto">
      {quizState === "idle" && (
        <div className="p-5 space-y-5">
          <div>
            <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">
              Generate a Quiz
            </h3>
            <p className="text-[13px] text-zinc-500">
              Test your knowledge with AI-generated MCQs based on this document.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-md p-3 border border-red-100">
              <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[13px] font-medium text-zinc-700">
              Number of questions
            </p>
            <div className="flex gap-2">
              {[3, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={cn(
                    "flex-1 py-1.5 rounded-full text-[13px] font-medium border transition-colors",
                    questionCount === n
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-white text-zinc-600 border-zinc-200 hover:text-zinc-900",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[13px] font-medium text-zinc-700">Difficulty</p>
            <div className="flex gap-2">
              {["Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "flex-1 py-1.5 rounded-full text-[13px] font-medium border transition-colors",
                    difficulty === d
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-white text-zinc-600 border-zinc-200 hover:text-zinc-900",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateQuiz}
            disabled={!textContent}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
          >
            Generate Quiz
          </button>

          {!textContent && (
            <p className="text-xs text-zinc-400 text-center">
              AI features not available for this file type.
            </p>
          )}
        </div>
      )}

      {quizState === "generating" && (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 space-y-4">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-sm text-zinc-500">
            Analysing document and generating questions…
          </p>
        </div>
      )}

      {quizState === "active" && (
        <div className="p-5 space-y-4">
          {questions.map((q, qi) => (
            <div
              key={qi}
              className="bg-white border border-zinc-200 rounded-md p-4"
            >
              <p className="text-sm font-medium text-zinc-900 mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() =>
                      !showResults &&
                      setUserAnswers((prev) => ({ ...prev, [qi]: oi }))
                    }
                    disabled={showResults}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm border transition-colors flex items-center gap-2",
                      showResults
                        ? oi === q.correctAnswer
                          ? "bg-green-50 border-green-200 text-green-800"
                          : userAnswers[qi] === oi
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-zinc-50 border-zinc-100 text-zinc-400"
                        : userAnswers[qi] === oi
                          ? "bg-blue-50 border-blue-200 text-blue-800"
                          : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50",
                    )}
                  >
                    {showResults && oi === q.correctAnswer && (
                      <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                    )}
                    {showResults &&
                      userAnswers[qi] === oi &&
                      oi !== q.correctAnswer && (
                        <XCircle className="size-4 shrink-0 text-red-600" />
                      )}
                    {opt}
                  </button>
                ))}
              </div>
              {showResults && (
                <div className="mt-3 p-3 bg-zinc-50 rounded-md border border-zinc-100">
                  <p className="text-xs text-zinc-600">
                    <span className="font-semibold">Explanation:</span>{" "}
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}

          {!showResults ? (
            <button
              onClick={() => setShowResults(true)}
              disabled={Object.keys(userAnswers).length < questions.length}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
            >
              Submit Answers ({Object.keys(userAnswers).length}/
              {questions.length} answered)
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-center p-6 bg-white border border-zinc-200 rounded-md">
                <p className="text-4xl font-bold text-zinc-900">
                  {score}
                  <span className="text-zinc-300 text-2xl font-normal">
                    {" "}
                    / {questions.length}
                  </span>
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  {score === questions.length
                    ? "🎉 Perfect score!"
                    : score >= questions.length / 2
                      ? "👏 Good job!"
                      : "📚 Keep studying!"}
                </p>
              </div>
              <button
                onClick={reset}
                className="w-full h-10 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-sm font-medium rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DISCUSSION PANEL
// ─────────────────────────────────────────────────────────────
function DiscussionPanel({ fileId }: { fileId: string }) {
  const [newThread, setNewThread] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const { threads, loading, createThread, createReply } = useDiscussion({
    fileId,
  });

  const handlePost = async () => {
    if (!newThread.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createThread(newThread);
      setNewThread("");
      setIsComposing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (threadId: string) => {
    if (!replyContent.trim() || isReplying) return;
    setIsReplying(true);
    try {
      await createReply(threadId, replyContent);
      setReplyContent("");
      setReplyingTo(null);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] font-semibold text-zinc-900">Discussion</h2>
        {!isComposing && (
          <button
            onClick={() => setIsComposing(true)}
            className="h-9 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[13px] font-medium rounded-md transition-colors"
          >
            Start a thread
          </button>
        )}
      </div>

      {/* Compose Box */}
      {isComposing && (
        <div className="mb-8 bg-white border border-zinc-200 rounded-[10px] p-4">
          <textarea
            value={newThread}
            onChange={(e) => setNewThread(e.target.value)}
            placeholder="Share a question or insight about this document…"
            rows={3}
            autoFocus
            className="w-full text-sm text-zinc-900 placeholder:text-zinc-400 bg-zinc-50 border border-zinc-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                setIsComposing(false);
                setNewThread("");
              }}
              className="h-8 px-3 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={!newThread.trim() || isSubmitting}
              className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              Post
            </button>
          </div>
        </div>
      )}

      {/* Thread List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-5 text-zinc-400 animate-spin" />
        </div>
      ) : threads.length === 0 ? (
        <div className="py-12 text-center bg-white border border-zinc-200 rounded-[10px]">
          <MessageSquare
            className="size-7 text-zinc-300 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-sm font-medium text-zinc-900 mb-1">
            No discussions yet
          </p>
          <p className="text-xs text-zinc-400">
            Be the first to start a conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {threads.map((thread: DiscussionThreadWithReplies) => (
            <div key={thread.id} className="flex gap-3">
              {/* Author avatar */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold mt-0.5">
                {thread.user?.full_name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              <div className="flex-1 min-w-0">
                {/* Thread meta */}
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-[13px] font-semibold text-zinc-900">
                    {thread.user?.full_name || "Anonymous"}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {new Date(thread.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Thread body */}
                <p className="text-[14px] text-zinc-700 mb-3 leading-relaxed">
                  {thread.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() =>
                      setReplyingTo(replyingTo === thread.id ? null : thread.id)
                    }
                    className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 hover:text-blue-600 transition-colors"
                  >
                    <CornerDownRight className="size-3.5" />
                    Reply
                  </button>
                </div>

                {/* Inline reply compose */}
                {replyingTo === thread.id && (
                  <div className="mb-4 bg-zinc-50 border border-zinc-200 rounded-md p-3">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply…"
                      rows={2}
                      autoFocus
                      className="w-full text-sm text-zinc-900 placeholder:text-zinc-400 bg-white border border-zinc-200 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent("");
                        }}
                        className="h-7 px-3 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReply(thread.id)}
                        disabled={!replyContent.trim() || isReplying}
                        className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md disabled:opacity-50 transition-colors flex items-center gap-1.5"
                      >
                        {isReplying && (
                          <Loader2 className="size-3 animate-spin" />
                        )}
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {thread.replies && thread.replies.length > 0 && (
                  <div className="space-y-4 pl-4 border-l-2 border-zinc-100">
                    {thread.replies.map(
                      (reply: DiscussionReply & { user: UserProfile }) => (
                        <div key={reply.id} className="flex gap-2.5">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-semibold mt-0.5">
                            {reply.user?.full_name?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[13px] font-semibold text-zinc-900">
                                {reply.user?.full_name || "Anonymous"}
                              </span>
                              {reply.user?.role === "lecturer" && (
                                <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-sm font-medium">
                                  Lecturer
                                </span>
                              )}
                              <span className="text-[11px] text-zinc-400">
                                {new Date(reply.created_at).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </span>
                            </div>
                            <p className="text-[14px] text-zinc-700 leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
function SidebarTabBar({
  tab,
  setTab,
}: {
  tab: SidebarTab;
  setTab: (t: SidebarTab) => void;
}) {
  return (
    <div className="flex border-b border-zinc-200 shrink-0">
      {[
        { id: "ai" as const, label: "AI Assistant", icon: Sparkles },
        { id: "quiz" as const, label: "Quiz", icon: BrainCircuit },
      ].map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTab(id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 h-12 text-[14px] font-medium transition-colors border-b-2",
            tab === id
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-500 hover:text-zinc-900",
          )}
        >
          <Icon className="size-4" /> {label}
        </button>
      ))}
    </div>
  );
}

export default function FileDetailPage() {
  const params = useParams();
  const fileId = params.id as string;
  const [file, setFile] = useState<FileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("ai");
  const { bookmarkedFileIds, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarkedFileIds.has(fileId);

  useEffect(() => {
    async function fetchFile() {
      try {
        const supabase = createClientSingleton();
        const { data, error } = await supabase
          .from("files")
          .select("*")
          .eq("id", fileId)
          .single();
        if (error) throw error;
        setFile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load file");
      } finally {
        setLoading(false);
      }
    }
    fetchFile();
  }, [fileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-5 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white border border-zinc-200 rounded-md p-12 text-center">
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-900">File not found</p>
            <p className="text-xs text-zinc-500">
              {error ||
                "This file may have been deleted or the link is incorrect."}
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to Browse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[1400px] mx-auto min-h-[calc(100vh-56px)]">
      {/* ═══ LEFT COLUMN ═══ */}
      <main className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10 lg:max-w-[65%] xl:max-w-[68%]">
        {/* Breadcrumb */}
        <div className="text-xs text-zinc-400 mb-5 flex flex-wrap items-center gap-1">
          <Link
            href="/browse"
            className="hover:text-zinc-700 transition-colors"
          >
            Browse
          </Link>
          {file.college && (
            <>
              <span>›</span>
              <span>{file.college}</span>
            </>
          )}
          {file.department && (
            <>
              <span>›</span>
              <span>{file.department}</span>
            </>
          )}
          {file.programmes?.[0] && (
            <>
              <span>›</span>
              <span>{file.programmes[0]}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-[26px] sm:text-[30px] font-semibold text-zinc-900 leading-snug mb-4">
          {file.title}
        </h1>

        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-2 text-[13px] mb-7">
          {file.course_code && (
            <span className="bg-zinc-100 text-zinc-600 font-mono px-2 py-0.5 rounded-sm">
              {file.course_code}
            </span>
          )}
          {file.level && (
            <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-sm">
              Level {file.level}
            </span>
          )}
          {file.semester && (
            <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-sm">
              {file.semester} Semester
            </span>
          )}
          {file.file_type && (
            <span className="bg-zinc-100 text-zinc-500 font-mono uppercase text-xs px-2 py-0.5 rounded-sm">
              {file.file_type}
            </span>
          )}
          <span className="text-zinc-400">
            Uploaded{" "}
            {new Date(file.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {file.uploader_name && (
            <span className="text-zinc-400">
              by{" "}
              <span className="text-zinc-600 font-medium">
                {file.uploader_name}
              </span>
            </span>
          )}
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2.5 mb-8">
          <a
            href={`/api/download/${file.id}`}
            className="inline-flex items-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Download className="size-4" /> Download
          </a>
          <button
            type="button"
            onClick={() => toggleBookmark(fileId)}
            className={cn(
              "inline-flex items-center gap-2 h-10 px-4 border rounded-md text-sm font-medium transition-colors",
              isBookmarked
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50",
            )}
          >
            <Bookmark
              className={cn(
                "size-4",
                isBookmarked && "fill-blue-600 text-blue-600",
              )}
            />
            {isBookmarked ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share({
                  title: file.title,
                  url: window.location.href,
                });
              } else {
                await navigator.clipboard.writeText(window.location.href);
                // Brief visual feedback — swap button text
                const btn = document.activeElement as HTMLButtonElement | null;
                if (btn) {
                  const orig = btn.textContent;
                  btn.textContent = "Copied!";
                  setTimeout(() => {
                    btn.textContent = orig;
                  }, 1500);
                }
              }
            }}
            className="inline-flex items-center gap-2 h-10 px-4 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium rounded-md hover:bg-zinc-50 transition-colors"
          >
            <Share2 className="size-4" /> Share
          </button>
        </div>

        {/* File Preview */}
        <div className="bg-white border border-zinc-200 rounded-[10px] overflow-hidden mb-12">
          {file.file_type === "PDF" ? (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(file.file_url)}&embedded=true`}
              className="w-full h-[680px] border-0"
              title={file.title}
            />
          ) : file.file_type === "PNG" ||
            file.file_type === "JPG" ||
            file.file_type === "JPEG" ? (
            <div className="flex items-center justify-center p-6 bg-zinc-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.file_url}
                alt={file.title}
                className="max-w-full max-h-[680px] object-contain rounded-md"
              />
            </div>
          ) : file.text_content ? (
            // DOCX / PPTX / TXT — show extracted text
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 border-b border-zinc-200">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Text Preview — {file.file_type}
                </span>
                <a
                  href={`/api/download/${file.id}`}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Download className="size-3" /> Download original
                </a>
              </div>
              <pre className="p-6 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap font-sans overflow-y-auto max-h-[620px]">
                {file.text_content}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <FileText
                className="size-12 text-zinc-300 mb-4"
                strokeWidth={1.5}
              />
              <p className="text-sm font-medium text-zinc-900 mb-1">
                Preview not available
              </p>
              <p className="text-xs text-zinc-400 mb-5">
                Download to view this {file.file_type} file.
              </p>
              <a
                href={`/api/download/${file.id}`}
                className="inline-flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <Download className="size-4" /> Download File
              </a>
            </div>
          )}
        </div>

        {/* Discussion */}
        <DiscussionPanel fileId={fileId} />
      </main>

      {/* ═══ RIGHT SIDEBAR (Desktop) ═══ */}
      <aside className="hidden lg:flex flex-col w-[35%] xl:w-[32%] shrink-0 border-l border-zinc-200 bg-zinc-50/30 sticky top-14 h-[calc(100vh-56px)] overflow-hidden">
        <SidebarTabBar tab={sidebarTab} setTab={setSidebarTab} />
        <div className="flex-1 overflow-hidden flex flex-col">
          {sidebarTab === "ai" ? (
            <AiChatPanel
              textContent={file.text_content ?? null}
              fileId={fileId}
            />
          ) : (
            <QuizPanel textContent={file.text_content ?? null} />
          )}
        </div>
      </aside>

      {/* ═══ MOBILE FAB + BOTTOM SHEET ═══ */}
      <Sheet>
        <SheetTrigger
          className="lg:hidden fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="size-6" />
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-[85vh] p-0 flex flex-col bg-white rounded-t-xl border-t border-zinc-200"
        >
          <SidebarTabBar tab={sidebarTab} setTab={setSidebarTab} />
          <div className="flex-1 overflow-hidden flex flex-col">
            {sidebarTab === "ai" ? (
              <AiChatPanel
                textContent={file.text_content ?? null}
                fileId={fileId}
              />
            ) : (
              <QuizPanel textContent={file.text_content ?? null} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
