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
        return (
          <li key={i} className="ml-4 mb-2 list-decimal">
            {line.slice(numberedListMatch[0].length)}
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
    <div className="prose dark:prose-invert">
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
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">RoutineGPT</h1>
          <ThemeToggle />
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="generate">
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Generate a Routine</h2>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Try these example prompts:
                  </p>
                  <div className="grid gap-2">
                    {samplePrompts.map((samplePrompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => setPrompt(samplePrompt)}
                        className="justify-start h-auto whitespace-normal"
                      >
                        {samplePrompt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="h-24"
                  />
                  <Button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Routine'}
                  </Button>
                </div>

                {generatedRoutine && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Your Optimized Routine</h3>
                    <div className="prose dark:prose-invert max-w-none mb-4">
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
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <RoutineHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
