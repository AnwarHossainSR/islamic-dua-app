import { useEffect, useState } from 'react';
import { renderMarkdown } from '@/lib/utils/markdown-renderer';

interface TypewriterTextProps {
  content: string;
  speed?: number;
  onComplete?: () => void;
}

export function TypewriterText({ content, speed = 15, onComplete }: TypewriterTextProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Reset when content changes significantly, but handled properly below
    setDisplayedContent('');
    setIsTyping(true);
  }, [content]);

  useEffect(() => {
    if (!content) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [content, speed, onComplete]);

  return (
    <div className="typewriter-content">
      {renderMarkdown(displayedContent)}
      {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />}
    </div>
  );
}
