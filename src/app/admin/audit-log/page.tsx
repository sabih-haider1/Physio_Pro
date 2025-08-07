
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Search, Filter, Calendar as CalendarIcon, User as UserIcon } from "lucide-react";
import Link from "next/link";
import type { AuditLogEntry } from "@/lib/types"; 
import { useState, useEffect } from "react";
import { DateRangePicker } from "@/components/ui/daterangepicker"; 

// Mock data for Audit Log with static timestamps
export let mockAuditLogs: AuditLogEntry[] = [
  { id: 'log1', timestamp: '2024-07-28T10:30:00.000Z', adminUserId: 'adminUser1', adminUserName: 'Super Admin', action: 'Updated Exercise', targetEntityType: 'Exercise', targetEntityId: 'ex1', details: { previousName: 'Old Squat', newName: 'Standard Squat', oldCategory: 'Legs', newCategory: 'Strength' } },
  { id: 'log2', timestamp: '2024-07-28T07:30:00.000Z', adminUserId: 'adminUser2', adminUserName: 'Content Reviewer Alice', action: 'Approved Exercise', targetEntityType: 'Exercise', targetEntityId: 'ex2', details: { approvedAt: '2024-07-28T07:30:00.000Z' } },
  { id: 'log3', timestamp: '2024-07-27T12:30:00.000Z', adminUserId: 'adminUser1', adminUserName: 'Super Admin', action: 'Suspended Clinician', targetEntityType: 'User', targetEntityId: 'doc2', details: { reason: 'Policy violation', suspensionDuration: '30 days' } },
  { id: 'log4', timestamp: '2024-07-26T12:30:00.000Z', adminUserId: 'adminUser3', adminUserName: 'Finance Manager Bob', action: 'Updated Billing Plan', targetEntityType: 'BillingPlan', targetEntityId: 'plan_pro_monthly', details: { oldPrice: '$69/month', newPrice: '$79/month' } },
  { id: 'log5', timestamp: '2024-07-28T12:00:00.000Z', adminUserId: 'adminUser1', adminUserName: 'Super Admin', action: 'Created Announcement', targetEntityType: 'Announcement', targetEntityId: 'anno-new-feature', details: { title: 'New AI Feature Launched!', audience: 'clinicians' } },
  { id: 'log6', timestamp: '2024-07-27T18:45:00.000Z', adminUserId: 'adminUser2', adminUserName: 'Content Reviewer Alice', action: 'Updated Program Template', targetEntityType: 'ProgramTemplate', targetEntityId: 'tpl-shoulder-rehab', details: { exercisesAdded: 2, exercisesRemoved: 1 } },
  { id: 'log7', timestamp: new Date(Date.now() - 86400000 * 0.2).toISOString(), adminUserId: 'adminUser1', adminUserName: 'Super Admin', action: 'Invited Team Member', targetEntityType: 'TeamMember', targetEntityId: 'tm_new_invite', details: { invitedEmail: 'new.admin@physiopro.app', roleAssigned: 'Moderator' } },
  { id: 'log8', timestamp: new Date(Date.now() - 86400000 * 0.1).toISOString(), adminUserId: 'adminUser1', adminUserName: 'Super Admin', action: 'Updated Team Member', targetEntityType: 'TeamMember', targetEntityId: 'tm2', details: { memberName: 'Bob Reviewer', oldRole: 'Content Reviewer', newRole: 'Admin', oldStatus: 'active', newStatus: 'active' } },
  { id: 'log9', timestamp: new Date().toISOString(), adminUserId: 'adminUser1', adminUserName: 'Super Admin', action: 'Resent Invitation', targetEntityType: 'TeamMember', targetEntityId: 'tm3', details: { email: 'charlie.mod@physiopro.app' } },
];

export const addAuditLogEntry = (entryData: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
  const newLog: AuditLogEntry = {
    id: `log${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...entryData,
  };
  // Ensure a new array reference is created for state updates
  mockAuditLogs = [newLog, ...mockAuditLogs];
  console.log("Audit Log Entry Added (Simulated):", newLog);
};


export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [isClient, setIsClient] = useState(false);
  const [displayLogs, setDisplayLogs] = useState<AuditLogEntry[]>([]); 

  useEffect(() => {
    setIsClient(true);
    // Initialize displayLogs from mockAuditLogs on client mount
    setDisplayLogs([...mockAuditLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  // Refresh logs if the mockAuditLogs reference changes (e.g., new log added from another page)
  useEffect(() => {
    if(isClient) { // Only update if client-side
        setDisplayLogs([...mockAuditLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }
  }, [mockAuditLogs.length, isClient]); // Add isClient to dependency array


  const filteredLogs = displayLogs.filter(log => {
    const searchMatch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        log.adminUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (log.targetEntityId && log.targetEntityId.toLowerCase().includes(searchTerm.toLowerCase()));
    const userMatch = userFilter === 'all' || log.adminUserId === userFilter;
    const actionMatch = actionFilter === 'all' || log.action === actionFilter;
    return searchMatch && userMatch && actionMatch;
  });
  
  const adminUserMap = new Map<string, { id: string; name: string }>();
  mockAuditLogs.forEach(log => {
    if (log.adminUserId && log.adminUserName && !adminUserMap.has(log.adminUserId)) {
      adminUserMap.set(log.adminUserId, { id: log.adminUserId, name: log.adminUserName });
    }
  });
  const uniqueAdminUsers = Array.from(adminUserMap.values());
  const uniqueActions = Array.from(new Set(mockAuditLogs.map(log => log.action))).sort();


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <History className="mr-3 h-8 w-8" /> Audit Log
          </h1>
          <p className="text-muted-foreground">Track administrative actions and changes across the platform.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>Review a detailed history of system events and modifications.</CardDescription>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs (action, user, ID)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger><UserIcon className="mr-2 h-4 w-4 shrink-0 opacity-50"/><SelectValue placeholder="Filter by User" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueAdminUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger><Filter className="mr-2 h-4 w-4 shrink-0 opacity-50"/><SelectValue placeholder="Filter by Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                 {uniqueActions.map(action => <SelectItem key={action} value={action}>{action}</SelectItem>)}
              </SelectContent>
            </Select>
             <Button variant="outline" disabled className="w-full text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4"/> Date Range (Soon)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs">
                      {isClient ? new Date(log.timestamp).toLocaleString() : log.timestamp}
                    </TableCell>
                    <TableCell>{log.adminUserName} <span className="text-muted-foreground text-xs">({log.adminUserId})</span></TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="text-xs">
                      {log.targetEntityType && (
                        <>
                          {log.targetEntityType}: <span className="font-mono">{log.targetEntityId || 'N/A'}</span>
                        </>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {log.details && typeof log.details === 'object' ? (
                        <div className="max-w-xs text-muted-foreground group relative">
                          <div className="truncate group-hover:hidden">
                            {Object.entries(log.details).map(([key, value], index, arr) => (
                              <span key={key}>
                                {`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${String(value)}${index < arr.length - 1 ? '; ' : ''}`}
                              </span>
                            )).slice(0, 2).reduce((acc, curr, index, arr) => index < arr.length -1 ? <>{acc}{curr}</> : <>{acc}{curr}{arr.length > 2 ? '...' : ''}</>, <></>)}
                          </div>
                          <div className="hidden group-hover:block absolute left-0 top-full z-10 mt-1 p-2 bg-popover shadow-md rounded-md border w-max max-w-md">
                            {Object.entries(log.details).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: </span>
                                {String(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : log.details ? (
                        String(log.details)
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Audit Logs Found</h3>
              <p>No logs match your current filters, or no administrative actions have been recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
