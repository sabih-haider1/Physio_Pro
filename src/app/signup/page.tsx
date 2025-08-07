
"use client"; 

import { Suspense, useEffect, useState } from 'react'; 
import { useSearchParams, useRouter } from "next/navigation";
import { SignupForm } from "@/components/features/auth/SignupForm";
import { Logo } from "@/components/global/Logo";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import type { AdminUser } from '@/lib/types';
import { addMockClinician } from '@/app/admin/users/page'; // Import function to add clinician

function SignupPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const planId = searchParams.get('plan');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignupSuccess = (userId: string, userName: string, userEmail: string, userRole: string) => {
    // Add the newly signed-up clinician to the mock data
    // Assuming 'userId' from SignupForm is the new clinician's ID, and other details are passed.
    // The addMockClinician function expects Omit<AdminUser, 'id' | 'joinedDate' | ...>
    // We need to map the SignupForm output to this.
    
    // Find the role from values, which should be ProfessionalRole
    // For now, use a placeholder or ensure role is passed from SignupForm correctly
    const newClinicianData: Omit<AdminUser, 'id' | 'joinedDate' | 'patientCount' | 'appointmentCount' | 'avatarUrl'> = {
        name: userName,
        email: userEmail,
        role: userRole as AdminUser['role'], // Ensure this role is valid for AdminUser
        status: 'pending', // Default status for new signups
        currentPlanId: planId || undefined, // Assign planId if available
        subscriptionStatus: planId ? 'trial' : 'none', // Example logic
    };
    addMockClinician(newClinicianData);
    
    toast({ title: "Account Created!", description: `Clinician account for ${userName} created. Redirecting to login...`});
    router.push('/login'); // Redirect to general login, or role-specific if desired
  };


  if (!isClient) { // Prevent premature rendering before searchParams are available
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="absolute top-6 left-6">
         <Logo />
      </div>
      <main className="w-full max-w-md">
        <SignupForm 
          planId={planId || undefined} 
          onSignupSuccess={(userId, userName, email, role) => handleSignupSuccess(userId, userName, email, role)} 
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


export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading page content...</div>}> 
      <SignupPageContent />
    </Suspense>
  );
}
