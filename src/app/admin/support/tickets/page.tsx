
"use client";

import { useState, useMemo, useEffect } from 'react'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { MessageSquareWarning, Search, Filter, MoreHorizontal, Eye, Edit3, CheckCircle, CircleDot, RefreshCw, UserCog } from "lucide-react";
import type { SupportTicket, TicketStatus, TeamMember } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { SupportTicketDetailModal } from '@/components/features/admin/SupportTicketDetailModal';
import { SupportTicketEditModal } from '@/components/features/admin/SupportTicketEditModal';
import { initialMockTeamMembers } from '@/app/admin/team/page';

export let mockTickets: SupportTicket[] = [
  { id: 'ticket1', userId: 'user123', userName: 'Dr. Emily Carter', userEmail: 'emily.carter@example.com', subject: 'Issue with AI Program Builder', description: 'The AI suggestions are not loading for rotator cuff conditions. I tried refreshing the page and clearing cache, but the issue persists. This is blocking my ability to create programs efficiently. I need this resolved ASAP as I have several patients waiting.', status: 'open', priority: 'high', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), internalNotes: [{adminId: 'admin1', adminName: 'Super Admin', note: 'Investigating model response for rotator cuff query.', timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString()}] },
  { id: 'ticket2', userId: 'user456', userName: 'John Doe (Patient)', userEmail: 'john.doe@example.com', subject: 'Cannot log in to patient portal', description: 'My password reset link is not working. I click it, but it says token expired, even if I try immediately.', status: 'in_progress', priority: 'medium', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), assignedToAdminId: 'tm2', assignedToAdminName: 'Bob Reviewer' },
  { id: 'ticket3', userId: 'user789', userName: 'Clinic Admin Sarah', userEmail: 'sarah@clinic.com', subject: 'Billing query', description: 'Need clarification on last month\'s invoice, specifically the charge for "Additional Telehealth Units".', status: 'resolved', priority: 'low', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), assignedToAdminId: 'tm4', assignedToAdminName: 'Diana Finance', updatedAt: new Date().toISOString() },
  { id: 'ticket4', userId: 'user101', userName: 'Dr. Alex Chen', userEmail: 'alex.chen@example.com', subject: 'Feature Request: Bulk Exercise Upload', description: 'It would be great to upload exercises via CSV. We have an existing library of 500+ exercises we\'d like to import.', status: 'open', priority: 'medium', createdAt: new Date().toISOString() },
];

export const addMockTicket = (newTicketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status' | 'priority'>) => {
  const ticketToAdd: SupportTicket = {
    ...newTicketData,
    id: `ticket${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'open', 
    priority: 'medium', 
  };
  mockTickets = [ticketToAdd, ...mockTickets];
};

export const updateMockTicket = (updatedTicket: SupportTicket) => {
  const index = mockTickets.findIndex(t => t.id === updatedTicket.id);
  if (index !== -1) {
    mockTickets[index] = updatedTicket;
  } else {
    addMockTicket(updatedTicket as Omit<SupportTicket, 'id' | 'createdAt' | 'status' | 'priority'>); // Add if not found
  }
  mockTickets = [...mockTickets];
};

const ticketStatuses: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
const ticketPriorities: SupportTicket['priority'][] = ['low', 'medium', 'high'];

export default function SupportTicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>(() => [...mockTickets]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ status: TicketStatus | 'all'; priority: SupportTicket['priority'] | 'all' }>({
    status: 'all',
    priority: 'all',
  });
  const [selectedTicketForView, setSelectedTicketForView] = useState<SupportTicket | null>(null);
  const [selectedTicketForEdit, setSelectedTicketForEdit] = useState<SupportTicket | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    setTickets([...mockTickets].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); 
  }, [mockTickets.length]); 

  const refreshTickets = () => {
    setTickets([...mockTickets].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    toast({ title: 'Ticket List Refreshed' });
  };

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value as any }));
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const searchMatch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filters.status === 'all' || ticket.status === filters.status;
      const priorityMatch = filters.priority === 'all' || ticket.priority === filters.priority;
      return searchMatch && statusMatch && priorityMatch;
    });
  }, [searchTerm, filters, tickets]);
  
  const handleViewDetails = (ticket: SupportTicket) => {
    setSelectedTicketForView(ticket);
    setIsViewModalOpen(true);
  };
  
  const handleOpenEditModal = (ticket: SupportTicket) => {
    setSelectedTicketForEdit(ticket);
    setIsEditModalOpen(true);
  };
  
  const handleSaveChangesFromModal = (updatedTicket: SupportTicket) => {
    updateMockTicket(updatedTicket); 
    setTickets([...mockTickets].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

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
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <MessageSquareWarning className="mr-3 h-8 w-8" /> Support & Feedback Tickets
          </h1>
          <p className="text-muted-foreground">Manage user-submitted support requests and feedback.</p>
        </div>
         <Button variant="outline" size="sm" onClick={refreshTickets}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh List
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Ticket List ({filteredTickets.length})</CardTitle>
          <CardDescription>Browse, filter, and manage all support tickets.</CardDescription>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject, user, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger><Filter className="mr-2 h-4 w-4 shrink-0 opacity-50"/><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ticketStatuses.map(stat => <SelectItem key={stat} value={stat} className="capitalize">{stat.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger><Filter className="mr-2 h-4 w-4 shrink-0 opacity-50"/><SelectValue placeholder="Filter by Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {ticketPriorities.map(prio => <SelectItem key={prio} value={prio} className="capitalize">{prio}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTickets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{ticket.id.substring(0,8)}...</TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{ticket.subject}</TableCell>
                    <TableCell>
                        {ticket.userName}
                        <div className="text-xs text-muted-foreground">{ticket.userEmail}</div>
                    </TableCell>
                    <TableCell>
                      {ticket.assignedToAdminName ? (
                        <span className="text-xs flex items-center"><UserCog className="h-3 w-3 mr-1"/>{ticket.assignedToAdminName}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell><Badge variant={getPriorityBadgeVariant(ticket.priority)} className="capitalize">{ticket.priority}</Badge></TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(ticket.status)} className="capitalize">{ticket.status.replace('_',' ')}</Badge></TableCell>
                    <TableCell className="text-xs">{format(new Date(ticket.createdAt), 'MMM d, yyyy p')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleViewDetails(ticket)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleOpenEditModal(ticket)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit/Assign
                          </DropdownMenuItem> 
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Tickets Found</h3>
              <p>No support tickets match your current filters, or no tickets have been submitted yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <SupportTicketDetailModal 
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        ticket={selectedTicketForView}
        onEditTicket={(ticketToEdit) => {
          setIsViewModalOpen(false); 
          handleOpenEditModal(ticketToEdit); 
        }}
      />
      <SupportTicketEditModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        ticket={selectedTicketForEdit}
        adminUsers={initialMockTeamMembers.filter(tm => tm.status === 'active')}
        onSaveChanges={handleSaveChangesFromModal}
      />

    </div>
  );
}
