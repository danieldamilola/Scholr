import Groq from 'groq-sdk'

// Lazy getter — only instantiated at runtime, not during build-time module evaluation.
// This prevents "GROQ_API_KEY missing" errors when the deployment platform builds the app.
let _groq: Groq | null = null
function getGroq(): Groq {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _groq
}

const MODEL = 'llama-3.3-70b-versatile'
const MAX_CONTEXT = 12000 // Groq has token limits; keep context manageable

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

/**
 * Chat with the AI about a file's text content.
 */
export async function chatWithFile(
  textContent: string,
  question: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<{ response: string; updatedHistory: { role: 'user' | 'assistant'; content: string }[] }> {
  const truncated = textContent.slice(0, MAX_CONTEXT)

  const systemPrompt = `You are a helpful academic assistant for the Scholr study platform. You help students understand their course materials.

Rules:
- Answer questions based ONLY on the document content provided below.
- If the answer is not in the document, say so honestly — do not make up information.
- Be clear, concise, and student-friendly.
- You may format your answer with bullet points or numbered lists when appropriate.

Document content:
"""
${truncated}
"""`

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    // Include last 6 messages of history for context
    ...chatHistory.slice(-6),
    { role: 'user', content: question },
  ]

  const completion = await getGroq().chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.4,
    max_tokens: 1024,
  })

  const response = completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.'

  const updatedHistory: { role: 'user' | 'assistant'; content: string }[] = [
    ...chatHistory,
    { role: 'user', content: question },
    { role: 'assistant', content: response },
  ]

  return { response, updatedHistory }
}

/**
 * Generate a multiple-choice quiz from a file's text content.
 */
export async function generateQuiz(
  textContent: string,
  questionCount: number = 5
): Promise<{ questions: QuizQuestion[] }> {
  const truncated = textContent.slice(0, MAX_CONTEXT)

  const prompt = `You are an expert educator. Based on the course material below, generate exactly ${questionCount} multiple-choice quiz questions.

Requirements:
- Each question must test understanding of a key concept from the material.
- Each question must have exactly 4 answer options.
- Only ONE option is correct.
- The correctAnswer field is the 0-based index of the correct option.
- Provide a brief explanation for why the correct answer is right.
- Return ONLY valid JSON — no markdown, no extra text.

Course material:
"""
${truncated}
"""

Return this exact JSON structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why Option A is correct."
    }
  ]
}`

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content ?? ''

  let quizData: { questions: QuizQuestion[] }
  try {
    quizData = JSON.parse(raw)
  } catch {
    // Fallback: try to extract JSON block
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Failed to parse quiz response from AI.')
    quizData = JSON.parse(match[0])
  }

  if (!quizData.questions || !Array.isArray(quizData.questions)) {
    throw new Error('AI returned an invalid quiz format.')
  }

  return quizData
}
