
"use client";

import { useState, useMemo, useEffect } from 'react'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PlusCircle, ArrowRight, RefreshCw } from "lucide-react"; 
import Link from "next/link";
import type { Patient, Program } from "@/lib/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast'; 
import { clinicianAssignedPrograms } from '@/app/clinician/programs/page'; 
import { format } from 'date-fns'; 

export let mockPatientsData: Patient[] = [
  { id: "p1", userId: "usr_p1", name: "Alice Green", email: "alice.g@example.com", conditions: ["Knee Rehab"], currentProgramId: "prog_alice_knee", avatarUrl: "https://placehold.co/60x60.png?text=AG", lastActivity: new Date(Date.now() - 86400000 * 1).toISOString(), overallAdherence: 85, whatsappNumber: "+12345678901" },
  { id: "p2", userId: "usr_p2", name: "Bob White", email: "bob.w@example.com", conditions: ["Shoulder Mobility"], currentProgramId: "prog_bob_shoulder", avatarUrl: "https://placehold.co/60x60.png?text=BW", lastActivity: new Date(Date.now() - 86400000 * 3).toISOString(), overallAdherence: 60 },
  { id: "p3", userId: "usr_p3", name: "Charlie Black", email: "charlie.b@example.com", conditions: ["Low Back Pain"], avatarUrl: "https://placehold.co/60x60.png?text=CB", lastActivity: new Date().toISOString(), overallAdherence: 95, whatsappNumber: "+923001234567" },
  { id: "p4", userId: "usr_p4", name: "Diana Prince", email: "diana.p@example.com", conditions: ["Ankle Recovery"], avatarUrl: "https://placehold.co/60x60.png?text=DP", lastActivity: new Date(Date.now() - 86400000 * 5).toISOString(), overallAdherence: 40 },
];

export const addPatient = (newPatientData: Omit<Patient, 'id' | 'userId'>) => {
  const patientToAdd: Patient = {
    ...newPatientData,
    id: `p${Date.now()}`,
    userId: `usr_p${Date.now()}`, 
    lastActivity: new Date().toISOString(),
    overallAdherence: 0,
    avatarUrl: newPatientData.avatarUrl || `https://placehold.co/60x60.png?text=${newPatientData.name.split(' ').map(n=>n[0]).join('') || 'P'}`,
  };
  mockPatientsData = [patientToAdd, ...mockPatientsData];
};

export const updatePatient = (updatedPatient: Patient) => {
  const index = mockPatientsData.findIndex(p => p.id === updatedPatient.id);
  if (index !== -1) {
    mockPatientsData[index] = updatedPatient;
  } else {
    addPatient(updatedPatient as Omit<Patient, 'id' | 'userId'>); // Add if not found
  }
  mockPatientsData = [...mockPatientsData]; 
};

export default function PatientsPage() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>(() => [...mockPatientsData]);

  useEffect(() => {
    setPatients([...mockPatientsData].sort((a,b) => a.name.localeCompare(b.name)));
  }, [mockPatientsData.length]); 

  const refreshPatientList = () => {
    setPatients([...mockPatientsData].sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: "Patient List Refreshed" });
  };

  const getProgramName = (programId?: string): string => {
    if (!programId) return "None";
    const program = clinicianAssignedPrograms.find(p => p.id === programId);
    return program?.name || programId; 
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Manage Patients</h1>
          <p className="text-muted-foreground">View and manage your patient roster.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="default" onClick={refreshPatientList}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh List
            </Button>
            <Button asChild>
            <Link href="/clinician/patients/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Patient
            </Link>
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient List ({patients.length})</CardTitle>
          <CardDescription>A list of all patients currently under your care.</CardDescription>
        </CardHeader>
        <CardContent>
          {patients.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardContent className="p-4 flex-grow">
                    <div className="flex items-center gap-4 mb-3">
                      <Image 
                        src={patient.avatarUrl || `https://placehold.co/60x60.png?text=${patient.name.charAt(0)}`} 
                        alt={patient.name} 
                        width={60} 
                        height={60} 
                        className="rounded-full border-2 border-primary/50"
                        data-ai-hint="person patient"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-primary">{patient.name}</h3>
                        <p className="text-xs text-muted-foreground">{patient.conditions.join(', ')}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium text-muted-foreground">Program:</span> {getProgramName(patient.currentProgramId)}</p>
                        <p><span className="font-medium text-muted-foreground">Last Activity:</span> {patient.lastActivity ? format(new Date(patient.lastActivity), 'MMM d, yyyy') : 'N/A'}</p>
                        <div className="flex items-center">
                            <span className="font-medium text-muted-foreground">Adherence:</span> 
                            <Badge variant={patient.overallAdherence && patient.overallAdherence >= 80 ? "default" : patient.overallAdherence && patient.overallAdherence >=60 ? "secondary" : "destructive"} className="ml-1">
                                {patient.overallAdherence !== undefined ? `${patient.overallAdherence}%` : 'N/A'}
                            </Badge>
                        </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 border-t">
                       <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={`/clinician/patients/${patient.id}`}>View Profile <ArrowRight className="ml-2 h-4 w-4"/></Link>
                      </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Patients Yet</h3>
              <p className="text-muted-foreground">Start by adding a new patient to your roster.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
