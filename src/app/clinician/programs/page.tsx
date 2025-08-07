
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { ListChecks, PlusCircle, Search, Edit2, Trash2, MoreHorizontal, Eye, AlertTriangle, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Program, Patient } from '@/lib/types';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { mockPatientsData } from '@/app/clinician/patients/page';

export let clinicianAssignedPrograms: Program[] = [
  { 
    id: 'prog_alice_knee', 
    name: 'Knee Rehab - Phase 2', 
    patientId: 'p1', 
    clinicianId: 'doc_current', 
    exercises: [ { exerciseId: 'ex1', sets: 3, reps: 10 }, { exerciseId: 'ex5', sets: 2, duration: "30s" } ], 
    createdAt: '2024-07-15T00:00:00Z', 
    status: 'active', 
    assignedDate: '2024-07-15', 
    adherenceRate: 85,
    description: "Focus on strengthening and stability for Alice Green's knee."
  },
  { 
    id: 'prog_bob_shoulder', 
    name: 'Shoulder Mobility Advanced', 
    patientId: 'p2', 
    clinicianId: 'doc_current', 
    exercises: [ { exerciseId: 'ex2', sets: 3, reps: 12 }, { exerciseId: 'ex6', sets: 2, reps: 8 } ], 
    createdAt: '2024-07-20T00:00:00Z', 
    status: 'active', 
    assignedDate: '2024-07-20', 
    adherenceRate: 60,
    description: "Bob White's advanced shoulder mobility and strengthening plan."
  },
  { 
    id: 'prog_charlie_back_draft', 
    name: 'Low Back Pain Initial Phase (Draft)', 
    patientId: 'p3', 
    clinicianId: 'doc_current', 
    exercises: [ { exerciseId: 'ex3', sets: 2, reps: 10, notes: "Gentle holds" } ], 
    createdAt: '2024-07-28T00:00:00Z', 
    status: 'draft', 
    description: "Initial gentle exercises for Charlie Black."
  },
];

export const addClinicianProgram = (program: Program) => {
  clinicianAssignedPrograms = [program, ...clinicianAssignedPrograms];
};

export const updateClinicianProgram = (updatedProgram: Program) => {
  const index = clinicianAssignedPrograms.findIndex(p => p.id === updatedProgram.id);
  if (index !== -1) {
    clinicianAssignedPrograms[index] = updatedProgram;
  } else {
    addClinicianProgram(updatedProgram);
  }
  clinicianAssignedPrograms = [...clinicianAssignedPrograms];
};


export default function ClinicianProgramsPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>(() => [...clinicianAssignedPrograms]);
  const [searchTerm, setSearchTerm] = useState('');
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);

  useEffect(() => {
    setPrograms([...clinicianAssignedPrograms].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [clinicianAssignedPrograms.length]);

  const filteredPrograms = useMemo(() => {
    return programs.filter(prog => {
      const patient = mockPatientsData.find(p => p.id === prog.patientId);
      const patientNameMatch = patient ? patient.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const programNameMatch = prog.name.toLowerCase().includes(searchTerm.toLowerCase());
      const descriptionMatch = prog.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      return patientNameMatch || programNameMatch || descriptionMatch;
    });
  }, [searchTerm, programs]);

  const handleDeleteProgram = () => {
    if (!programToDelete) return;
    clinicianAssignedPrograms = clinicianAssignedPrograms.filter(prog => prog.id !== programToDelete.id);
    setPrograms([...clinicianAssignedPrograms].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    toast({ title: 'Program Deleted', description: `Program "${programToDelete.name}" has been removed.` });
    setProgramToDelete(null);
  };

  const getPatientName = (patientId?: string): string => {
    if (!patientId) return "N/A";
    return mockPatientsData.find(p => p.id === patientId)?.name || "Unknown Patient";
  };
  
  const getStatusBadgeVariant = (status: Program['status']): "default" | "secondary" | "outline" | "destructive" => {
    switch(status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'completed': return 'outline';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Layers className="mr-3 h-8 w-8" /> My Exercise Programs
          </h1>
          <p className="text-muted-foreground">View, manage, and track programs you've assigned to patients.</p>
        </div>
        <Button asChild>
          <Link href="/clinician/program-builder">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Program
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Program List ({filteredPrograms.length})</CardTitle>
          <CardDescription>Browse and manage all programs you've created or assigned.</CardDescription>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by program name, patient name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPrograms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold line-clamp-2">{program.name}</CardTitle>
                        <Badge variant={getStatusBadgeVariant(program.status)} className="capitalize h-fit">{program.status}</Badge>
                    </div>
                    <CardDescription className="text-sm">
                      For: <span className="font-medium text-primary">{getPatientName(program.patientId)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1 flex-grow">
                    <p className="text-xs text-muted-foreground line-clamp-2">{program.description || "No description provided."}</p>
                    <p><strong className="font-normal text-muted-foreground">Exercises:</strong> {program.exercises.length}</p>
                    {program.assignedDate && <p><strong className="font-normal text-muted-foreground">Assigned:</strong> {format(new Date(program.assignedDate), 'MMM d, yyyy')}</p>}
                    {program.adherenceRate !== undefined && 
                      <p><strong className="font-normal text-muted-foreground">Adherence:</strong> 
                        <span className={`font-semibold ml-1 ${program.adherenceRate >= 80 ? 'text-green-600' : program.adherenceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {program.adherenceRate}%
                        </span>
                      </p>
                    }
                  </CardContent>
                  <CardFooter className="border-t pt-3 flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                       <Link href={`/clinician/program-builder?programId=${program.id}&patientId=${program.patientId}`}>
                         <Edit2 className="mr-1.5 h-4 w-4"/> Edit
                       </Link>
                    </Button>
                     <Button variant="ghost" size="sm" onClick={() => toast({title: "View Details (Simulated)", description: `Showing details for ${program.name}`})} className="flex-1">
                       <Eye className="mr-1.5 h-4 w-4"/> Details
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setProgramToDelete(program)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              {searchTerm ? <Search className="mx-auto h-12 w-12 mb-4 opacity-50" /> : <AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-50" />}
              <h3 className="text-lg font-medium">{searchTerm ? "No Programs Found" : "No Programs Created Yet"}</h3>
              <p>{searchTerm ? "Try adjusting your search terms." : "Start by creating a new program for a patient."}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!programToDelete} onOpenChange={(open) => !open && setProgramToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program: {programToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the program. Patient progress related to this program might also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProgram} className={cn("bg-destructive hover:bg-destructive/90 text-destructive-foreground")}>
              Delete Program
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
