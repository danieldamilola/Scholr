'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { QuizQuestion } from '@/lib/gemini'

interface QuizGeneratorProps {
  textContent: string | null
}

export function QuizGenerator({ textContent }: QuizGeneratorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!textContent) {
      setError('AI features are not available for this file type.')
      return
    }

    setIsLoading(true)
    setError(null)
    setQuestions([])
    setUserAnswers({})
    setShowResults(false)

    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent, questionCount: 5 }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz')
      }

      setQuestions(data.questions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }))
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  return (
    <div className="space-y-6">
      {!questions.length && !isLoading && (
        <div className="text-center py-12">
          <p className="text-zinc-500 mb-4">Generate a quiz to test your understanding of this file.</p>
          <Button onClick={handleGenerate} disabled={!textContent}>
            Generate Quiz
          </Button>
          {!textContent && (
            <p className="text-xs text-zinc-500 mt-2">
              AI features not available for this file type.
            </p>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-zinc-500 mb-4" />
          <p className="text-zinc-500">Generating quiz...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 p-4 bg-red-50 rounded-md">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="border border-zinc-200 rounded-md p-4">
              <p className="font-medium text-zinc-900 mb-3">
                {qIndex + 1}. {question.question}
              </p>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <button
                    key={oIndex}
                    onClick={() => handleAnswer(qIndex, oIndex)}
                    disabled={showResults}
                    className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors ${
                      showResults
                        ? oIndex === question.correctAnswer
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : userAnswers[qIndex] === oIndex
                          ? 'bg-red-50 border border-red-200 text-red-800'
                          : 'bg-zinc-50 text-zinc-600'
                        : userAnswers[qIndex] === oIndex
                        ? 'bg-blue-50 border border-blue-200 text-blue-800'
                        : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {showResults && oIndex === question.correctAnswer && (
                        <CheckCircle2 className="size-4 text-green-600" />
                      )}
                      {showResults && userAnswers[qIndex] === oIndex && oIndex !== question.correctAnswer && (
                        <XCircle className="size-4 text-red-600" />
                      )}
                      {option}
                    </div>
                  </button>
                ))}
              </div>
              {showResults && (
                <div className="mt-3 p-3 bg-zinc-50 rounded-md">
                  <p className="text-sm text-zinc-700">
                    <span className="font-medium">Explanation:</span> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}

          {!showResults ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length < questions.length}
              className="w-full"
            >
              Submit Answers
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="text-center p-4 bg-zinc-50 rounded-md">
                <p className="text-2xl font-bold text-zinc-900">
                  {calculateScore()} / {questions.length}
                </p>
                <p className="text-sm text-zinc-500">Correct Answers</p>
              </div>
              <Button onClick={handleGenerate} variant="outline" className="w-full">
                Generate New Quiz
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
