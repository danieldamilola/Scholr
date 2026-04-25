"use client";

import { useState } from "react";
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/groq";

export type QuizState = "idle" | "generating" | "active";

export function QuizPanel({
  textContent,
  fileId,
}: {
  textContent: string | null;
  fileId: string;
}) {
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
        body: JSON.stringify({ fileId, questionCount, difficulty }),
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
            <h3 className="text-[15px] font-semibold text-ink mb-1">
              Generate a Quiz
            </h3>
            <p className="text-[13px] text-ink-muted">
              Test your knowledge with AI-generated MCQs based on this document.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-md p-3 border border-red-100 dark:border-red-900">
              <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[13px] font-medium text-ink-soft">
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
                      ? "bg-brand-wash text-brand border-brand/30"
                      : "bg-surface text-ink-soft border-border hover:text-ink",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[13px] font-medium text-ink-soft">Difficulty</p>
            <div className="flex gap-2">
              {["Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "flex-1 py-1.5 rounded-full text-[13px] font-medium border transition-colors",
                    difficulty === d
                      ? "bg-brand-wash text-brand border-brand/30"
                      : "bg-surface text-ink-soft border-border hover:text-ink",
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
            className="w-full h-10 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
          >
            Generate Quiz
          </button>

          {!textContent && (
            <p className="text-xs text-ink-muted text-center">
              AI features not available for this file type.
            </p>
          )}
        </div>
      )}

      {quizState === "generating" && (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 space-y-4">
          <Loader2 className="size-8 text-brand-muted animate-spin" />
          <p className="text-sm text-ink-muted">
            Analysing document and generating questions…
          </p>
        </div>
      )}

      {quizState === "active" && (
        <div className="p-5 space-y-4">
          {questions.map((q, qi) => (
            <div
              key={qi}
              className="bg-surface border border-border rounded-md p-4"
            >
              <p className="text-sm font-medium text-ink mb-3">
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
                          ? "bg-success-bg border-success text-success-text"
                          : userAnswers[qi] === oi
                            ? "bg-error-bg border-error text-error-text"
                            : "bg-subtle border-border text-ink-muted"
                        : userAnswers[qi] === oi
                          ? "bg-brand-wash border-brand/30 text-brand"
                          : "bg-surface border-border text-ink-soft hover:bg-subtle",
                    )}
                  >
                    {showResults && oi === q.correctAnswer && (
                      <CheckCircle2 className="size-4 shrink-0 text-success" />
                    )}
                    {showResults &&
                      userAnswers[qi] === oi &&
                      oi !== q.correctAnswer && (
                        <XCircle className="size-4 shrink-0 text-error" />
                      )}
                    {opt}
                  </button>
                ))}
              </div>
              {showResults && (
                <div className="mt-3 p-3 bg-subtle rounded-md border border-border">
                  <p className="text-xs text-ink-soft">
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
              className="w-full h-10 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
            >
              Submit Answers ({Object.keys(userAnswers).length}/
              {questions.length} answered)
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-center p-6 bg-surface border border-border rounded-md">
                <p className="text-4xl font-bold text-ink">
                  {score}
                  <span className="text-ink-muted text-2xl font-normal">
                    {" "}
                    / {questions.length}
                  </span>
                </p>
                <p className="text-sm text-ink-muted mt-1">
                  {score === questions.length
                    ? "🎉 Perfect score!"
                    : score >= questions.length / 2
                      ? "👏 Good job!"
                      : "📚 Keep studying!"}
                </p>
              </div>
              <button
                onClick={reset}
                className="w-full h-10 border border-border bg-surface hover:bg-subtle text-ink-soft text-sm font-medium rounded-md transition-colors"
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
