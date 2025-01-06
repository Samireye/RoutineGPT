import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function createJSONResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(request: Request) {
  try {
    const routines = await prisma.routine.findMany();
    return createJSONResponse(routines);
  } catch (error) {
    console.error('Error fetching routines:', error);
    return createJSONResponse({ error: 'Failed to fetch routines' }, 500);
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