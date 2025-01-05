import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { atomicHabitsKnowledge } from '@/lib/atomic-habits'
import { fiveAmClubKnowledge } from '@/lib/fiveam-club'
import { limitlessKnowledge } from '@/lib/limitless'
import { prisma } from '@/lib/db'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Escape special characters and ensure valid JSON
const cleanString = (str: string) => str.replace(/[`'"]/g, '').trim()

const systemPrompt = "You are an expert routine optimization assistant with deep knowledge from three transformative books:\n" +
  "1. Atomic Habits by James Clear\n" +
  "2. The 5 AM Club by Robin Sharma\n" +
  "3. Limitless by Jim Kwik\n\n" +
  "When generating routines, incorporate these key principles:\n" +
  cleanString(atomicHabitsKnowledge) + "\n" +
  cleanString(fiveAmClubKnowledge) + "\n" +
  cleanString(limitlessKnowledge)

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    )
  }

  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a description of your routine goals' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      )
    }

    try {
      await prisma.routine.create({
        data: {
          input: prompt,
          output: response,
          tags: 'atomic-habits,5am-club,limitless'
        }
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
    }

    return NextResponse.json({ routine: response })
  } catch (error) {
    console.error('Error:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to generate routine' },
      { status: 500 }
    )
  }
}
