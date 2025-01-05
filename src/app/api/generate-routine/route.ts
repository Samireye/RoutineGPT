import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { atomicHabitsKnowledge } from '@/lib/atomic-habits'
import { fiveAmClubKnowledge } from '@/lib/fiveam-club'
import { limitlessKnowledge } from '@/lib/limitless'
import { prisma } from '@/lib/db'

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

export async function POST(request: Request) {
  console.log('API route called')
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key not configured')
    return new NextResponse(
      JSON.stringify({ error: 'OpenAI API key is not configured' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    console.log('Parsing request body')
    const body = await request.json()
    const prompt = body?.prompt

    if (!prompt || typeof prompt !== 'string') {
      console.error('Invalid or missing prompt')
      return new NextResponse(
        JSON.stringify({ error: 'Please provide a description of your routine goals' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Calling OpenAI API')
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
      console.error('No response from OpenAI')
      return new NextResponse(
        JSON.stringify({ error: 'No response generated' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    try {
      console.log('Saving to database')
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

    console.log('Sending successful response')
    return new NextResponse(
      JSON.stringify({ routine: response }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('API Error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate routine'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
