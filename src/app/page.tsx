'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { RoutineHistory } from '@/components/routine-history'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'
import { BsClipboard } from 'react-icons/bs'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

// Simple component to display text with basic markdown-like formatting
function TextDisplay({ content }: { content: unknown }) {
  if (!content) return null;
  
  // If content is an object with an output property, use that
  const rawContent = typeof content === 'object' && content !== null && 'output' in content
    ? (content as { output: unknown }).output
    : content;
    
  const textContent = typeof rawContent === 'string' 
    ? rawContent 
    : JSON.stringify(rawContent);

  let inNumberedList = false;
  let listCounter = 0;

  const formattedContent = textContent
    .split('\n')
    .map((line, i) => {
      // Handle headers (##, ###)
      if (line.startsWith('## ')) {
        inNumberedList = false;
        listCounter = 0;
        return (
          <h2 key={i} className="text-2xl font-bold mt-6 mb-4">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        inNumberedList = false;
        listCounter = 0;
        return (
          <h3 key={i} className="text-xl font-bold mt-4 mb-3">
            {line.slice(4)}
          </h3>
        );
      }

      // Handle bold text (**text**)
      const boldPattern = /\*\*(.*?)\*\*/g;
      const textWithBold = line.replace(boldPattern, '<strong>$1</strong>');

      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        inNumberedList = false;
        listCounter = 0;
        return (
          <li key={i} className="ml-4 mb-2">
            <span dangerouslySetInnerHTML={{ __html: textWithBold }} />
          </li>
        );
      }

      // Handle numbered lists
      const numberedListMatch = line.match(/^\d+\.\s/);
      if (numberedListMatch) {
        if (!inNumberedList) {
          inNumberedList = true;
          listCounter = 0;
        }
        listCounter++;
        const content = line.replace(/^\d+\.\s/, '');
        return (
          <li key={i} className="ml-4 mb-2 list-decimal">
            <span dangerouslySetInnerHTML={{ __html: content }} />
          </li>
        );
      } else {
        inNumberedList = false;
        listCounter = 0;
      }

      // Regular paragraph with bold text
      if (line.trim()) {
        return (
          <p key={i} className="mb-2">
            <span dangerouslySetInnerHTML={{ __html: textWithBold }} />
          </p>
        );
      }

      // Empty lines become spacing
      return <div key={i} className="h-4" />;
    });

  return (
    <div className="prose dark:prose-invert">
      {formattedContent}
    </div>
  );
}

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

  const handleCopy = async (text: string) => {
    try {
      await window.navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy text');
      }
      document.body.removeChild(textArea);
    }
  };

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
                  <TextDisplay content={generatedRoutine} />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(generatedRoutine)}
                    className="flex items-center gap-2"
                  >
                    <BsClipboard className="h-4 w-4" />
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
