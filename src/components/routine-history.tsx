'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BsDownload, BsClipboard } from 'react-icons/bs'
import { toast } from 'sonner'

type Routine = {
  id: string
  createdAt: string
  input: string
  output: string
  tags?: string
}

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

export function RoutineHistory() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await fetch('/api/routines');
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          const formattedRoutines = data.map(routine => ({
            id: routine.id,
            createdAt: new Date(routine.createdAt).toISOString(),
            input: routine.input,
            output: String(routine.output || ''),
            tags: routine.tags
          }));
          setRoutines(formattedRoutines);
        } else {
          console.error('Failed to fetch routines:', response.status);
        }
      } catch (error) {
        console.error('Error fetching routines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  const handleDownload = (routine: Routine) => {
    const element = document.createElement("a");
    const file = new Blob([routine.output], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `routine-${routine.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

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

  if (loading) {
    return <div className="text-center p-4">Loading history...</div>;
  }

  if (routines.length === 0) {
    return <div className="text-center p-4">No routines generated yet.</div>;
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
            <TextDisplay content={routine.output} />
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
              onClick={() => handleCopy(routine.output)}
              className="flex items-center gap-2"
            >
              <BsClipboard className="h-4 w-4" />
              Copy to Clipboard
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
