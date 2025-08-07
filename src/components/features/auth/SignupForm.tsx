
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Eye, EyeOff, KeyRound, Mail, User, UserCheck, Briefcase, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { professionalRoles, type ProfessionalRole } from "@/lib/types"; // Import ProfessionalRole type
import { mockPlans } from '@/app/admin/billing/page'; 

const signupFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
  confirmPassword: z.string(),
  role: z.enum(professionalRoles as [ProfessionalRole, ...ProfessionalRole[]], { // Use imported ProfessionalRole type
    required_error: "You need to select your profession.",
  }),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions.",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

interface SignupFormProps {
  planId?: string;
  onSignupSuccess?: (userId: string, userName: string, email: string, role: string) => void; // Added email and role to callback
}

export function SignupForm({ planId, onSignupSuccess }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPlanName, setSelectedPlanName] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setCaptchaVerified(true); 
    if (planId) {
      const plan = mockPlans.find(p => p.id === planId);
      setSelectedPlanName(plan ? plan.name : null);
    }
  }, [planId]);

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      terms: false,
    },
  });

  function onSubmit(values: z.infer<typeof signupFormSchema>) {
    console.log("Signup values:", values, "Selected Plan ID:", planId);
    toast({
      title: "Signup Attempt",
      description: `Creating account for ${values.email} as ${values.role}. ${planId ? `Plan: ${selectedPlanName || planId}` : ''}`,
    });
    
    setTimeout(() => {
      const simulatedUserId = `user_${Date.now()}`; 
      if (onSignupSuccess) {
        onSignupSuccess(simulatedUserId, values.fullName, values.email, values.role); // Pass email and role
      } else {
        toast({
          title: "Account Created (Simulated)",
          description: "Redirecting to login...",
        });
        router.push('/login');
      }
    }, 1000);
  }

  function onGoogleSignup() {
    console.log("Clinician Google Signup initiated. Plan ID:", planId);
    toast({
      title: "Google Sign-Up (Simulated)",
      description: "Redirecting for Google authentication...",
    });
    
    const googleName = "Google User"; 
    const googleEmail = "google.user." + Date.now() + "@example.com"; 

    if (typeof window !== 'undefined') {
      localStorage.setItem('googleSignupName', googleName);
      localStorage.setItem('googleSignupEmail', googleEmail);
      if (planId) localStorage.setItem('googleSignupPlanId', planId);
    }
    
    let redirectUrl = `/auth/complete-profile?name=${encodeURIComponent(googleName)}&email=${encodeURIComponent(googleEmail)}`;
    if (planId) {
      redirectUrl += `&planId=${planId}`;
    }
        
    setTimeout(() => {
      router.push(redirectUrl);
    }, 1500);
  }

  if (!isClient) {
    return null;
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">Create a Clinician Account</CardTitle>
        <CardDescription>Join PhysioPro and start transforming rehabilitation.</CardDescription>
        {selectedPlanName && (
          <div className="mt-2 p-2 bg-accent/20 border border-accent/50 rounded-md text-sm text-accent-foreground flex items-center">
            <ListChecks className="mr-2 h-4 w-4 text-accent" />
            You're signing up for the <strong>{selectedPlanName}</strong> plan.
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                   <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="Your full name" {...field} className="pl-10" />
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
                      <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                   <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        {...field}
                        className="pl-10 pr-10"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                     <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...field}
                        className="pl-10 pr-10"
                      />
                    </FormControl>
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                    </Button>
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
                  <FormLabel>My Profession</FormLabel> 
                   <div className="relative">
                     <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select your profession" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionalRoles.map(profRole => (
                          <SelectItem key={profRole} value={profRole}>{profRole}</SelectItem>
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
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Accept terms and conditions
                    </FormLabel>
                    <FormMessage />
                     <p className="text-xs text-muted-foreground">
                      By signing up, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {!captchaVerified && <div className="text-sm text-center text-muted-foreground p-3 border rounded-md">Verifying you're human...</div>}

            <Button type="submit" className="w-full font-semibold" disabled={!captchaVerified}>
              Sign Up with Email
            </Button>
          </form>
        </Form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={onGoogleSignup}>
           <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path d="M1 1h22v22H1z" fill="none" /></svg>
          Sign Up with Google
        </Button>
        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
