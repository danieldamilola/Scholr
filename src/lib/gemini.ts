import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function chatWithFile(
  textContent: string,
  question: string,
  chatHistory: { role: string; parts: string }[] = []
): Promise<{ response: string; updatedHistory: { role: string; parts: string }[] }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  // Limit context to avoid timeout
  const maxContextLength = 20000
  const truncatedContent = textContent.slice(0, maxContextLength)

  const systemPrompt = `You are a helpful academic assistant for the Scholr platform. Your role is to help students understand course materials.

Rules:
- Answer questions based ONLY on the provided file content
- If the answer is not in the content, say so honestly
- Be concise and direct
- If the content is unclear, ask for clarification
- Do not make up information
- Format your responses in a clear, readable way

File content:
${truncatedContent}`

  // Build chat history with system prompt - convert to proper format
  const history = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    ...chatHistory.slice(-6).map((msg) => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.parts }],
    })),
  ]

  const chat = model.startChat({ history })
  const result = await chat.sendMessage(question)
  const response = await result.response.text()

  // Update history
  const updatedHistory = [
    ...chatHistory,
    { role: 'user', parts: question },
    { role: 'model', parts: response },
  ]

  return { response, updatedHistory }
}

export async function generateQuiz(
  textContent: string,
  questionCount: number = 5
): Promise<{ questions: QuizQuestion[] }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  // Limit context to avoid timeout
  const maxContextLength = 20000
  const truncatedContent = textContent.slice(0, maxContextLength)

  const prompt = `Based on the following course material, generate ${questionCount} multiple-choice questions to test understanding.

Rules:
- Generate exactly ${questionCount} questions
- Each question must have 4 options (A, B, C, D)
- Only one option should be correct
- Mark the correct option clearly
- Questions should test understanding of key concepts
- Return ONLY valid JSON

File content:
${truncatedContent}

Return format (strict JSON):
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A. Option A", "B. Option B", "C. Option C", "D. Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`

  const result = await model.generateContent(prompt)
  const response = await result.response.text()

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse quiz response')
  }

  const quizData = JSON.parse(jsonMatch[0])
  return quizData
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}
