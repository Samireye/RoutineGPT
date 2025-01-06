'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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

  const formattedContent = textContent
    .split('\n')
    .map((line, i) => {
      // Handle headers (##, ###)
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

      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={i} className="ml-4 mb-2">
            {line.slice(2)}
          </li>
        );
      }

      // Handle numbered lists
      const numberedListMatch = line.match(/^\d+\.\s/);
      if (numberedListMatch) {
        const listText = line.slice(numberedListMatch[0].length);
        return (
          <li key={i} className="ml-4 mb-2 list-decimal">
            {listText}
          </li>
        );
      }

      // Regular paragraph
      if (line.trim()) {
        return (
          <p key={i} className="mb-2">
            {line}
          </p>
        );
      }

      // Empty lines become spacing
      return <div key={i} className="h-4" />;
    });

  return (
    <div className="prose dark:prose-invert max-w-none">
      {formattedContent}
    </div>
  );
}

const samplePrompts = [
  "I want to improve my learning ability and memory while maintaining high energy levels. I need specific techniques for better focus and information retention.",
  "I want to become more productive and organized. I need a routine that helps me manage my time better and get more done.",
  "I want to improve my physical fitness and mental clarity. I need a balanced routine that includes exercise, meditation, and healthy habits."
];

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [generatedRoutine, setGeneratedRoutine] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate routine');
      }

      if (!data.success || !data.routine) {
        throw new Error('Invalid response format from server');
      }

      setGeneratedRoutine(data.routine.output || '');
    } catch (error) {
      console.error('Error generating routine:', error);
      toast.error('Failed to generate routine. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await window.navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      // Fallback method
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">RoutineGPT</h1>
          <ThemeToggle />
        </header>

        <Tabs defaultValue="generate" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-8">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-center">Create Your Perfect Routine</h2>
                <p className="text-muted-foreground text-center">
                  Describe your goals and preferences, and I'll help you design an optimized routine.
                </p>
              </div>

              <div className="space-y-4">
                <Textarea
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] text-lg leading-relaxed"
                />
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-6 text-lg"
                >
                  {isGenerating ? 'Generating...' : 'Generate Routine'}
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Try these examples:
                </p>
                <div className="grid gap-3">
                  {samplePrompts.map((samplePrompt, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(samplePrompt)}
                      className="text-left p-4 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      {samplePrompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {generatedRoutine && (
              <div className="max-w-3xl mx-auto">
                <Card className="p-6 md:p-8">
                  <div className="mb-6 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Your Optimized Routine</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(generatedRoutine)}
                      className="flex items-center gap-2"
                    >
                      <BsClipboard className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <TextDisplay content={generatedRoutine} />
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="max-w-3xl mx-auto">
              <RoutineHistory />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
