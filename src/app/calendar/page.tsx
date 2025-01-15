'use client'

import { useState, useEffect } from 'react'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { CalendarView } from '@/components/calendar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description?: string | null
  startTime: Date
  endTime?: Date | null
  status: string
  isRecurring: boolean
  frequency?: string | null
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchTasks = async (date: Date) => {
    try {
      const startDate = startOfMonth(date).toISOString()
      const endDate = endOfMonth(date).toISOString()
      
      const response = await fetch(
        `/api/tasks?startDate=${startDate}&endDate=${endDate}`
      )
      if (!response.ok) throw new Error('Failed to fetch tasks')
      
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks(selectedDate)
  }, [selectedDate])

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDialogOpen(true)
  }

  const handleStatusUpdate = async (status: string) => {
    if (!selectedTask) return

    try {
      const response = await fetch(`/api/tasks?id=${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('Failed to update task')

      const updatedTask = await response.json()
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ))
      toast.success('Task status updated')
      setIsDialogOpen(false)
    } catch (error) {
      toast.error('Failed to update task status')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Loading calendar...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <CalendarView
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onDateSelect={setSelectedDate}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedTask && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
              <DialogDescription>
                {selectedTask.description || 'No description provided'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Time</Label>
                <div className="text-sm">
                  {format(new Date(selectedTask.startTime), 'PPp')}
                  {selectedTask.endTime && (
                    <> - {format(new Date(selectedTask.endTime), 'p')}</>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedTask.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => handleStatusUpdate('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={selectedTask.status === 'completed' ? 'default' : 'outline'}
                    onClick={() => handleStatusUpdate('completed')}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={selectedTask.status === 'skipped' ? 'default' : 'outline'}
                    onClick={() => handleStatusUpdate('skipped')}
                  >
                    Skipped
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
