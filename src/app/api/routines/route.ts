import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Routine, Message } from '@prisma/client'

interface RoutineWithMessages extends Routine {
  messages: Message[]
}

export async function GET(): Promise<NextResponse<RoutineWithMessages[]>> {
  try {
    const routines = await prisma.routine.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 1, // Get just the initial message
        }
      }
    })

    return NextResponse.json(routines)
  } catch (error) {
    console.error('Failed to fetch routines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch routines' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const routine = await prisma.routine.create({
      data
    })
    return NextResponse.json(routine)
  } catch (error) {
    console.error('Error creating routine:', error) // Log the error
    return NextResponse.json(
      { error: 'Failed to create routine' },
      { status: 500 }
    )
  }
}