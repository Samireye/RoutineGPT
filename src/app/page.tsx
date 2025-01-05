'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ThemeToggle } from '@/components/theme-toggle'
import { RoutineHistory } from '@/components/routine-history'
import ReactMarkdown from 'react-markdown'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const samplePrompts = [
  {
    title: "Comprehensive Daily Routine",
    prompt: "I want to become a more focused and productive person who starts the day early, maintains high energy throughout the day, and continuously learns new skills. I'm currently struggling with consistency and often feel mentally foggy."
  },
  {
    title: "Morning Routine",
    prompt: "Help me design a powerful morning routine that will set me up for success. I want to incorporate exercise, learning, and planning into my mornings."
  },
  {
    title: "Learning Optimization",
    prompt: "I want to improve my learning ability and memory while maintaining high energy levels. I need specific techniques for better focus and information retention."
  },
  {
    title: "Work Productivity",
    prompt: "I need a routine that helps me stay focused and productive during work hours while taking care of my health. Include strategies for managing energy and avoiding burnout."
  }
]

export default function Home() {
  const [routineInput, setRoutineInput] = useState('')
  const [generatedRoutine, setGeneratedRoutine] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateRoutine = async () => {
    if (!routineInput.trim()) {
      setError('Please describe your routine first')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      console.log('Sending request to API...')
      const response = await fetch('/api/generate-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: routineInput }),
      })

      console.log('Response status:', response.status)
      const text = await response.text()
      console.log('Raw response:', text)

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Response text:', text)
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate routine')
      }

      if (!data.routine) {
        throw new Error('No routine was generated')
      }

      setGeneratedRoutine(data.routine)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate routine. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">RoutineGPT</h1>
          <ThemeToggle />
        </div>

        <Tabs defaultValue="generate" className="space-y-4">
          <TabsList>
            <TabsTrigger value="generate">Generate Routine</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Describe Your Routine Goals</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Try these examples:</h3>
                <div className="grid grid-cols-1 gap-3">
                  {samplePrompts.map((sample, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-3 px-4 text-left flex flex-col items-start w-full overflow-hidden"
                      onClick={() => setRoutineInput(sample.prompt)}
                    >
                      <span className="font-medium mb-1 w-full">{sample.title}</span>
                      <span className="text-sm text-muted-foreground w-full break-words whitespace-normal">
                        {sample.prompt}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <Textarea
                value={routineInput}
                onChange={(e) => setRoutineInput(e.target.value)}
                placeholder="Describe your current routine and what you'd like to improve..."
                className="mb-4 min-h-[150px]"
              />
              
              {error && (
                <p className="text-red-500 mb-4">Error: {error}</p>
              )}
              
              <Button 
                onClick={handleGenerateRoutine}
                className="bg-gray-600 hover:bg-gray-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Routine'}
              </Button>
            </Card>

            {generatedRoutine && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Your Optimized Routine</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{generatedRoutine}</ReactMarkdown>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedRoutine)
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <RoutineHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
