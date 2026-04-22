'use client'

import { useState } from 'react'
import { AlertCircle, BrainCircuit, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizQuestion } from '@/lib/groq'

export type QuizState = 'idle' | 'generating' | 'active'

export function QuizPanel({
  textContent,
  fileId,
}: {
  textContent: string | null
  fileId: string
}) {
  const [quizState, setQuizState] = useState<QuizState>('idle')
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState('Medium')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateQuiz = async () => {
    if (!textContent) {
      setError('AI features are not available for this file type.')
      return
    }
    setQuizState('generating')
    setError(null)
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, questionCount, difficulty }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate quiz')
      setQuestions(data.questions)
      setUserAnswers({})
      setShowResults(false)
      setQuizState('active')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz')
      setQuizState('idle')
    }
  }

  const reset = () => {
    setQuizState('idle')
    setQuestions([])
    setUserAnswers({})
    setShowResults(false)
  }

  const score = questions.filter(
    (q, i) => userAnswers[i] === q.correctAnswer,
  ).length

  return (
    <div className="h-full overflow-y-auto">
      {quizState === 'idle' && (
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
                    'flex-1 py-1.5 rounded-full text-[13px] font-medium border transition-colors',
                    questionCount === n
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:text-zinc-900',
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
              {['Easy', 'Medium', 'Hard'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    'flex-1 py-1.5 rounded-full text-[13px] font-medium border transition-colors',
                    difficulty === d
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:text-zinc-900',
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

      {quizState === 'generating' && (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 space-y-4">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-sm text-zinc-500">
            Analysing document and generating questions…
          </p>
        </div>
      )}

      {quizState === 'active' && (
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
                      'w-full text-left px-3 py-2 rounded-md text-sm border transition-colors flex items-center gap-2',
                      showResults
                        ? oi === q.correctAnswer
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : userAnswers[qi] === oi
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-zinc-50 border-zinc-100 text-zinc-400'
                        : userAnswers[qi] === oi
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50',
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
                    <span className="font-semibold">Explanation:</span>{' '}
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
                    {' '}
                    / {questions.length}
                  </span>
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  {score === questions.length
                    ? '🎉 Perfect score!'
                    : score >= questions.length / 2
                      ? '👏 Good job!'
                      : '📚 Keep studying!'}
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
  )
}
