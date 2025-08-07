
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PatientBookAppointmentPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <CardTitle className="text-2xl font-headline text-primary">Feature Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-md">
            The patient self-appointment booking feature is currently unavailable.
            Your clinician will schedule appointments for you.
            Please contact your clinic directly if you need to make changes. We apologize for any inconvenience.
          </CardDescription>
          <Button asChild className="mt-6">
            <Link href="/patient/dashboard">Go to Dashboard</Link>
          </Button>
           <Button variant="link" asChild className="mt-2">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
