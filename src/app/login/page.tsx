
"use client";

import { LoginForm } from "@/components/features/auth/LoginForm";
import { Logo } from "@/components/global/Logo";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Copy } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation"; 

const demoCredentials: { accountType: string; email: string; password: string }[] = [
  { accountType: "Doctor Account", email: "doctor@physiopro.app", password: "Password123!" },
  { accountType: "Patient Account", email: "patient@physiopro.app", password: "Password123!" },
  { accountType: "Admin Account", email: "admin@physiopro.app", password: "Password123!" },
];

function LoginPageContent() {
  const [defaultEmail, setDefaultEmail] = useState<string | undefined>(undefined);
  const [defaultPassword, setDefaultPassword] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const router = useRouter();

  const handleDemoCredentialClick = (email: string, pass: string) => {
    setDefaultEmail(email);
    setDefaultPassword(pass);
    toast({
      title: "Credentials Filled",
      description: `Filled login form with ${email}.`,
    });
  };

  const handleLoginSuccess = (userId: string, userName: string, userRole: string) => {
    const redirectPath = userRole.toLowerCase() === 'patient' ? '/patient/dashboard' 
                       : userRole.toLowerCase() === 'doctor' ? '/clinician/dashboard' 
                       : userRole.toLowerCase() === 'admin' ? '/admin/dashboard'
                       : '/';
    toast({ title: "Login Successful!", description: `Welcome back, ${userName}! Redirecting...`});
    router.push(redirectPath);
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <main className="w-full max-w-md space-y-8">
        <LoginForm 
          defaultEmail={defaultEmail} 
          defaultPassword={defaultPassword} 
          onLoginSuccess={handleLoginSuccess} 
        />
        <Card className="shadow-md bg-accent/10 border-accent/30">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-accent-foreground flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-accent" />
              Demo Credentials
            </CardTitle>
            <CardDescription className="text-accent-foreground/80">
              Click an account type below to auto-fill the login form.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoCredentials.map((cred) => (
              <Button
                key={cred.email}
                variant="outline"
                className="w-full justify-start text-left h-auto py-2 bg-background/70 hover:bg-background"
                onClick={() => handleDemoCredentialClick(cred.email, cred.password)}
              >
                <div className="flex flex-col">
                    <p className="font-semibold text-primary">{cred.accountType}</p>
                    <p className="text-xs"><span className="text-muted-foreground">Email:</span> {cred.email}</p>
                    <p className="text-xs"><span className="text-muted-foreground">Password:</span> {cred.password}</p>
                </div>
                <Copy className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </main>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} PhysioPro. All rights reserved.
        <div className="mt-1">
          <Link href="/terms" className="hover:text-primary">Terms</Link> | <Link href="/privacy" className="hover:text-primary">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}

