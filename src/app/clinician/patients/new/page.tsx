
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus, Mail, Phone, CalendarDays, HomeIcon, ClipboardList, Activity } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Program, Patient } from '@/lib/types'; 
import { addPatient } from '@/app/clinician/patients/page'; 
import { initialMockTemplates } from '@/app/admin/program-templates/page';
import { addPatientNotification, addClinicianNotification } from '@/lib/data/mock-notifications';

const newPatientFormSchema = z.object({
  name: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  phone: z.string().optional().refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
    message: "Invalid phone number format (e.g., +1234567890)."
  }),
  whatsappNumber: z.string().optional().refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val), { // Added WhatsApp
    message: "Invalid WhatsApp number format (e.g., +1234567890)."
  }),
  address: z.string().optional(),
  medicalConditions: z.string().optional(), 
  initialProgramId: z.string().optional(), 
});

type NewPatientFormValues = z.infer<typeof newPatientFormSchema>;

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const currentClinicianId = "doc_current"; 

  const form = useForm<NewPatientFormValues>({
    resolver: zodResolver(newPatientFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      whatsappNumber: '', // Default for WhatsApp
      address: '',
      medicalConditions: '',
      initialProgramId: undefined,
    },
  });

  const onSubmit = async (data: NewPatientFormValues) => {
    setIsLoading(true);
    const newPatientId = `p${Date.now()}`; 
    const patientDataForStorage: Omit<Patient, 'id' | 'userId'> = {
      name: data.name,
      email: data.email,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : undefined,
      gender: data.gender,
      phone: data.phone,
      whatsappNumber: data.whatsappNumber, // Include WhatsApp
      address: data.address,
      conditions: data.medicalConditions?.split(',').map(c => c.trim()).filter(Boolean) || [],
      currentProgramId: data.initialProgramId,
      assignedClinicianId: currentClinicianId, 
    };
    
    addPatient(patientDataForStorage);
    
    addPatientNotification(newPatientId, {
      title: "Welcome to PhysioPro!",
      description: `Your clinician has created an account for you. You can now access your patient portal.`,
      type: "success",
      link: "/patient/dashboard",
    });

    addClinicianNotification(currentClinicianId, {
        title: "New Patient Added",
        description: `${data.name} has been added to your patient roster.`,
        type: "info",
        link: `/clinician/patients/${newPatientId}`, 
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Patient Added & Notified',
      description: `${data.name} has been added. Notifications sent.`,
    });
    setIsLoading(false);
    router.push('/clinician/patients'); 
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
      </Button>
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <UserPlus className="mr-3 h-7 w-7" /> Add New Patient
          </CardTitle>
          <CardDescription>Enter the details for the new patient account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Patient's full name" {...field} /></FormControl>
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
                      <FormControl><Input type="email" placeholder="patient@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl><Input placeholder="+1234567890" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number (Optional)</FormLabel>
                      <FormControl><Input placeholder="+1234567890" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (Optional)</FormLabel>
                      <FormControl><Input placeholder="123 Main St, Anytown" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="medicalConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Medical Conditions / Primary Complaint (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Post ACL reconstruction, Chronic Low Back Pain (comma-separated)" {...field} rows={3} /></FormControl>
                    <FormDescription>Comma-separated list of primary conditions or complaints.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initialProgramId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Initial Program Template (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {initialMockTemplates.filter(t => t.status === 'active' || t.status === 'template').map(template => (
                          <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>You can assign or build a custom program later.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/clinician/patients')} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding Patient...' : 'Add Patient & Send Invite'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
