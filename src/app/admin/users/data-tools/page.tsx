
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, ShieldAlert, Users, Download, KeyRound } from "lucide-react";
import Link from "next/link";

export default function PatientDataToolsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Database className="mr-3 h-8 w-8" /> Patient Data Utilities
          </h1>
          <p className="text-muted-foreground">Tools for managing patient data with a focus on privacy and compliance.</p>
        </div>
      </div>

      <Card className="border-destructive bg-destructive/5 shadow-md">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center"><ShieldAlert className="mr-2 h-5 w-5"/>Important Considerations</CardTitle>
        </CardHeader>
        <CardContent className="text-destructive/90 space-y-2">
          <p>
            Actions taken on this page directly impact sensitive patient data. Ensure you have the necessary authorization and understanding before proceeding.
          </p>
          <p>
            All actions performed here are logged in the <Link href="/admin/audit-log" className="underline hover:text-destructive font-semibold">Audit Log</Link>.
          </p>
          <p>
            Direct modification of clinical records (e.g., patient notes, exercise progress) by administrators is generally restricted to maintain data integrity and comply with healthcare regulations. These tools are for account management and compliance purposes.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5 text-primary"/>Account Recovery Assistance</CardTitle>
            <CardDescription>Help patients or clinicians regain access to their accounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              For security reasons, direct password changes are not available. Instead, you can trigger a secure password reset process for a user.
            </p>
            <Input placeholder="Enter User Email to Send Reset Link" className="max-w-sm"/>
            <Button variant="outline" onClick={() => alert("Simulated: Password reset link would be sent.")}>Send Password Reset Link</Button>
            <p className="text-xs text-muted-foreground">
                This function is intended for verified requests only. Ensure user identity before proceeding.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><Download className="mr-2 h-5 w-5 text-primary"/>Patient Data Export (Compliance)</CardTitle>
            <CardDescription>Facilitate data portability requests (e.g., GDPR, HIPAA).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             <p className="text-sm text-muted-foreground">
              Generate an export of a patient's data. This process is logged and may require patient consent verification.
            </p>
            <Input placeholder="Enter Patient ID or Email for Export" className="max-w-sm"/>
            <Button variant="outline" onClick={() => alert("Simulated: Data export process initiated.")}>Initiate Data Export</Button>
             <p className="text-xs text-muted-foreground">
                Exports will be made available through a secure download link sent to the requesting user or admin.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

