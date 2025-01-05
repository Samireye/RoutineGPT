'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import { BsClipboard, BsDownload } from 'react-icons/bs'

type Routine = {
  id: string
  createdAt: string
  input: string
  output: string
  tags?: string
}

export function RoutineHistory() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await fetch('/api/routines')
        const data = await response.json()
        setRoutines(data)
      } catch (error) {
        console.error('Failed to fetch routines:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoutines()
  }, [])

  const handleDownload = (routine: Routine) => {
    const element = document.createElement("a");
    const file = new Blob([routine.output], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `routine-${routine.id}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  if (loading) {
    return <div className="text-center p-4">Loading history...</div>
  }

  if (routines.length === 0) {
    return <div className="text-center p-4">No routines generated yet.</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Routine History</h2>
      {routines.map((routine) => (
        <Card key={routine.id} className="p-6">
          <h3 className="text-xl font-semibold mb-2">
            Created on {new Date(routine.createdAt).toLocaleDateString()}
          </h3>
          <div className="prose dark:prose-invert max-w-none mb-4">
            <ReactMarkdown>{routine.output}</ReactMarkdown>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleDownload(routine)}
              className="flex items-center gap-2"
            >
              <BsDownload className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(routine.output)
              }}
              className="flex items-center gap-2"
            >
              <BsClipboard className="h-4 w-4" />
              Copy to Clipboard
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
