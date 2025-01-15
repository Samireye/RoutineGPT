import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const routineId = searchParams.get('routineId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where = {
      ...(routineId && { routineId }),
      ...(startDate && endDate && {
        startTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        progress: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { routineId, title, description, startTime, endTime, isRecurring, frequency } = body

    const task = await prisma.task.create({
      data: {
        routineId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        isRecurring,
        frequency,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, notes } = body

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        progress: {
          create: {
            date: new Date(),
            status,
            notes,
          },
        },
      },
      include: {
        progress: true,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}
