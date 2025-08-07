
"use client";

import { useState, useEffect } from 'react';
import type { SupportTicket, TicketStatus, TeamMember } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface SupportTicketEditModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  ticket: SupportTicket | null;
  adminUsers: TeamMember[]; // For assigning tickets
  onSaveChanges: (updatedTicket: SupportTicket) => void;
}

const ticketStatuses: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
const ticketPriorities: SupportTicket['priority'][] = ['low', 'medium', 'high'];

export function SupportTicketEditModal({ 
  isOpen, 
  onOpenChange, 
  ticket, 
  adminUsers, 
  onSaveChanges 
}: SupportTicketEditModalProps) {
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<TicketStatus>(ticket?.status || 'open');
  const [currentPriority, setCurrentPriority] = useState<SupportTicket['priority']>(ticket?.priority || 'medium');
  const [assignedAdminId, setAssignedAdminId] = useState<string | undefined>(ticket?.assignedToAdminId);
  const [internalNote, setInternalNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (ticket) {
      setCurrentStatus(ticket.status);
      setCurrentPriority(ticket.priority);
      setAssignedAdminId(ticket.assignedToAdminId);
      setInternalNote(''); // Clear note on new ticket load
    }
  }, [ticket, isOpen]); // Reset form fields when ticket or isOpen changes

  if (!ticket) return null;

  const handleSubmit = () => {
    setIsLoading(true);
    const assignedAdmin = adminUsers.find(admin => admin.id === assignedAdminId);
    const updatedTicket: SupportTicket = {
      ...ticket,
      status: currentStatus,
      priority: currentPriority,
      assignedToAdminId: assignedAdminId,
      assignedToAdminName: assignedAdmin?.name,
      updatedAt: new Date().toISOString(),
      internalNotes: internalNote.trim() ? [
        ...(ticket.internalNotes || []),
        {
          adminId: 'current_admin_id_placeholder', // Replace with actual current admin ID
          adminName: 'Current Admin (Placeholder)', // Replace with actual current admin name
          note: internalNote.trim(),
          timestamp: new Date().toISOString(),
        }
      ] : ticket.internalNotes,
    };

    // Simulate API call
    setTimeout(() => {
      onSaveChanges(updatedTicket);
      toast({ title: "Ticket Updated", description: `Ticket "${ticket.subject}" has been updated.` });
      setIsLoading(false);
      onOpenChange(false);
    }, 700);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline text-primary">Edit Ticket: {ticket.id.substring(0,8)}...</DialogTitle>
          <DialogDescription>Update status, priority, assignment, or add internal notes.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <p className="text-sm font-medium">Subject: <span className="font-normal text-muted-foreground">{ticket.subject}</span></p>
            <p className="text-xs text-muted-foreground">User: {ticket.userName} ({ticket.userEmail})</p>
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={currentStatus} onValueChange={(val) => setCurrentStatus(val as TicketStatus)}>
              <SelectTrigger id="status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ticketStatuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={currentPriority} onValueChange={(val) => setCurrentPriority(val as SupportTicket['priority'])}>
              <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ticketPriorities.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select value={assignedAdminId || ""} onValueChange={(val) => setAssignedAdminId(val || undefined)}>
              <SelectTrigger id="assignedTo"><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {adminUsers.map(admin => <SelectItem key={admin.id} value={admin.id}>{admin.name} ({admin.role})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="internalNote">Add Internal Note</Label>
            <Textarea 
              id="internalNote" 
              placeholder="Optional: Add a note for your team..." 
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
