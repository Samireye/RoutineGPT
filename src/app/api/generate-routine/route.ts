import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { atomicHabitsKnowledge } from '@/lib/atomic-habits'
import { fiveAmClubKnowledge } from '@/lib/5am-club'
import { limitlessKnowledge } from '@/lib/limitless'
import { prisma } from '@/lib/db'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const systemPrompt = `You are an expert routine optimization assistant with deep knowledge from three transformative books:
1. "Atomic Habits" by James Clear
2. "The 5 AM Club" by Robin Sharma
3. "Limitless" by Jim Kwik

When generating routines, incorporate these key principles:

From Atomic Habits:
- Four Laws of Behavior Change
- Habit stacking
- Two-Minute Rule
- Identity-based habits
- Implementation intentions

From The 5 AM Club:
- The 20/20/20 Formula (Move/Reflect/Grow)
- The 4 Interior Empires (Mindset/Heartset/Healthset/Soulset)
- Victory Hour concept
- Energy management and recovery
- Strategic planning and execution

From Limitless:
- The FASTER Method for learning
- Energy and state management
- Brain optimization practices
- Focus and productivity techniques
- Morning power routines

Format your response in markdown with these sections:
1. Optimized Schedule
   - Include specific timeframes
   - Incorporate the 20/20/20 formula if applicable
   - Balance productivity with recovery

2. Habit Implementation Strategies
   - Use habit stacking
   - Apply the Two-Minute Rule
   - Include identity-based habits
   - Incorporate brain optimization techniques

3. Success Metrics
   - Define clear progress indicators
   - Include both quantitative and qualitative measures
   - Set realistic milestones

4. Potential Obstacles and Solutions
   - Address common challenges
   - Provide specific contingency plans
   - Include motivation maintenance strategies

Additional context from the books:

Atomic Habits:
${atomicHabitsKnowledge}

The 5 AM Club:
${fiveAmClubKnowledge}

Limitless:
${limitlessKnowledge}`

export async function POST(request: Request) {
  try {
    try {
      const body = await request.json()
      const prompt = body?.prompt

      if (!prompt || typeof prompt !== 'string') {
        return NextResponse.json(
          { error: 'Please provide a description of your routine goals' },
          { status: 400 }
        )
      }

      if (prompt.length > 1000) {
        return NextResponse.json(
          { error: 'Description is too long. Please keep it under 1000 characters.' },
          { status: 400 }
        )
      }

      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OpenAI API key is not configured' },
          { status: 500 }
        )
      }
      
      // Create a chat completion
      let completion
      try {
        completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
        })
      } catch (openaiError) {
        console.error('OpenAI API Error:', openaiError)
        return NextResponse.json(
          { error: 'Failed to generate routine. Please try again later.' },
          { status: 500 }
        )
      }

      const response = completion.choices[0]?.message?.content

      if (!response) {
        return NextResponse.json(
          { error: 'No response generated. Please try again.' },
          { status: 500 }
        )
      }

      try {
        // Save the routine to the database
        await prisma.routine.create({
          data: {
            input: prompt,
            output: response,
            tags: 'atomic-habits,5am-club,limitless'
          }
        })
      } catch (dbError) {
        // Log but don't fail the request
        console.error('Database error:', dbError)
      }

      return NextResponse.json({ routine: response })

    } catch (error) {
      console.error('Unexpected error:', error)
      return NextResponse.json(
        { error: 'An unexpected error occurred. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
