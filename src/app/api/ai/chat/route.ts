import { NextRequest, NextResponse } from 'next/server'
import { chatWithFile } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { textContent, question, chatHistory = [] } = body

    if (!textContent || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: textContent and question' },
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

    const { response, updatedHistory } = await chatWithFile(textContent, question, chatHistory)

    return NextResponse.json({ response, updatedHistory })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    )
  }
}
