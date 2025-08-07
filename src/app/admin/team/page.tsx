
"use client";

import { useState, useMemo, useEffect } from 'react'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, PlusCircle, MoreHorizontal, Edit, Trash2, Search, Filter, MailOpen, UserCog, RefreshCw, Clock } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import type { TeamMember, SystemRole, UserStatus } from '@/lib/types'; 
import { internalAdminRoles } from '@/lib/types'; 
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { addAuditLogEntry } from '@/app/admin/audit-log/page';
import { format } from 'date-fns';

export let initialMockTeamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Alice Admin', email: 'alice.admin@physiopro.app', role: 'Admin', status: 'active', joinedDate: '2023-01-10', avatarUrl: 'https://placehold.co/100x100.png?text=AA' },
  { id: 'tm2', name: 'Bob Reviewer', email: 'bob.reviewer@physiopro.app', role: 'Content Reviewer', status: 'active', joinedDate: '2023-05-15', avatarUrl: 'https://placehold.co/100x100.png?text=BR' },
  { 
    id: 'tm3', name: 'Charlie Moderator', email: 'charlie.mod@physiopro.app', role: 'Moderator', status: 'pending_invitation', 
    joinedDate: '2024-07-20', avatarUrl: 'https://placehold.co/100x100.png?text=CM', 
    invitedByAdminId: 'tm1', invitedByAdminName: 'Alice Admin', lastInvitationSentAt: new Date(Date.now() - 86400000 * 2).toISOString() 
  },
  { id: 'tm4', name: 'Diana Finance', email: 'diana.finance@physiopro.app', role: 'Finance Admin', status: 'inactive', joinedDate: '2023-11-01', avatarUrl: 'https://placehold.co/100x100.png?text=DF' },
];

export const addMockTeamMember = (newMemberData: Omit<TeamMember, 'id' | 'joinedDate' | 'status' | 'avatarUrl' | 'lastLogin'>) => {
  const newMember: TeamMember = {
    ...newMemberData,
    id: `tm${Date.now()}`,
    joinedDate: new Date().toISOString().split('T')[0], 
    status: 'pending_invitation', 
    avatarUrl: `https://placehold.co/100x100.png?text=${newMemberData.name.split(' ').map(n=>n[0]).join('') || 'P'}`,
    lastInvitationSentAt: new Date().toISOString(),
  };
  initialMockTeamMembers = [newMember, ...initialMockTeamMembers];
  addAuditLogEntry({
    adminUserId: newMemberData.invitedByAdminId || 'admin_system', 
    adminUserName: newMemberData.invitedByAdminName || 'System',
    action: 'Invited Team Member',
    targetEntityType: 'TeamMember',
    targetEntityId: newMember.id,
    details: { invitedEmail: newMember.email, roleAssigned: newMember.role }
  });
};

export const updateMockTeamMember = (updatedMember: TeamMember) => {
  const index = initialMockTeamMembers.findIndex(m => m.id === updatedMember.id);
  if (index !== -1) {
    initialMockTeamMembers[index] = updatedMember;
  } else {
    addMockTeamMember(updatedMember as Omit<TeamMember, 'id' | 'joinedDate' | 'status' | 'avatarUrl' | 'lastLogin'>); // Add if not found
  }
  initialMockTeamMembers = [...initialMockTeamMembers]; 
};

const teamMemberStatuses: UserStatus[] = ['active', 'inactive', 'pending_invitation' as UserStatus, 'suspended'];

export default function TeamManagementPage() {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => [...initialMockTeamMembers]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ role: SystemRole | 'all'; status: UserStatus | 'all' }>({
    role: 'all',
    status: 'all',
  });
  const [memberToModify, setMemberToModify] = useState<TeamMember | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'resendInvite' | null>(null);

  const refreshTeamList = () => {
    setTeamMembers([...initialMockTeamMembers].sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: "Team Member List Refreshed" });
  };

  useEffect(() => {
    refreshTeamList();
  }, [initialMockTeamMembers.length]);


  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value as any }));
  };

  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const searchMatch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = filters.role === 'all' || member.role === filters.role;
      const statusMatch = filters.status === 'all' || member.status === filters.status;
      return searchMatch && roleMatch && statusMatch;
    });
  }, [searchTerm, filters, teamMembers]);

  const handleModifyAction = () => {
    if (!memberToModify || !actionType) return;

    if (actionType === 'delete') {
      addAuditLogEntry({
        adminUserId: 'current_admin_id_placeholder', 
        adminUserName: 'Current Admin (Placeholder)',
        action: 'Deleted Team Member',
        targetEntityType: 'TeamMember',
        targetEntityId: memberToModify.id,
        details: { deletedMemberName: memberToModify.name, deletedMemberEmail: memberToModify.email }
      });
      initialMockTeamMembers = initialMockTeamMembers.filter(m => m.id !== memberToModify.id);
      refreshTeamList();
      toast({ title: 'Team Member Deleted', description: `${memberToModify.name} has been removed from the team.` });
    } else if (actionType === 'resendInvite') {
      const updatedMember = { ...memberToModify, lastInvitationSentAt: new Date().toISOString() };
      updateMockTeamMember(updatedMember);
      addAuditLogEntry({
        adminUserId: 'current_admin_id_placeholder',
        adminUserName: 'Current Admin (Placeholder)',
        action: 'Resent Invitation',
        targetEntityType: 'TeamMember',
        targetEntityId: memberToModify.id,
        details: { email: memberToModify.email }
      });
      refreshTeamList();
      toast({ title: 'Invite Resent (Simulated)', description: `An invitation has been resent to ${memberToModify.email}.` });
    }
    setMemberToModify(null);
    setActionType(null);
  };
  
  const getStatusBadgeVariant = (status: UserStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'pending_invitation': return 'secondary';
      case 'inactive': return 'outline';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Shield className="mr-3 h-8 w-8" /> Team Management
          </h1>
          <p className="text-muted-foreground">Manage internal team members, roles, and permissions.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="default" onClick={refreshTeamList}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh List
            </Button>
            <Button asChild size="default">
              <Link href="/admin/team/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Team Member
              </Link>
            </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Team Member List ({filteredTeamMembers.length})</CardTitle>
          <CardDescription>View, filter, and manage all internal team members.</CardDescription>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
              <SelectTrigger><UserCog className="mr-2 h-4 w-4 shrink-0 opacity-50"/><SelectValue placeholder="Filter by Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {internalAdminRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger><Filter className="mr-2 h-4 w-4 shrink-0 opacity-50"/><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {teamMemberStatuses.map(stat => <SelectItem key={stat} value={stat} className="capitalize">{stat.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTeamMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined / Invited</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeamMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person admin team"/>
                        <AvatarFallback>{member.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {member.name}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(member.status)} className="capitalize">{member.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                        {format(new Date(member.joinedDate), 'PP')}
                        {member.status === 'pending_invitation' && member.lastInvitationSentAt && (
                            <div className="text-muted-foreground flex items-center text-[10px]">
                                <Clock className="mr-1 h-2.5 w-2.5"/> Last invite: {format(new Date(member.lastInvitationSentAt), 'PPp')}
                            </div>
                        )}
                         {member.status === 'pending_invitation' && member.invitedByAdminName && (
                            <div className="text-muted-foreground text-[10px]">
                                Invited by: {member.invitedByAdminName}
                            </div>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/team/${member.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Member</Link>
                          </DropdownMenuItem>
                          {member.status === 'pending_invitation' && (
                            <DropdownMenuItem onSelect={() => { setMemberToModify(member); setActionType('resendInvite'); }}>
                              <MailOpen className="mr-2 h-4 w-4" /> Resend Invitation
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10" 
                            onSelect={() => { setMemberToModify(member); setActionType('delete');}}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Member
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
              <h3 className="text-lg font-medium">No Team Members Found</h3>
              <p>Try adjusting your search terms or filters, or add a new team member.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!memberToModify} onOpenChange={() => setMemberToModify(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === 'delete' && `Delete Team Member: ${memberToModify?.name}?`}
                {actionType === 'resendInvite' && `Resend Invitation to ${memberToModify?.name}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === 'delete' && "This action cannot be undone. This will permanently remove the team member's access."}
                {actionType === 'resendInvite' && `An email invitation will be re-sent to ${memberToModify?.email}.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleModifyAction} 
                className={cn(actionType === 'delete' && buttonVariants({ variant: "destructive" }))}
              >
                {actionType === 'delete' && 'Delete Member'}
                {actionType === 'resendInvite' && 'Resend Invite'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
