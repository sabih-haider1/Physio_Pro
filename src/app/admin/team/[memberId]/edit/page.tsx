
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCog, Briefcase, ActivityIcon } from 'lucide-react';
import { internalAdminRoles, type SystemRole, type UserStatus, type TeamMember } from '@/lib/types';
import { initialMockTeamMembers, updateMockTeamMember } from '@/app/admin/team/page'; 
import { addAuditLogEntry } from '@/app/admin/audit-log/page';

const teamMemberStatuses: UserStatus[] = ['active', 'inactive', 'suspended', 'pending_invitation'];

const editTeamMemberFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }), 
  role: z.enum(internalAdminRoles as [SystemRole, ...SystemRole[]], { required_error: "Role is required." }),
  status: z.enum(teamMemberStatuses as [UserStatus, ...UserStatus[]], { required_error: "Status is required." }),
});

type EditTeamMemberFormValues = z.infer<typeof editTeamMemberFormSchema>;

export default function EditTeamMemberPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const memberId = params.memberId as string;

  const [isLoadingForm, setIsLoadingForm] = useState(true); // For initial form loading
  const [isSubmitting, setIsSubmitting] = useState(false); // For submission loading state
  const [teamMember, setTeamMember] = useState<EditTeamMemberFormValues | null>(null); 

  const form = useForm<EditTeamMemberFormValues>({
    resolver: zodResolver(editTeamMemberFormSchema),
    defaultValues: { name: '', email: '', role: undefined, status: undefined },
  });

  useEffect(() => {
    if (memberId) {
      setIsLoadingForm(true);
      const fetchedMember = initialMockTeamMembers.find(m => m.id === memberId);
      if (fetchedMember) {
        const formData: EditTeamMemberFormValues = {
          name: fetchedMember.name,
          email: fetchedMember.email,
          role: fetchedMember.role,
          status: fetchedMember.status,
        };
        setTeamMember(formData); 
        form.reset(formData); 
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Team member not found.' });
        router.push('/admin/team');
      }
      setIsLoadingForm(false);
    } else {
      router.push('/admin/team'); 
    }
  }, [memberId, form, router, toast]);

  const onSubmit = (data: EditTeamMemberFormValues) => {
    setIsSubmitting(true);
    
    const existingMember = initialMockTeamMembers.find(m => m.id === memberId);
    if (existingMember) {
        const updatedMemberData: TeamMember = {
            ...existingMember, 
            ...data, 
        };
        updateMockTeamMember(updatedMemberData); 

        let changes: Record<string, any> = {};
        if (existingMember.role !== updatedMemberData.role) {
            changes.oldRole = existingMember.role;
            changes.newRole = updatedMemberData.role;
        }
        if (existingMember.status !== updatedMemberData.status) {
            changes.oldStatus = existingMember.status;
            changes.newStatus = updatedMemberData.status;
        }
        if (Object.keys(changes).length > 0) {
            addAuditLogEntry({
                adminUserId: 'adminUser1', // Placeholder, replace with actual admin ID
                adminUserName: 'Super Admin', // Placeholder
                action: 'Updated Team Member Role/Status',
                targetEntityType: 'TeamMember',
                targetEntityId: memberId,
                details: { memberName: updatedMemberData.name, ...changes }
            });
        }
    }

    setTimeout(() => {
      toast({
        title: 'Team Member Updated',
        description: `Changes for ${data.name} have been saved.`,
      });
      setIsSubmitting(false);
      router.push('/admin/team'); 
    }, 1000);
  };

  if (isLoadingForm && !teamMember) { 
    return <div className="flex justify-center items-center h-64">Loading team member data...</div>;
  }

  if (!teamMember && !isLoadingForm) { 
    return <div className="text-center py-10">Team member not found.</div>;
  }
  
  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team List
      </Button>
      <Card className="max-w-xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <UserCog className="mr-3 h-7 w-7" /> Edit Team Member: {teamMember?.name || 'Loading...'}
          </CardTitle>
          <CardDescription>Modify the role and status for this team member.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Member's full name" {...field} readOnly className="bg-muted/50 cursor-not-allowed" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="member@example.com" {...field} readOnly className="bg-muted/50 cursor-not-allowed"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                     <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {internalAdminRoles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <div className="relative">
                        <ActivityIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {teamMemberStatuses.map(status => (
                            <SelectItem key={status} value={status} className="capitalize">{status.replace('_',' ')}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/team')} disabled={isSubmitting || form.formState.isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>
                  {isSubmitting || form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
