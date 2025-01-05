import OpenAI from 'openai'
import { atomicHabitsKnowledge } from '@/lib/atomic-habits'
import { fiveAmClubKnowledge } from '@/lib/fiveam-club'
import { limitlessKnowledge } from '@/lib/limitless'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const cleanString = (str: string) => str.replace(/[`'"]/g, '').trim()

const systemPrompt = "You are an expert routine optimization assistant with deep knowledge from three transformative books:\n" +
  "1. Atomic Habits by James Clear\n" +
  "2. The 5 AM Club by Robin Sharma\n" +
  "3. Limitless by Jim Kwik\n\n" +
  "When generating routines, incorporate these key principles:\n" +
  cleanString(atomicHabitsKnowledge) + "\n" +
  cleanString(fiveAmClubKnowledge) + "\n" +
  cleanString(limitlessKnowledge)

function createJSONResponse(data: Record<string, unknown>, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST(request: Request) {
  console.log('API route called')
  console.log('Environment:', process.env.NODE_ENV)
  console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY)
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key not configured')
    return createJSONResponse({ error: 'OpenAI API key is not configured' }, 500)
  }

  try {
    console.log('Parsing request body')
    const body = await request.json()
    console.log('Request body:', body)
    const prompt = body?.prompt

    if (!prompt || typeof prompt !== 'string') {
      console.error('Invalid or missing prompt')
      return createJSONResponse({ error: 'Please provide a description of your routine goals' }, 400)
    }

    console.log('Calling OpenAI API')
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      })
      console.log('OpenAI response:', completion)
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError)
      return createJSONResponse({ error: 'Failed to generate routine from OpenAI' }, 500)
    }

    const response = completion.choices[0]?.message?.content

    if (!response) {
      console.error('No response from OpenAI')
      return createJSONResponse({ error: 'No response generated' }, 500)
    }

    console.log('Sending successful response')
    return createJSONResponse({ routine: response })
  } catch (error) {
    console.error('API Error:', error)
    return createJSONResponse({ 
      error: error instanceof Error ? error.message : 'Failed to generate routine'
    }, 500)
  }
}
