import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Routine } from '@prisma/client'

type ErrorResponse = {
  error: string
}

type ApiResponse<T> = NextResponse<T | ErrorResponse>

export async function GET(): Promise<ApiResponse<Routine[]>> {
  try {
    const routines = await prisma.routine.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
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

export async function POST(request: Request): Promise<ApiResponse<Routine>> {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.input || !body.output) {
      return NextResponse.json(
        { error: 'Input and output are required' },
        { status: 400 }
      )
    }

    const routine = await prisma.routine.create({
      data: {
        input: body.input,
        output: body.output,
        tags: body.tags || null
      }
    })

    return NextResponse.json(routine)
  } catch (error) {
    console.error('Error creating routine:', error)
    return NextResponse.json(
      { error: 'Failed to create routine' },
      { status: 500 }
    )
  }
}