
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
// import { useRouter } from "next/navigation"; // Not used directly if onLoginSuccess handles redirect
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // Import for Google Sign-in redirect

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

interface LoginFormProps {
  defaultEmail?: string;
  defaultPassword?: string;
  onLoginSuccess?: (userId: string, userName: string, userRole: string) => void;
}

export function LoginForm({ defaultEmail, defaultPassword, onLoginSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false); 
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: defaultEmail || "",
      password: defaultPassword || "",
    },
  });

  useEffect(() => {
    setIsClient(true);
    setCaptchaVerified(true); 
  }, []);

  useEffect(() => {
    if (defaultEmail) {
      form.setValue("email", defaultEmail, { shouldValidate: true });
    }
    if (defaultPassword) {
      form.setValue("password", defaultPassword, { shouldValidate: true });
    }
  }, [defaultEmail, defaultPassword, form]);


  function onGoogleLogin() {
    console.log("Google Login initiated");
    toast({
      title: "Google Login (Simulated)",
      description: "Attempting Google authentication...",
    });
    
    const googleName = "Google TestUser"; 
    const googleEmail = "new.google.user." + Date.now() + "@example.com"; 
    const simulatedUserId = `user_g_${Date.now()}`;
    const simulatedUserRole = "patient"; // Default role for Google sign-in for this flow

    localStorage.setItem('googleSignupName', googleName);
    localStorage.setItem('googleSignupEmail', googleEmail);
    
    // Check if onLoginSuccess is provided (for pending appointment flow)
    if (onLoginSuccess && localStorage.getItem('pendingAppointment')) {
        onLoginSuccess(simulatedUserId, googleName, simulatedUserRole);
    } else {
        // Standard Google login path (e.g. to complete profile or dashboard)
        let redirectPath = `/auth/complete-profile?name=${encodeURIComponent(googleName)}&email=${encodeURIComponent(googleEmail)}`;
        if (localStorage.getItem('pendingAppointment')) {
          redirectPath += `&pendingAppointment=true`;
        }
        router.push(redirectPath);
    }
  }

  function onSubmit(values: z.infer<typeof loginFormSchema>) {
    console.log("Login values:", values);
    toast({
      title: "Login Attempt",
      description: `Attempting to log in with email ${values.email}`,
    });

    setTimeout(() => {
      const demoDoctorEmail = "doctor@physiopro.app";
      const demoPatientEmail = "patient@physiopro.app";
      const demoAdminEmail = "admin@physiopro.app";
      const demoPassword = "Password123!";

      let isAuthenticated = false;
      let userRoleForToast = "user";
      let userNameForToast = "User";
      let userIdForToast = "temp_user_id";

      const inputEmailLowercase = values.email.toLowerCase();

      if (values.password === demoPassword) {
        if (inputEmailLowercase === demoDoctorEmail) {
          isAuthenticated = true;
          userRoleForToast = "Doctor";
          userNameForToast = "Dr. Clinician";
          userIdForToast = "doc_current";
        } else if (inputEmailLowercase === demoPatientEmail) {
          isAuthenticated = true;
          userRoleForToast = "Patient";
          userNameForToast = "Alex Patient";
          userIdForToast = "p1_current";
        } else if (inputEmailLowercase === demoAdminEmail) {
          isAuthenticated = true;
          userRoleForToast = "Admin";
          userNameForToast = "Admin User";
          userIdForToast = "admin_system";
        }
      }

      if (!isAuthenticated) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid email or password for demo accounts.",
        });
        return;
      }
      
      if (onLoginSuccess) {
        onLoginSuccess(userIdForToast, userNameForToast, userRoleForToast);
      } else {
        // Fallback to default redirect if onLoginSuccess is not provided (e.g., direct login)
        const redirectPath = userRoleForToast.toLowerCase() === 'patient' ? '/patient/dashboard' 
                       : userRoleForToast.toLowerCase() === 'doctor' ? '/clinician/dashboard'
                       : userRoleForToast.toLowerCase() === 'admin' ? '/admin/dashboard'
                       : '/';
        toast({ title: "Login Successful!", description: `Welcome back, ${userNameForToast}! Redirecting...`});
        router.push(redirectPath);
      }

    }, 1000);
  }

  if (!isClient) {
    return null; 
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">Welcome Back!</CardTitle>
        <CardDescription>Log in to your PhysioPro account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        placeholder="********"
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

            {!captchaVerified && <div className="text-sm text-center text-muted-foreground p-3 border rounded-md">Verifying you're human...</div>}

            <Button type="submit" className="w-full font-semibold" disabled={!captchaVerified}>
              Log In with Email
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          <Link href="/auth/forgot-password" className="font-medium text-primary hover:underline">
            Forgot your password?
          </Link>
        </div>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </div>
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
        <Button variant="outline" className="w-full" onClick={onGoogleLogin}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path d="M1 1h22v22H1z" fill="none" /></svg>
          Log In with Google
        </Button>
      </CardContent>
    </Card>
  );
}
