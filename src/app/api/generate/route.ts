import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant that helps people optimize their daily routines. 
          When given a description of someone's current routine and their goals, you provide:
          1. A detailed, time-blocked schedule
          2. Specific suggestions for improvement
          3. Tips for maintaining consistency
          Format the response in clear markdown sections.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    })

    return NextResponse.json({ 
      routine: completion.choices[0].message.content 
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate routine' },
      { status: 500 }
    )
  }
}
