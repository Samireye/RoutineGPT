import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const routineId = searchParams.get('routineId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // First get the routine
    let routine = null
    if (routineId) {
      routine = await prisma.routine.findUnique({
        where: { id: routineId },
        include: {
          tasks: {
            include: {
              progress: true
            }
          }
        }
      })
    }

    // If no routine found, return empty array
    if (!routine) {
      return NextResponse.json([])
    }

    // Generate tasks for the date range
    const start = startDate ? new Date(startDate) : new Date()
    const end = endDate ? new Date(endDate) : addDays(start, 30)
    const tasks = []

    // For each day in the range
    for (let date = start; date <= end; date = addDays(date, 1)) {
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)

      // Get existing tasks for this day
      const existingTasks = routine.tasks.filter(task => {
        const taskDate = new Date(task.startTime)
        return taskDate >= dayStart && taskDate <= dayEnd
      })

      // If no tasks exist for this day, create them from the routine
      if (existingTasks.length === 0) {
        const routineSchedule = JSON.parse(routine.schedule || '[]')
        
        for (const item of routineSchedule) {
          const [hours, minutes] = item.time.split(':').map(Number)
          const taskDate = new Date(date)
          taskDate.setHours(hours, minutes, 0, 0)

          const task = await prisma.task.create({
            data: {
              routineId: routine.id,
              title: item.activity,
              description: item.description || null,
              startTime: taskDate,
              endTime: null, // You can calculate this based on duration if needed
              status: 'pending',
              isRecurring: true,
              frequency: 'daily'
            }
          })
          tasks.push(task)
        }
      } else {
        tasks.push(...existingTasks)
      }
    }

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
        status: 'pending',
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
