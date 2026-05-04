"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendIcon } from "lucide-react";

export interface ChatMessage {
  id: string;
  author: { name: string };
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage?: (content: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage?.(input.trim());
    setInput("");
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = (date: Date) => {
    if (!mounted) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start a conversation with your team</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-2">
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="text-[10px]">
                  {msg.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{msg.author.name}</span>
                  <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="mt-0.5 text-sm bg-muted px-3 py-2 rounded-lg inline-block max-w-full break-words">
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 h-9 px-3 rounded-md border bg-background text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <Button type="submit" size="sm" disabled={!input.trim()}>
          <SendIcon className="size-4" />
        </Button>
      </form>
    </div>
  );
}
