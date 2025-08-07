
"use client";

import type { SupportTicket } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { User, Mail, CalendarDays, AlertOctagon, Tag, MessageSquare, Edit3, UserCog } from 'lucide-react';
import { format } from 'date-fns';

interface SupportTicketDetailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  ticket: SupportTicket | null;
  onEditTicket: (ticket: SupportTicket) => void; // Callback to open edit modal
}

export function SupportTicketDetailModal({ isOpen, onOpenChange, ticket, onEditTicket }: SupportTicketDetailModalProps) {
  if (!ticket) return null;

  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'secondary'; 
      case 'resolved': return 'default'; 
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };
  
  const getPriorityBadgeVariant = (priority: SupportTicket['priority']) => {
     switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary'; 
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary truncate">Ticket: {ticket.subject}</DialogTitle>
          <DialogDescription>
            Details for support ticket ID: <span className="font-mono text-xs">{ticket.id}</span>
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow overflow-y-auto pr-2 -mr-2">
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>User:</strong> <span className="ml-1">{ticket.userName}</span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>Email:</strong> <span className="ml-1">{ticket.userEmail}</span>
              </div>
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>Created:</strong> <span className="ml-1">{format(new Date(ticket.createdAt), 'PPP p')}</span>
              </div>
              {ticket.updatedAt && (
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  <strong>Updated:</strong> <span className="ml-1">{format(new Date(ticket.updatedAt), 'PPP p')}</span>
                </div>
              )}
               <div className="flex items-center">
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>Status:</strong> <Badge variant={getStatusBadgeVariant(ticket.status)} className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</Badge>
              </div>
              <div className="flex items-center">
                <AlertOctagon className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>Priority:</strong> <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="ml-1 capitalize">{ticket.priority}</Badge>
              </div>
               {ticket.assignedToAdminName && (
                 <div className="flex items-center col-span-2">
                    <UserCog className="mr-2 h-4 w-4 text-muted-foreground" />
                    <strong>Assigned To:</strong> <span className="ml-1">{ticket.assignedToAdminName}</span>
                </div>
               )}
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-1 text-primary">Description:</h4>
              <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {ticket.internalNotes && ticket.internalNotes.length > 0 && (
              <div>
                <Separator className="my-3"/>
                <h4 className="font-semibold mb-2 text-primary">Internal Notes:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {ticket.internalNotes.map((note, index) => (
                    <div key={index} className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                      <p className="font-medium text-blue-700">{note.adminName} <span className="text-blue-500">({format(new Date(note.timestamp), 'PP p')})</span>:</p>
                      <p className="text-blue-600 whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t sm:justify-between">
          <Button variant="outline" onClick={() => onEditTicket(ticket)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit / Assign
          </Button>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper types from lib/types (if not globally available in this scope)
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

