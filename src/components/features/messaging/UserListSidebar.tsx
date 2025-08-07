"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Define a type for the user data expected by this component
export interface ChatUserDisplayData {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
  userId?: string; // Added for patient object compatibility if needed
}

interface UserListSidebarProps {
  users: ChatUserDisplayData[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

export function UserListSidebar({ users, selectedUserId, onSelectUser }: UserListSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full border-r bg-muted/30 w-full md:w-80 lg:w-96">
      <div className="p-4 border-b">
        <h2 className="text-xl font-headline font-semibold text-primary mb-1">Messages</h2>
        <p className="text-sm text-muted-foreground">Your recent conversations.</p>
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-grow">
        {filteredUsers.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">No conversations found.</p>
        ) : (
          <nav className="p-2 space-y-1">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className={cn(
                  "w-full flex items-center p-3 rounded-lg text-left transition-colors",
                  selectedUserId === user.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png?text=${user.name?.charAt(0)}`} alt={user.name} data-ai-hint="person face" />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-3 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" title="Online" />
                  )}
                </div>
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h4 className={cn("font-semibold text-sm truncate", selectedUserId === user.id ? "" : "text-foreground")}>{user.name}</h4>
                    {user.lastMessageTime && <span className={cn("text-xs", selectedUserId === user.id ? "text-primary-foreground/70" : "text-muted-foreground")}>{user.lastMessageTime}</span>}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={cn("text-xs truncate", selectedUserId === user.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {user.lastMessage || "No recent messages"}
                    </p>
                    {user.unreadCount && user.unreadCount > 0 && (
                      <Badge variant={selectedUserId === user.id ? "secondary" : "destructive"} className="px-1.5 py-0.5 text-xs h-5">
                        {user.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        )}
      </ScrollArea>
    </div>
  );
}