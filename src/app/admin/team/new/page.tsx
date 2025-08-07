
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus, Mail, Briefcase } from 'lucide-react';
import { internalAdminRoles, type SystemRole, type TeamMember } from '@/lib/types'; 
import { addMockTeamMember } from '@/app/admin/team/page'; 

const newTeamMemberFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }), 
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(internalAdminRoles as [SystemRole, ...SystemRole[]], { 
    required_error: "Role is required." 
  }),
});

type NewTeamMemberFormValues = z.infer<typeof newTeamMemberFormSchema>;

export default function NewTeamMemberPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NewTeamMemberFormValues>({
    resolver: zodResolver(newTeamMemberFormSchema),
    defaultValues: {
      name: '', 
      email: '',
      role: undefined,
    },
  });

  const onSubmit = async (data: NewTeamMemberFormValues) => {
    setIsLoading(true);
    
    const currentAdminPlaceholder = { id: 'adminUser1', name: 'Super Admin' }; 

    const teamMemberDataForStorage: Omit<TeamMember, 'id' | 'joinedDate' | 'status' | 'avatarUrl' | 'lastLogin' | 'lastInvitationSentAt'> = {
      name: data.name,
      email: data.email,
      role: data.role,
      invitedByAdminId: currentAdminPlaceholder.id,
      invitedByAdminName: currentAdminPlaceholder.name,
    };

    addMockTeamMember(teamMemberDataForStorage); 
        
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Invitation Sent (Simulated)',
      description: `An invitation has been sent to ${data.email} for ${data.name} for the role of ${data.role}.`,
    });
    setIsLoading(false);
    router.push('/admin/team'); 
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team List
      </Button>
      <Card className="max-w-xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <UserPlus className="mr-3 h-7 w-7" /> Add New Team Member
          </CardTitle>
          <CardDescription>Invite a new member to your administrative team by specifying their email and role.</CardDescription>
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
                    <div className="relative">
                        <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                        <Input placeholder="New member's full name" {...field} className="pl-10"/>
                        </FormControl>
                    </div>
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
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                        <Input type="email" placeholder="member@example.com" {...field} className="pl-10"/>
                        </FormControl>
                    </div>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select role for the new member" />
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
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/team')} disabled={isLoading || form.formState.isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || form.formState.isSubmitting}>
                  {isLoading || form.formState.isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
