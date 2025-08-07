
"use client";

import { useState, useEffect } from 'react';
import type { Message, Patient } from '@/lib/types'; 
import { UserListSidebar, type ChatUserDisplayData } from '@/components/features/messaging/UserListSidebar'; // Import ChatUserDisplayData
import { ChatWindow } from '@/components/features/messaging/ChatWindow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareDiff } from 'lucide-react';
import { format } from 'date-fns';

// Initial data for the clinician contact
const initialClinicianContact: ChatUserDisplayData = {
  id: "doc_current", 
  userId: "usr_doc_current",
  name: "Dr. Emily Carter", 
  avatarUrl: "https://placehold.co/40x40.png?text=DC", 
  lastMessage: "Okay, let's reduce the reps for now.",
  lastMessageTime: "10:32 AM", // Example, will be updated
  unreadCount: 0, 
  isOnline: true
};

const initialMockPatientMessages: { [clinicianId: string]: Message[] } = {
  doc_current: [
    { id: 'msg1', senderId: 'p1_current', receiverId: 'doc_current', content: 'Hi Dr. C, I had a question about exercise 2.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), senderName: "My Name" },
    { id: 'msg2', senderId: 'doc_current', receiverId: 'p1_current', content: 'Hi there, what can I help you with?', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), senderName: "Dr. Emily Carter" },
    { id: 'msg3', senderId: 'p1_current', receiverId: 'doc_current', content: 'It felt a bit too strenuous on my knee.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), senderName: "My Name" },
    { id: 'msg4', senderId: 'doc_current', receiverId: 'p1_current', content: "Okay, let's reduce the reps for now. Try 2 sets of 8.", timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), senderName: "Dr. Emily Carter" },
  ],
};

const currentPatientId = "p1_current"; 

export default function PatientMessagingPage() {
  const [clinicianContact, setClinicianContact] = useState<ChatUserDisplayData>(initialClinicianContact);
  const selectedClinicianId = clinicianContact.id; // Always the assigned clinician
  const [messages, setMessages] = useState<{ [clinicianId: string]: Message[] }>(initialMockPatientMessages);

  const handleSendMessage = (content: string, attachment?: File) => {
    const newMessage: Message = {
      id: `msg${Date.now()}`,
      senderId: currentPatientId, 
      receiverId: selectedClinicianId, 
      content,
      timestamp: new Date().toISOString(),
      attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
      senderName: "My Name (Patient)" 
    };

    setMessages(prev => ({
      ...prev,
      [selectedClinicianId]: [...(prev[selectedClinicianId] || []), newMessage],
    }));
    
    // Update last message for sidebar display
    setClinicianContact(prevContact => ({
      ...prevContact,
      lastMessage: content.substring(0,30) + (content.length > 30 ? "..." : ""),
      lastMessageTime: format(new Date(), "p") // e.g., "10:35 AM"
    }));
  };
  
  const clinicianContactList = [clinicianContact]; // Sidebar expects an array

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,100px))] overflow-hidden">
       <div className="p-4 border-b bg-background">
        <h1 className="text-2xl font-bold font-headline text-primary flex items-center">
            <MessageSquareDiff className="mr-3 h-7 w-7"/> Secure Messaging
        </h1>
        <p className="text-muted-foreground text-sm">Communicate directly with your clinician.</p>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <UserListSidebar 
          users={clinicianContactList} 
          selectedUserId={selectedClinicianId} 
          onSelectUser={() => {}} // No other user to select for patient
        />
        <div className="flex-1 flex flex-col">
          <ChatWindow
            messages={messages[selectedClinicianId] || []}
            currentUserId={currentPatientId} 
            recipientName={clinicianContact.name}
            recipientAvatar={clinicianContact.avatarUrl}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
