
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCog, Info, Briefcase, MapPin } from 'lucide-react'; // Added MapPin
import Link from 'next/link';
import { allUserRoles, professionalRoles } from '@/lib/types'; 
import type { AdminUser, UserRole, UserStatus, ProfessionalRole } from '@/lib/types'; 
import { initialMockUsers, updateMockUser } from '@/app/admin/users/page'; 

const userStatuses: UserStatus[] = ['active', 'inactive', 'pending', 'suspended'];


const editUserFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(allUserRoles as [UserRole, ...UserRole[]], { required_error: "Role is required." }),
  status: z.enum(userStatuses as [UserStatus, ...UserStatus[]], { required_error: "Status is required." }),
  whatsappNumber: z.string().optional().refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
    message: "Invalid WhatsApp number format (e.g., +1234567890)."
  }),
  specialization: z.string().optional(),
  city: z.string().optional(), // Added city field
});

type EditUserFormValues = z.infer<typeof editUserFormSchema>;

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const userId = params.userId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<EditUserFormValues | null>(null); 
  const [isProfessional, setIsProfessional] = useState(false);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: undefined, 
      status: undefined, 
      whatsappNumber: '',
      specialization: '',
      city: '', // Default city
    },
  });

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      const fetchedUser = initialMockUsers.find(u => u.id === userId); 
      if (fetchedUser) {
        const formData: EditUserFormValues = {
          name: fetchedUser.name,
          email: fetchedUser.email,
          role: fetchedUser.role,
          status: fetchedUser.status,
          whatsappNumber: fetchedUser.whatsappNumber || '',
          specialization: fetchedUser.specialization || '',
          city: fetchedUser.city || '', // Populate city
        };
        setUser(formData); 
        setIsProfessional(professionalRoles.includes(fetchedUser.role as ProfessionalRole));
        form.reset(formData); 
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'User not found.' });
        router.push('/admin/users');
      }
      setIsLoading(false);
    } else {
      router.push('/admin/users'); 
    }
  }, [userId, form, router, toast]);

  const onSubmit = (data: EditUserFormValues) => {
    setIsLoading(true);
    
    const existingUser = initialMockUsers.find(u => u.id === userId);
    if (existingUser) {
        const updatedUserData: AdminUser = {
            ...existingUser, 
            ...data, 
        };
        updateMockUser(updatedUserData); 
    }

    setTimeout(() => {
      toast({
        title: 'User Updated',
        description: `Changes for ${data.name} have been saved.`,
      });
      setIsLoading(false);
      router.push('/admin/users'); 
    }, 1000);
  };

  if (isLoading && !user) { 
    return <div className="flex justify-center items-center h-64">Loading user data...</div>;
  }

  if (!user && !isLoading) { 
    return <div className="text-center py-10">User not found or failed to load.</div>;
  }
  
  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <UserCog className="mr-3 h-7 w-7" /> Edit User: {user?.name || 'Loading...'}
          </CardTitle>
          <CardDescription>
            Modify the details for this user account.
          </CardDescription>
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
                      <Input placeholder="User's full name" {...field} />
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
                      <Input type="email" placeholder="user@example.com" {...field} readOnly className="bg-muted/50 cursor-not-allowed" />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                            onValueChange={(value) => {
                                field.onChange(value);
                                setIsProfessional(professionalRoles.includes(value as ProfessionalRole));
                            }} 
                            value={field.value}
                        >
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select user role" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {professionalRoles.map(role => ( 
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {isProfessional && (
                    <FormField
                        control={form.control}
                        name="specialization"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Specialization</FormLabel>
                            <FormControl><Input placeholder="e.g., Sports Injury Rehab" {...field} value={field.value || ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userStatuses.map(status => (
                            <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <FormControl>
                          <Input placeholder="e.g., Karachi" {...field} value={field.value || ''} className="pl-10"/>
                          </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {isProfessional && ( 
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/users')} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
