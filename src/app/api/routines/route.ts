import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const routines = await prisma.routine.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log('Fetched routines:', routines); // Log the fetched routines
    console.log('Fetched routines:', routines); // Log the fetched routines
    return NextResponse.json(routines)
  } catch (error) {
    console.error('Error fetching routines:', error) // Log the error
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