
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { ProgramBuilder } from '@/components/features/programs/ProgramBuilder';
import type { Exercise, Program, Patient } from '@/lib/types';
import { initialMockExercises } from '@/app/admin/exercises/page'; 
import { initialMockTemplates } from '@/app/admin/program-templates/page'; 
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react'; // Added for state sync


const mockPatients: Patient[] = [
  { id: "p1", userId: "usr_p1", name: "Alice Green", conditions: ["Knee Rehab", "Post-ACL"], currentProgramId: "prog_alice_knee" },
  { id: "p2", userId: "usr_p2", name: "Bob White", conditions: ["Shoulder Mobility", "Rotator Cuff Strain"], avatarUrl: "https://placehold.co/40x40.png?text=BW" },
  { id: "p3", userId: "usr_p3", name: "Charlie Black", conditions: ["Low Back Pain", "Sciatica"], currentProgramId: "prog_charlie_back" },
];

export default function ProgramBuilderPage() {
  const { toast } = useToast();
  // Local state to hold exercises and templates to allow refresh
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>(() => [...initialMockExercises]);
  const [programTemplates, setProgramTemplates] = useState<Program[]>(() => [...initialMockTemplates]);

  // Re-sync if global mock data changes (basic length check for demo)
  useEffect(() => {
    setExerciseLibrary([...initialMockExercises]);
  }, [initialMockExercises.length]);

  useEffect(() => {
    setProgramTemplates([...initialMockTemplates]);
  }, [initialMockTemplates.length]);

  const handleSaveProgram = async (programData: Omit<Program, 'id' | 'createdAt' | 'status'>) => {
    console.log("Saving program (simulated):", programData);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Program Builder</h1>
          <p className="text-muted-foreground">Create and assign personalized exercise programs for your patients.</p>
        </div>
      </div>

      <ProgramBuilder 
        patients={mockPatients}
        exerciseLibrary={exerciseLibrary} // Use state variable
        programTemplates={programTemplates.filter(t => t.status === 'active' || t.status === 'template')} // Use state variable
        onSaveProgram={handleSaveProgram}
      />
      
    </div>
  );
}

