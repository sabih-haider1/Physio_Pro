
"use client"; 

import { Suspense, useEffect, useState } from 'react'; 
import { useSearchParams, useRouter } from "next/navigation";
import { PatientSignupForm } from "@/components/features/auth/PatientSignupForm";
import { Logo } from "@/components/global/Logo";
import Link from "next/link";
import type { Patient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addPatient, mockPatientsData } from '@/app/clinician/patients/page';
import { addPatientNotification } from '@/lib/data/mock-notifications';


function PatientSignupPageContent() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignupSuccess = (userId: string, userName: string, userEmail: string, userWhatsapp?: string) => {
    const newPatientData: Omit<Patient, 'id' | 'userId'> = {
        name: userName,
        email: userEmail,
        whatsappNumber: userWhatsapp,
        conditions: [], 
        assignedClinicianId: undefined, 
    };
    addPatient(newPatientData); 

    const newlyAddedPatient = mockPatientsData.find(p => p.email === userEmail && p.name === userName);
    const actualUserId = newlyAddedPatient ? newlyAddedPatient.id : userId;


    addPatientNotification(actualUserId, {
      title: "Welcome to PhysioPro!",
      description: `Your account has been created. You can now access your patient portal.`,
      type: "success",
      link: "/patient/dashboard",
    });
        
    toast({ title: "Account Created!", description: `Welcome, ${userName}! Please log in to access your portal.`, duration: 7000});
    router.push('/login?role=patient'); 
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="absolute top-6 left-6">
         <Logo />
      </div>
      <main className="w-full max-w-md">
        <PatientSignupForm 
          onSignupSuccess={handleSignupSuccess} 
        />
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


export default function PatientSignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}> 
      <PatientSignupPageContent />
    </Suspense>
  );
}

