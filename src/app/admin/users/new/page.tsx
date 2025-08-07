
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
import { ArrowLeft, UserPlus, Mail, Briefcase, Phone, ShieldCheck, MapPin } from 'lucide-react';
import { professionalRoles, type ProfessionalRole, type UserStatus, type AdminUser } from '@/lib/types';
import { addMockClinician } from '@/app/admin/users/page'; 
import { addClinicianNotification } from '@/lib/data/mock-notifications';

const userStatuses: UserStatus[] = ['active', 'pending', 'inactive']; 

const newClinicianFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(professionalRoles as [ProfessionalRole, ...ProfessionalRole[]], { 
    required_error: "Clinician role is required." 
  }),
  status: z.enum(userStatuses as [UserStatus, ...UserStatus[]], { 
    required_error: "Status is required." 
  }),
  whatsappNumber: z.string().optional().refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
    message: "Invalid WhatsApp number format (e.g., +1234567890)."
  }),
  specialization: z.string().optional(),
  city: z.string().optional(), // Added city field
});

type NewClinicianFormValues = z.infer<typeof newClinicianFormSchema>;

export default function NewClinicianPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NewClinicianFormValues>({
    resolver: zodResolver(newClinicianFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: undefined,
      status: 'pending', 
      whatsappNumber: '',
      specialization: '',
      city: '', // Default city
    },
  });

  const onSubmit = async (data: NewClinicianFormValues) => {
    setIsLoading(true);
    
    const newClinicianId = `doc${Date.now()}`; 
    const clinicianDataForStorage: Omit<AdminUser, 'id' | 'joinedDate' | 'patientCount' | 'appointmentCount' | 'avatarUrl'> = {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        whatsappNumber: data.whatsappNumber,
        specialization: data.specialization,
        city: data.city, // Include city
    };

    addMockClinician(clinicianDataForStorage); 
    
    if (data.status === 'active' || data.status === 'pending') {
      addClinicianNotification(newClinicianId, { 
        title: "Your PhysioPro Account is Ready!",
        description: `Welcome, ${data.name}! Your account has been created with ${data.status} status.`,
        type: "success",
        link: "/clinician/dashboard", 
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Clinician Added',
      description: `${data.name} has been added. An invitation/welcome email would be sent.`,
    });
    setIsLoading(false);
    router.push('/admin/users'); 
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clinician List
      </Button>
      <Card className="max-w-xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <UserPlus className="mr-3 h-7 w-7" /> Add New Clinician
          </CardTitle>
          <CardDescription>Enter the details for the new clinician account.</CardDescription>
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
                        <Input placeholder="Clinician's full name" {...field} className="pl-10"/>
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
                        <Input type="email" placeholder="clinician@example.com" {...field} className="pl-10"/>
                        </FormControl>
                    </div>
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
                        <FormLabel>Profession / Role</FormLabel>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select clinician's profession" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {professionalRoles.map(role => (
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
                    name="specialization"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Specialization (Optional)</FormLabel>
                        <FormControl><Input placeholder="e.g., Sports Injury" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Status</FormLabel>
                       <div className="relative">
                          <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                              <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Set initial account status" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              {userStatuses.map(status => (
                              <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City (Optional)</FormLabel>
                      <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <FormControl>
                          <Input placeholder="e.g., Karachi, Lahore" {...field} value={field.value || ''} className="pl-10"/>
                          </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number (Optional)</FormLabel>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                        <Input placeholder="+1234567890" {...field} className="pl-10"/>
                        </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/users')} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding Clinician...' : 'Add Clinician & Send Invite'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
