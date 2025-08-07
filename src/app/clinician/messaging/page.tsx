
"use client";

import { useState, useEffect } from 'react';
import type { Message, Patient } from '@/lib/types'; 
import { UserListSidebar } from '@/components/features/messaging/UserListSidebar';
import { ChatWindow } from '@/components/features/messaging/ChatWindow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareDiff } from 'lucide-react';
import { format } from 'date-fns'; // For formatting lastMessageTime

// Define a type for the user data displayed in the sidebar
interface ChatUserDisplayData {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

// Initial data for patients, including chat-specific fields
const initialMockPatientsForChat: ChatUserDisplayData[] = [
  { id: "p1", name: "Alice Green", avatarUrl: "https://placehold.co/40x40.png?text=AG", lastMessage: "Okay, I'll try that stretch.", lastMessageTime: "10:30 AM", unreadCount: 2, isOnline: true },
  { id: "p2", name: "Bob White", avatarUrl: "https://placehold.co/40x40.png?text=BW", lastMessage: "Thanks for the update!", lastMessageTime: "Yesterday", unreadCount: 0, isOnline: false },
  { id: "p3", name: "Charlie Black", avatarUrl: "https://placehold.co/40x40.png?text=CB", lastMessage: "Feeling much better today.", lastMessageTime: "Mon", unreadCount: 0, isOnline: true },
];

const initialMockMessages: { [patientId: string]: Message[] } = {
  p1: [
    { id: 'msg1', senderId: 'p1', receiverId: 'doc_current', content: 'Hi Dr. C, I had a question about exercise 2.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), senderName: "Alice Green" },
    { id: 'msg2', senderId: 'doc_current', receiverId: 'p1', content: 'Hi Alice, what can I help you with?', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    { id: 'msg3', senderId: 'p1', receiverId: 'doc_current', content: 'It felt a bit too strenuous on my knee.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), senderName: "Alice Green" },
    { id: 'msg4', senderId: 'doc_current', receiverId: 'p1', content: 'Okay, let\'s reduce the reps for now. Try 2 sets of 8.', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
    { id: 'msg5', senderId: 'p1', receiverId: 'doc_current', content: "Okay, I'll try that stretch.", timestamp: new Date().toISOString(), senderName: "Alice Green" },
  ],
  p2: [
    { id: 'msg6', senderId: 'doc_current', receiverId: 'p2', content: 'Hi Bob, just checking in on your progress.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: 'msg7', senderId: 'p2', receiverId: 'doc_current', content: 'Thanks for the update!', timestamp: new Date(Date.now() - 1000 * 60 * 30 * 24).toISOString(), senderName: "Bob White" },
  ],
   p3: [
    { id: 'msg8', senderId: 'p3', receiverId: 'doc_current', content: 'Feeling much better today.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), senderName: "Charlie Black"},
  ]
};

const currentClinicianId = "doc_current"; 

export default function ClinicianMessagingPage() {
  const [chatUsers, setChatUsers] = useState<ChatUserDisplayData[]>(initialMockPatientsForChat);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialMockPatientsForChat[0]?.id || null);
  const [messages, setMessages] = useState<{ [patientId: string]: Message[] }>(initialMockMessages);

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    // Mark messages as read for this patient
    setChatUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === patientId ? { ...u, unreadCount: 0 } : u
      )
    );
  };

  const handleSendMessage = (content: string, attachment?: File) => {
    if (!selectedPatientId) return;

    const newMessage: Message = {
      id: `msg${Date.now()}`,
      senderId: currentClinicianId,
      receiverId: selectedPatientId,
      content,
      timestamp: new Date().toISOString(),
      attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined, 
    };

    setMessages(prev => ({
      ...prev,
      [selectedPatientId]: [...(prev[selectedPatientId] || []), newMessage],
    }));
    
    // Update last message for sidebar
    setChatUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === selectedPatientId ? {
          ...u,
          lastMessage: content.substring(0, 30) + (content.length > 30 ? "..." : ""),
          lastMessageTime: format(new Date(), "p") // "10:30 AM"
        } : u
      )
    );
  };

  const handleSimulatePatientReply = () => {
    if (!selectedPatientId) return;
    
    const selectedPatient = chatUsers.find(u => u.id === selectedPatientId);
    if (!selectedPatient) return;

    const replyContent = `This is a simulated reply from ${selectedPatient.name}.`;
    const newReplyMessage: Message = {
      id: `reply_msg_${Date.now()}`,
      senderId: selectedPatientId, // Patient is sender
      receiverId: currentClinicianId,
      content: replyContent,
      timestamp: new Date().toISOString(),
      senderName: selectedPatient.name,
    };

    // Add to messages state
    setMessages(prev => ({
      ...prev,
      [selectedPatientId]: [...(prev[selectedPatientId] || []), newReplyMessage],
    }));

    // Update chatUsers state for sidebar
    setChatUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === selectedPatientId ? {
          ...u,
          lastMessage: replyContent.substring(0, 30) + (replyContent.length > 30 ? "..." : ""),
          lastMessageTime: format(new Date(), "p"),
          unreadCount: (u.unreadCount || 0) + 1,
        } : u
      )
    );
  };
  
  const selectedPatientDetails = chatUsers.find(p => p.id === selectedPatientId);

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,100px))] overflow-hidden">
       <div className="p-4 border-b bg-background">
        <h1 className="text-2xl font-bold font-headline text-primary flex items-center">
            <MessageSquareDiff className="mr-3 h-7 w-7"/> Secure Messaging
        </h1>
        <p className="text-muted-foreground text-sm">Communicate directly and securely with your patients.</p>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <UserListSidebar 
          users={chatUsers} 
          selectedUserId={selectedPatientId} 
          onSelectUser={handleSelectPatient} 
        />
        <div className="flex-1 flex flex-col">
          {selectedPatientDetails ? (
            <ChatWindow
              messages={messages[selectedPatientId] || []}
              currentUserId={currentClinicianId}
              recipientName={selectedPatientDetails.name}
              recipientAvatar={selectedPatientDetails.avatarUrl}
              onSendMessage={handleSendMessage}
              onSimulateReply={handleSimulatePatientReply} // Pass the new handler
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/20">
              <Card className="text-center p-8 shadow-none border-none">
                <MessageSquareDiff className="mx-auto h-16 w-16 opacity-50 mb-4" />
                <CardTitle className="text-xl">Select a conversation</CardTitle>
                <CardDescription className="mt-1">Choose a patient from the list to start chatting.</CardDescription>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
