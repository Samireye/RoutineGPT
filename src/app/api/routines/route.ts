import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const routines = await prisma.routine.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(routines)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch routines' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { input, output, tags } = await request.json()
    const routine = await prisma.routine.create({
      data: {
        input,
        output,
        tags
      }
    })
    return NextResponse.json(routine)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save routine' },
      { status: 500 }
    )
  }
}
