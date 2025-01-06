import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/db'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { routineId, message } = await req.json()

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        routineId,
      },
    })

    // Get routine and conversation history
    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10, // Get last 10 messages for context
        },
      },
    })

    if (!routine) {
      throw new Error('Routine not found')
    }

    // Prepare conversation history for OpenAI
    const conversationHistory: ChatCompletionMessageParam[] = routine.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }))

    // Add system message with context about the routine
    const systemMessage: ChatCompletionMessageParam = {
      role: 'system',
      content: `You are a helpful AI assistant managing this routine: ${routine.output}
Your job is to:
1. Help the user stick to their routine
2. Answer questions about the routine
3. Provide motivation and accountability
4. Suggest improvements based on user feedback
5. Help schedule and set reminders for different parts of the routine

Keep responses concise and focused on helping the user maintain and improve their routine.`
    }

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        systemMessage,
        ...conversationHistory,
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I am unable to respond at the moment.'

    // Save AI response
    const assistantMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'assistant',
        routineId,
      },
    })

    // Check for time-related keywords to potentially set reminders
    const timeKeywords = aiResponse.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)|(?:every|at|around)\s+\w+\s+(?:morning|afternoon|evening|night|day))\b/gi)
    
    if (timeKeywords) {
      // TODO: Implement reminder creation based on detected times
      console.log('Detected time references:', timeKeywords)
    }

    return NextResponse.json({
      userMessage,
      assistantMessage,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
