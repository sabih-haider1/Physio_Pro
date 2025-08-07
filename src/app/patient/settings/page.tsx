
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, KeyRound, Save, HelpCircle, Send, ShieldCheck } from 'lucide-react';
import type { SupportTicket } from '@/lib/types';
import { addMockTicket } from '@/app/admin/support/tickets/page';

// Mock current patient user data
const currentPatient = {
  id: 'p1_current', // A unique ID for the current patient
  name: 'Patient Name',
  email: 'patient@example.com',
};

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(), // Email might be read-only
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." })
    .regex(/[a-z]/, "Lowercase letter")
    .regex(/[A-Z]/, "Uppercase letter")
    .regex(/[0-9]/, "Number")
    .regex(/[^a-zA-Z0-9]/, "Special character"),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});

const supportTicketFormSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters.").max(100, "Subject too long."),
  description: z.string().min(20, "Description must be at least 20 characters.").max(1000, "Description too long."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type SupportTicketFormValues = z.infer<typeof supportTicketFormSchema>;

export default function PatientSettingsPage() {
  const { toast } = useToast();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentPatient.name,
      email: currentPatient.email,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const ticketForm = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketFormSchema),
    defaultValues: { subject: '', description: '' },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    setIsSavingProfile(true);
    console.log('Updating patient profile (simulated):', data);
    setTimeout(() => {
      toast({ title: 'Profile Updated (Simulated)', description: 'Your profile information has been saved.' });
      setIsSavingProfile(false);
    }, 1000);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    console.log('Changing patient password (simulated).');
    setTimeout(() => {
      toast({ title: 'Password Changed (Simulated)', description: 'Your password has been successfully updated.' });
      passwordForm.reset();
      setIsChangingPassword(false);
    }, 1500);
  };

  const onTicketSubmit = (data: SupportTicketFormValues) => {
    setIsSubmittingTicket(true);
    const newTicketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status' | 'priority'> = {
        userId: currentPatient.id,
        userName: profileForm.getValues('name') || currentPatient.name, // Use current name from form if available
        userEmail: profileForm.getValues('email') || currentPatient.email,
        subject: data.subject,
        description: data.description,
    };
    addMockTicket(newTicketData); // Add to shared mock array
    console.log('Submitting patient support ticket (simulated):', newTicketData);
    setTimeout(() => {
      toast({ title: 'Support Ticket Submitted (Simulated)', description: 'Your ticket has been received.'});
      ticketForm.reset();
      setIsSubmittingTicket(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <UserCircle className="mr-3 h-8 w-8" /> Patient Settings
        </h1>
        <p className="text-muted-foreground">Manage your account details and preferences.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField control={profileForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={profileForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="your.email@example.com" {...field} readOnly className="bg-muted/50 cursor-not-allowed"/></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (<FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={passwordForm.control} name="confirmNewPassword" render={({ field }) => (<FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" variant="secondary" disabled={isChangingPassword}>
                {isChangingPassword ? <KeyRound className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />} Change Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary"/>Submit a Support Ticket</CardTitle>
          <CardDescription>Need help? Let us know.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...ticketForm}>
            <form onSubmit={ticketForm.handleSubmit(onTicketSubmit)} className="space-y-4">
              <FormField control={ticketForm.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="e.g., Issue with exercise video" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={ticketForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Please describe your issue in detail..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={isSubmittingTicket}>
                {isSubmittingTicket ? <Send className="mr-2 h-4 w-4 animate-ping" /> : <Send className="mr-2 h-4 w-4" />} Submit Ticket
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
       <Card className="shadow-sm bg-blue-50 border-blue-200">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-700 flex items-center"><ShieldCheck className="mr-2 h-5 w-5"/>Privacy Note</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-blue-600">
                Your information is handled with care. For details, please review our Privacy Policy.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
