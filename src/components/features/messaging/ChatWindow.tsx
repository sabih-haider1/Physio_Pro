
"use client";

import { useState, useRef, useEffect } from 'react';
import type { Message } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Send, Smile, AlertTriangle, MessageSquare as MessageSquareIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns'; 
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string; 
  recipientName: string;
  recipientAvatar?: string;
  onSendMessage: (content: string, attachment?: File) => void;
  isLoading?: boolean;
  onSimulateReply?: () => void; // Optional: For clinician to simulate patient reply
}

export function ChatWindow({ messages, currentUserId, recipientName, recipientAvatar, onSendMessage, isLoading, onSimulateReply }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() === '' && !attachment) return;
    onSendMessage(newMessage, attachment || undefined);
    setNewMessage('');
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 10 * 1024 * 1024) { 
        alert("File size exceeds 10MB limit.");
        return;
      }
      setAttachment(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={recipientAvatar || `https://placehold.co/40x40.png?text=${recipientName.charAt(0)}`} alt={recipientName} data-ai-hint="person face" />
            <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{recipientName}</h3>
            <p className="text-xs text-green-500">Online</p> 
          </div>
        </div>
        {onSimulateReply && (
          <Button variant="outline" size="sm" onClick={onSimulateReply} className="text-xs">
            Simulate Reply from {recipientName.split(' ')[0]}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquareIcon className="w-16 h-16 mb-4 opacity-50" />
            <p>No messages yet.</p>
            <p>Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isSender = msg.senderId === currentUserId;
          const isUrgent = (msg as any).sentiment_score && (msg as any).sentiment_score > 0.7;

          return (
            <div key={msg.id} className={cn("flex mb-3", isSender ? "justify-end" : "justify-start")}>
              {!isSender && (
                <Avatar className="h-8 w-8 mr-2 self-end">
                  <AvatarImage src={msg.senderAvatar || recipientAvatar || `https://placehold.co/40x40.png?text=${msg.senderName?.charAt(0) || recipientName.charAt(0)}`} data-ai-hint="person face" />
                  <AvatarFallback>{msg.senderName?.charAt(0) || recipientName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                  "max-w-[70%] p-3 rounded-xl shadow-sm relative",
                  isSender ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none",
                  isUrgent && !isSender ? "border-2 border-destructive bg-destructive/10 text-destructive-foreground" : ""
                )}
              >
                {isUrgent && !isSender && (
                  <div className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground p-1 rounded-full">
                    <AlertTriangle className="h-3 w-3" />
                  </div>
                )}
                <p className="text-sm break-words">{msg.content}</p>
                {msg.attachmentUrl && (
                  <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs underline flex items-center hover:text-opacity-80">
                    <Paperclip className="h-3 w-3 mr-1" />
                    View Attachment
                  </a>
                )}
                <p className={cn(
                    "text-xs mt-1",
                    isSender ? "text-primary-foreground/70 text-right" : "text-muted-foreground/80 text-left"
                  )}
                >
                  {format(new Date(msg.timestamp), "p")}
                </p>
              </div>
               {isSender && (
                <Avatar className="h-8 w-8 ml-2 self-end">
                  <AvatarImage src={`https://placehold.co/40x40.png?text=Me`} data-ai-hint="person face" />
                  <AvatarFallback>Me</AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
      </ScrollArea>

      <div className="p-4 border-t">
        {attachment && (
          <div className="mb-2 p-2 bg-muted rounded-md text-sm flex justify-between items-center">
            <span>Selected: {attachment.name}</span>
            <Button variant="ghost" size="sm" onClick={() => { setAttachment(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}>Clear</Button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Attach file</span>
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleAttachmentChange} className="hidden" accept="image/*,application/pdf,.doc,.docx" />
          
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            className="flex-grow rounded-full px-4 py-2 text-base"
            disabled={isLoading}
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading || (newMessage.trim() === '' && !attachment)} className="rounded-full">
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
