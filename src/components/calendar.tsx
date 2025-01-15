'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

interface CalendarViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onDateSelect: (date: Date) => void
}

export function CalendarView({ tasks, onTaskClick, onDateSelect }: CalendarViewProps) {
  const [date, setDate] = useState<Date>(new Date())

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      onDateSelect(selectedDate)
    }
  }

  // Get tasks for the selected date
  const selectedDateTasks = tasks.filter(task => {
    const taskDate = new Date(task.startTime)
    return (
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear()
    )
  })

  // Get dates with tasks for highlighting in calendar
  const datesWithTasks = tasks.map(task => new Date(task.startTime))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-semibold">
          {format(date, 'MMMM yyyy')}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              modifiers={{
                hasTasks: datesWithTasks,
              }}
              modifiersStyles={{
                hasTasks: {
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                },
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Tasks for {format(date, 'PP')}</h3>
        {selectedDateTasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks scheduled for this date.</p>
        ) : (
          <div className="space-y-2">
            {selectedDateTasks.map((task) => (
              <Card
                key={task.id}
                className="p-4 cursor-pointer hover:bg-accent"
                onClick={() => onTaskClick(task)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                        {task.status}
                      </Badge>
                      {task.isRecurring && (
                        <Badge variant="outline">
                          {task.frequency}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(task.startTime), 'p')}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
