
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  images?: string[];
}

interface ChatScrollAreaProps {
  messages: Message[];
  isMobile: boolean;
  children: React.ReactNode;
}

const ChatScrollArea: React.FC<ChatScrollAreaProps> = ({ messages, isMobile, children }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages]);

  return (
    <div 
      ref={scrollAreaRef}
      className={`flex-1 scrollable-container ${isMobile 
        ? 'p-6 pb-4 min-h-[calc(100vh-160px)]' 
        : 'mb-8 min-h-[500px]'
      }`}
    >
      <div className="space-y-6">
        {children}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatScrollArea;
