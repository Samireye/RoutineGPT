'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BsClipboard } from 'react-icons/bs'
import { toast } from 'sonner'
import type { Routine } from '@prisma/client'
import { Chat } from './chat'

interface RoutineWithMessages extends Routine {
  messages: {
    id: string
    content: string
    role: string
    createdAt: string
  }[]
}

function TextDisplay({ content }: { content: unknown }) {
  if (!content) return null;
  
  const rawContent = typeof content === 'object' && content !== null && 'output' in content
    ? (content as { output: unknown }).output
    : content;
    
  const textContent = typeof rawContent === 'string' 
    ? rawContent 
    : JSON.stringify(rawContent);

  const formattedContent = textContent
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-2xl font-bold mt-6 mb-4">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="text-xl font-bold mt-4 mb-3">
            {line.slice(4)}
          </h3>
        );
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={i} className="ml-4 mb-2">
            {line.slice(2)}
          </li>
        );
      }

      const numberedListMatch = line.match(/^\d+\.\s/);
      if (numberedListMatch) {
        const listText = line.slice(numberedListMatch[0].length);
        return (
          <li key={i} className="ml-4 mb-2 list-decimal">
            {listText}
          </li>
        );
      }

      if (line.trim()) {
        return (
          <p key={i} className="mb-2">
            {line}
          </p>
        );
      }

      return <div key={i} className="h-4" />;
    });

  return (
    <div className="prose dark:prose-invert max-w-none">
      {formattedContent}
    </div>
  );
}

export function RoutineHistory() {
  const [routines, setRoutines] = useState<RoutineWithMessages[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await fetch('/api/routines')
        const data = await response.json()
        setRoutines(data)
      } catch {
        toast.error('Failed to load routines')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoutines()
  }, [])

  const handleCopy = async (text: string) => {
    try {
      await window.navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Copied to clipboard!');
      } catch {
        toast.error('Failed to copy text');
      }
      document.body.removeChild(textArea);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading routines...
      </div>
    )
  }

  if (routines.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          No routines generated yet. Try creating one!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold">Your Generated Routines</h2>
        <p className="text-muted-foreground mt-2">
          View and chat about your previously generated routines
        </p>
      </div>

      <div className="space-y-6">
        {routines.map((routine) => (
          <Card key={routine.id} className="p-6 md:p-8">
            <div className="mb-6 flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">Routine #{routine.id}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(routine.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(routine.output)}
                className="flex items-center gap-2"
              >
                <BsClipboard className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <div className="prose dark:prose-invert max-w-none mb-6">
              <TextDisplay content={routine.output} />
            </div>
            <div className="space-y-4">
              {selectedRoutineId === routine.id ? (
                <>
                  <div className="border-t pt-6">
                    <Chat routineId={routine.id} initialMessages={routine.messages} />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRoutineId(null)}
                    className="w-full"
                  >
                    Close Chat
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setSelectedRoutineId(routine.id)}
                  className="w-full"
                >
                  Chat About This Routine
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
