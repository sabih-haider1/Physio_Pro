
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/global/Logo";
import { ArrowLeft, KeyRound, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address.",
      });
      return;
    }
    setIsLoading(true);
    // Simulate API call
    console.log("Password reset requested for:", email);
    setTimeout(() => {
      toast({
        title: "Password Reset Link Sent (Simulated)",
        description: `If an account exists for ${email}, a password reset link has been sent.`,
      });
      setIsLoading(false);
      // setEmail(""); // Optionally clear email field
      // router.push('/login'); // Optionally redirect to login
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
       <Button variant="ghost" onClick={() => router.push('/login')} className="absolute top-6 right-6 text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
      </Button>
      <main className="w-full max-w-md space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <KeyRound className="mx-auto h-12 w-12 text-primary mb-3" />
            <CardTitle className="text-3xl font-headline text-primary">Forgot Your Password?</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              No worries! Enter your email address below, and we'll send you a link to reset it (simulated).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full font-semibold text-lg py-6" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
                {!isLoading && <Send className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} PhysioPro. All rights reserved.
      </footer>
    </div>
  );
}

