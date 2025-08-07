
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, UserCircle, CheckCircle } from 'lucide-react';
import { professionalRoles, type ProfessionalRole, type Patient } from '@/lib/types';
import { mockPlans } from '@/app/admin/billing/page'; 
import { addMockClinician } from '@/app/admin/users/page'; 
import { addPatient, mockPatientsData } from '@/app/clinician/patients/page';
import Link from 'next/link';
import { addPatientNotification } from '@/lib/data/mock-notifications';


const completeProfileSchemaClinician = z.object({
  profession: z.enum(professionalRoles as [ProfessionalRole, ...ProfessionalRole[]], {
    required_error: "Please select your profession.",
  }),
});

type CompleteProfileFormValuesClinician = z.infer<typeof completeProfileSchemaClinician>;

function CompleteProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [planId, setPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPatientFlow, setIsPatientFlow] = useState(false); 

  useEffect(() => {
    let queryName = searchParams.get('name');
    let queryEmail = searchParams.get('email');
    let queryPlanId = searchParams.get('planId');
    
    // Determine if it's a patient flow (no planId) or clinician flow (has planId)
    setIsPatientFlow(!queryPlanId); 

    if (typeof window !== 'undefined') {
        if (!queryName) queryName = localStorage.getItem('googleSignupName');
        if (!queryEmail) queryEmail = localStorage.getItem('googleSignupEmail');
        // Only try to get planId from localStorage if it's a clinician flow
        if (!queryPlanId && !isPatientFlow) queryPlanId = localStorage.getItem('googleSignupPlanId');
    }
    
    setName(queryName || 'Google User');
    setEmail(queryEmail || '');

    if (queryPlanId) {
      setPlanId(queryPlanId);
      const selectedPlan = mockPlans.find(plan => plan.id === queryPlanId);
      if (selectedPlan) {
        setPlanName(selectedPlan.name);
      }
    }
    // Clean up localStorage items after use
    if (typeof window !== 'undefined') {
        localStorage.removeItem('googleSignupName');
        localStorage.removeItem('googleSignupEmail');
        if (!isPatientFlow) localStorage.removeItem('googleSignupPlanId'); // Only remove planId if it was relevant
    }
  }, [searchParams, isPatientFlow]);

  const formClinician = useForm<CompleteProfileFormValuesClinician>({
    resolver: zodResolver(completeProfileSchemaClinician),
    defaultValues: {
      profession: undefined,
    },
  });

  const onSubmitClinician = (data: CompleteProfileFormValuesClinician) => {
    if (!email) {
      toast({ variant: 'destructive', title: 'Error', description: 'Email not found. Please try signing up again.' });
      router.push('/signup');
      return;
    }
    setIsLoading(true);
    console.log("Completing clinician profile with:", { name, email, profession: data.profession, planId });

    addMockClinician({
        name: name,
        email: email,
        role: data.profession,
        status: 'active', 
        specialization: 'To be specified', 
        currentPlanId: planId || undefined, 
        // Add other necessary AdminUser fields with defaults if needed
    });
    
    toast({
      title: 'Profile Complete!',
      description: `Welcome, ${name}! Your clinician account is ready. Redirecting to dashboard...`,
      duration: 7000
    });
    setIsLoading(false);
    router.push('/clinician/dashboard'); 
  };

  const onSubmitPatient = () => { 
    if (!email) {
      toast({ variant: 'destructive', title: 'Error', description: 'Email not found. Please try signing up again.' });
      router.push('/patient/signup');
      return;
    }
    setIsLoading(true);
    console.log("Completing patient profile (Google Sign-up):", { name, email });

    const newPatientData: Omit<Patient, 'id' | 'userId'> = {
        name: name,
        email: email,
        conditions: [], 
        // other patient fields can have defaults or be empty initially
    };
    addPatient(newPatientData); // Add to the mock patient data
    // Find the newly added patient to get their generated ID for notification
    const newlyAddedPatient = mockPatientsData.find(p => p.email === email && p.name === name);
    const actualUserId = newlyAddedPatient ? newlyAddedPatient.id : `user_g_patient_${Date.now()}`; // Fallback ID

    addPatientNotification(actualUserId, {
      title: "Welcome to PhysioPro!",
      description: `Your account has been created. You can now access your patient portal.`,
      type: "success",
      link: "/patient/dashboard",
    });
        
    toast({ title: 'Profile Complete!', description: `Welcome, ${name}! Your patient account is ready.`, duration: 7000 });
    router.push('/patient/dashboard');
    setIsLoading(false);
  };

  if (!email && !name) { // Basic check if essential data is missing
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader><CardTitle>Invalid Access</CardTitle></CardHeader>
                <CardContent><p>User details not found. Please <Link href="/signup" className="underline text-primary">try signing up again</Link>.</p></CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <UserCircle className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline text-primary">Complete Your Profile</CardTitle>
          <CardDescription>Just one more step, {name}!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted/50 rounded-md border">
            <p className="text-sm"><strong>Name:</strong> {name}</p>
            <p className="text-sm"><strong>Email:</strong> {email}</p>
            {planName && !isPatientFlow && <p className="text-sm"><strong>Selected Plan:</strong> <span className="font-semibold text-accent">{planName}</span></p>}
          </div>

          {isPatientFlow ? (
             <Button onClick={onSubmitPatient} className="w-full font-semibold text-lg py-6" disabled={isLoading}>
                {isLoading ? "Saving..." : "Confirm & Go to Dashboard"}
                 <CheckCircle className="ml-2 h-5 w-5"/>
              </Button>
          ) : (
            <Form {...formClinician}>
                <form onSubmit={formClinician.handleSubmit(onSubmitClinician)} className="space-y-6">
                <FormField
                    control={formClinician.control}
                    name="profession"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base">Your Profession</FormLabel>
                        <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger className="pl-10 text-base h-11">
                                <SelectValue placeholder="Select your profession" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {professionalRoles.map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full font-semibold text-lg py-6" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Complete Profile & Go to Dashboard"}
                    <CheckCircle className="ml-2 h-5 w-5"/>
                </Button>
                </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompleteProfilePageContent />
    </Suspense>
  );
}
