
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, KeyRound, Save, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock current admin user data - in a real app, this would come from session/auth context
const currentAdminUser = {
  fullName: 'Administrator Prime',
  email: 'admin@physiopro.app',
};

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }), // Basic check for demo
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

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function AdminProfilePage() {
  const { toast } = useToast();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: currentAdminUser.fullName,
      email: currentAdminUser.email,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    setIsSavingProfile(true);
    console.log('Updating profile (simulated):', data);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Profile Updated (Simulated)',
        description: 'Your profile information has been saved.',
      });
      setIsSavingProfile(false);
    }, 1000);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    console.log('Changing password (simulated). Current pass (for demo):', data.currentPassword);
    // Simulate API call
    setTimeout(() => {
      // Add mock logic for current password validation if desired for demo
      // For now, assume success
      toast({
        title: 'Password Changed (Simulated)',
        description: 'Your password has been successfully updated.',
      });
      passwordForm.reset(); // Clear password fields
      setIsChangingPassword(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <UserCircle className="mr-3 h-8 w-8" /> Admin Profile
        </h1>
        <p className="text-muted-foreground">Manage your personal administrator account details.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Profile Information</CardTitle>
          <CardDescription>Update your name and email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSavingProfile} className="w-full sm:w-auto">
                {isSavingProfile ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Change Password</CardTitle>
          <CardDescription>Update your account password. Choose a strong, unique password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="secondary" disabled={isChangingPassword} className="w-full sm:w-auto">
                {isChangingPassword ? <KeyRound className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Change Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm bg-blue-50 border-blue-200">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-700 flex items-center"><ShieldCheck className="mr-2 h-5 w-5"/>Security Tip</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-blue-600">
                For enhanced security, use a unique password for your administrator account and enable two-factor authentication if available in future updates.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
