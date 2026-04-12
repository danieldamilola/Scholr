import { NextRequest, NextResponse } from 'next/server'
import { generateQuiz } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { textContent, questionCount = 5 } = body

    if (!textContent) {
      return NextResponse.json(
        { error: 'Missing required field: textContent' },
        { status: 400 }
      )
    }

    if (textContent.trim() === '') {
      return NextResponse.json(
        { error: 'This file does not have extractable text content. AI features are not available for this file type.' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact the admin.' },
        { status: 503 }
      )
    }

    const quiz = await generateQuiz(textContent, questionCount)

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Quiz API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    )
  }
}
