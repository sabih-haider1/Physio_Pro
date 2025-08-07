
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, KeyRound, Save, ShieldCheck, Briefcase, CreditCard, DollarSign, ArrowRight, Settings, MessageSquareWarning, HelpCircle, Send } from 'lucide-react'; 
import { Separator } from '@/components/ui/separator';
import type { AdminUser, PricingPlan, SupportTicket } from '@/lib/types';
import { mockPlans } from '@/app/admin/billing/page';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { addMockTicket } from '@/app/admin/support/tickets/page';
import { useRouter } from 'next/navigation'; // Import useRouter

// Mock current clinician user data - in a real app, this would come from session/auth context
const currentClinician: AdminUser = {
  id: 'doc_current',
  name: 'Dr. Clinician',
  email: 'dr.clinician@physiopro.app',
  role: 'Physiotherapist',
  status: 'active',
  joinedDate: '2023-05-01',
  specialization: 'Sports Injury Rehabilitation',
  whatsappNumber: '+12345678900',
  currentPlanId: 'plan_pro_monthly',
  subscriptionStatus: 'active',
  avatarUrl: 'https://placehold.co/100x100.png?text=C'
};

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  specialization: z.string().optional(),
  whatsappNumber: z.string().optional().refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
    message: "Invalid WhatsApp number format (e.g., +1234567890)."
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." })
    .regex(/[a-z]/, { message: "Password must contain a lowercase letter." })
    .regex(/[A-Z]/, { message: "Password must contain an uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain a number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain a special character." }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});

const supportTicketFormSchema = z.object({
  subject: z.string().min(5, {message: "Subject must be at least 5 characters."}).max(100, {message: "Subject cannot exceed 100 characters."}),
  description: z.string().min(20, {message: "Description must be at least 20 characters."}).max(1000, {message: "Description cannot exceed 1000 characters."}),
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type SupportTicketFormValues = z.infer<typeof supportTicketFormSchema>;

export default function ClinicianSettingsPage() {
  const { toast } = useToast();
  const router = useRouter(); // Initialize router
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentClinician.name,
      email: currentClinician.email,
      specialization: currentClinician.specialization || '',
      whatsappNumber: currentClinician.whatsappNumber || '',
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
    console.log('Updating clinician profile (simulated):', data);
    setTimeout(() => {
      toast({ title: 'Profile Updated (Simulated)', description: 'Your profile information has been saved.' });
      setIsSavingProfile(false);
    }, 1000);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    console.log('Changing clinician password (simulated).');
    setTimeout(() => {
      toast({ title: 'Password Changed (Simulated)', description: 'Your password has been successfully updated.' });
      passwordForm.reset();
      setIsChangingPassword(false);
    }, 1500);
  };

  const onTicketSubmit = (data: SupportTicketFormValues) => {
    setIsSubmittingTicket(true);
    const newTicketData = {
        userId: currentClinician.id,
        userName: currentClinician.name,
        userEmail: currentClinician.email,
        subject: data.subject,
        description: data.description,
    };
    addMockTicket(newTicketData as Omit<SupportTicket, 'id' | 'createdAt' | 'status' | 'priority'>);
    console.log('Submitting support ticket (simulated):', newTicketData);
    setTimeout(() => {
      toast({ title: 'Support Ticket Submitted (Simulated)', description: 'Your ticket has been received. We will get back to you shortly.'});
      ticketForm.reset();
      setIsSubmittingTicket(false);
    }, 1000);
  };

  const handlePlanSelection = (plan: PricingPlan) => {
    if (plan.id === currentClinician.currentPlanId && currentClinician.subscriptionStatus === 'active') {
        toast({ title: "Already Subscribed", description: `You are already on the ${plan.name} plan.`});
        return;
    }
    // Instead of direct upgrade, redirect to manual payment page
    router.push(`/clinician/subscription/manual-payment?planId=${plan.id}&planName=${encodeURIComponent(plan.name)}&planPrice=${encodeURIComponent(plan.price + (plan.frequency || ''))}`);
  };

  const currentPlanDetails = mockPlans.find(p => p.id === currentClinician.currentPlanId);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <Settings className="mr-3 h-8 w-8" /> Clinician Settings & Profile
        </h1>
        <p className="text-muted-foreground">Manage your professional profile, account security, and subscription.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary"/>Profile Information</CardTitle>
          <CardDescription>Update your professional details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="your.email@example.com" {...field} readOnly className="bg-muted/50 cursor-not-allowed"/></FormControl>
                       <FormDescription className="text-xs">Email address cannot be changed.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl><Input placeholder="e.g., Sports Physiotherapy" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
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
              <Button type="submit" disabled={isSavingProfile} className="sm:w-auto">
                {isSavingProfile ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><KeyRound className="mr-2 h-5 w-5 text-primary"/>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (<FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" placeholder="Enter current password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" placeholder="Enter new password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={passwordForm.control} name="confirmNewPassword" render={({ field }) => (<FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" placeholder="Confirm new password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" variant="secondary" disabled={isChangingPassword} className="sm:w-auto">
                {isChangingPassword ? <KeyRound className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Change Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary"/>Subscription Management</CardTitle>
          <CardDescription>View your current plan and explore upgrade options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {currentPlanDetails ? (
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg text-primary">Your Current Plan: {currentPlanDetails.name}</CardTitle>
                        <CardDescription>{currentPlanDetails.price}{currentPlanDetails.frequency} - {currentPlanDetails.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm list-disc list-inside space-y-1">
                            {currentPlanDetails.features.map(f => <li key={f}>{f}</li>)}
                        </ul>
                        {currentClinician.subscriptionStatus && currentClinician.subscriptionStatus !== 'active' && (
                            <p className="mt-2 text-sm font-semibold capitalize text-yellow-600">Status: {currentClinician.subscriptionStatus.replace('_', ' ')}</p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <p className="text-muted-foreground">No active subscription found. Please choose a plan.</p>
            )}

            <div>
                <h4 className="font-semibold mb-3 text-lg">Available Plans:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {mockPlans.filter(plan => plan.isActive).map(plan => (
                        <Card key={plan.id} className={plan.isPopular ? "border-2 border-accent shadow-lg" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-md flex justify-between items-center">
                                    {plan.name}
                                    {plan.isPopular && <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">Popular</span>}
                                </CardTitle>
                                <CardDescription className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal">{plan.frequency}</span></CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-xs list-disc list-inside space-y-1 text-muted-foreground">
                                    {plan.features.slice(0,3).map(f => <li key={f}>{f}</li>)}
                                    {plan.features.length > 3 && <li>And more...</li>}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={plan.id === currentClinician.currentPlanId && currentClinician.subscriptionStatus === 'active' ? "outline" : (plan.isPopular ? "default" : "outline")}
                                    onClick={() => handlePlanSelection(plan)}
                                    disabled={plan.id === currentClinician.currentPlanId && currentClinician.subscriptionStatus === 'active'}
                                >
                                    {plan.id === currentClinician.currentPlanId && currentClinician.subscriptionStatus === 'active' ? "Current Plan" : (plan.ctaText === "Contact Us" ? "Contact Sales" : "Choose Plan")}
                                    {!(plan.id === currentClinician.currentPlanId && currentClinician.subscriptionStatus === 'active') && <ArrowRight className="ml-2 h-4 w-4"/>}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">Full plan details and comparisons are available on the <Link href="/#pricing" className="underline text-primary">main pricing page</Link>.</p>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary"/>Help & Support</CardTitle>
          <CardDescription>Need assistance? Submit a support ticket to our team.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...ticketForm}>
            <form onSubmit={ticketForm.handleSubmit(onTicketSubmit)} className="space-y-4">
              <FormField control={ticketForm.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="Briefly describe your issue or question" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={ticketForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Please provide detailed information about your request..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={isSubmittingTicket} className="sm:w-auto">
                {isSubmittingTicket ? <Send className="mr-2 h-4 w-4 animate-ping" /> : <Send className="mr-2 h-4 w-4" />}
                Submit Ticket
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

    </div>
  );
}
