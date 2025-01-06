import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Routine } from '@prisma/client'

export async function GET() {
  try {
    const routines: Routine[] = await prisma.routine.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(routines);
  } catch (error) {
    console.error('Failed to fetch routines:', error);
    return NextResponse.json({ error: 'Failed to fetch routines' }, { status: 500 });
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