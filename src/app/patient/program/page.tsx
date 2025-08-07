
"use client";

import { useState, useEffect } from 'react';
import type { Exercise, Program, ProgramExercise, ProgramExerciseFeedback } from '@/lib/types';
import { PatientExerciseView } from '@/components/features/patient-portal/PatientExerciseView';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Circle, Play, AlertTriangle, Loader2 as PageLoaderIcon, Eye } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { clinicianAssignedPrograms, updateClinicianProgram } from '@/app/clinician/programs/page'; 
import { addClinicianNotification } from '@/lib/data/mock-notifications'; 

// Shared mock data for exercises (can be imported by dashboard as well)
export const mockExerciseDetails: { [key: string]: Exercise } = {
  ex1: { id: 'ex1', name: 'Knee Bend', description: 'Gently bend and straighten your knee while sitting or lying down.', videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnailUrl: 'https://placehold.co/400x225.png?text=KB', category: 'Mobility', bodyParts: ['Knee'], difficulty: 'Beginner', precautions: "Stop if you feel sharp pain." , sets: "3", reps: "10-12", hold: "" },
  ex2: { id: 'ex2', name: 'Quad Sets', description: 'Tighten your thigh muscle (quadriceps) and hold.', videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnailUrl: 'https://placehold.co/400x225.png?text=QS', category: 'Strength', bodyParts: ['Thigh', 'Knee'], difficulty: 'Beginner', sets: "3", reps: "As many as possible", hold: "" },
  ex3: { id: 'ex3', name: 'Heel Slides', description: 'Slide your heel towards your buttock, bending your knee.', videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnailUrl: 'https://placehold.co/400x225.png?text=HS', category: 'Mobility', bodyParts: ['Knee', 'Hip'], difficulty: 'Beginner', sets: "3", reps: "1", hold: "30-60s" },
  ex4: { id: 'ex4', name: 'Hamstring Stretch', description: 'Gentle stretch for the back of your thigh.', videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnailUrl: 'https://placehold.co/400x225.png?text=Stretch', category: 'Flexibility', bodyParts: ['Hamstring'], difficulty: 'Beginner', sets: "1-2", reps: "1", hold: "30s per leg" },
};

// Shared mock program data (can be imported by dashboard)
export const mockFullProgramData: Program = { 
  id: 'prog1',
  name: 'Knee Rehabilitation - Phase 1 Advanced', // Updated name
  patientId: 'patient1', 
  clinicianId: 'clinician1',
  createdAt: new Date().toISOString(),
  status: 'active',
  description: "Focusing on strengthening and advanced mobility for knee recovery.", // Added description
  exercises: [
    { exerciseId: 'ex1', sets: 3, reps: 10, notes: 'Focus on slow, controlled movements.', feedbackHistory: [{timestamp: new Date(Date.now() - 86400000).toISOString(), painLevel: 2, comments: "Felt okay", acknowledgedByClinician: true }] },
    { exerciseId: 'ex2', sets: 3, reps: 15, duration: 'Hold 2s', notes: 'Keep your core engaged.' },
    { exerciseId: 'ex3', sets: 2, reps: 12, duration: '30s each side', notes: 'Ensure full range of motion.' },
    { exerciseId: 'ex4', sets: 1, reps: 1, duration: '5 min', notes: 'Cool down stretch.' },
  ],
  adherenceRate: 33, // Example initial adherence
};


interface ProgramDisplayExercise extends ProgramExercise {
  exercise: Exercise;
  completed: boolean; 
  feedbackHistory: ProgramExerciseFeedback[];
}

export default function PatientProgramPage() {
  const searchParams = useSearchParams();
  const [programExercises, setProgramExercises] = useState<ProgramDisplayExercise[]>([]);
  const [programMeta, setProgramMeta] = useState<Omit<Program, 'exercises'>>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const exerciseIdFromQuery = searchParams.get('exercise');
  const [activeExercise, setActiveExercise] = useState<ProgramDisplayExercise | null>(null);


  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        // Try to find the program in the shared clinicianAssignedPrograms
        // Assuming mockFullProgramData.id and patientId are what we're looking for
        const assignedProgram = clinicianAssignedPrograms.find(p => p.id === mockFullProgramData.id && p.patientId === mockFullProgramData.patientId);
        const sourceProgram = assignedProgram || mockFullProgramData; // Use assigned if found, else local mock

        const displayExercises = sourceProgram.exercises.map(pe => {
          const exerciseDetail = mockExerciseDetails[pe.exerciseId];
          if (!exerciseDetail) {
            console.warn(`Exercise detail not found for ID: ${pe.exerciseId}`);
            // Return a placeholder or skip if critical details are missing
            // For now, let's create a minimal Exercise object
            return {
                ...pe,
                exercise: { id: pe.exerciseId, name: `Unknown Exercise (${pe.exerciseId})`, description: '', category: '', bodyParts: [], difficulty: 'Beginner', status: 'active' } as Exercise,
                completed: !!(pe.feedbackHistory && pe.feedbackHistory.length > 0),
                feedbackHistory: pe.feedbackHistory || [],
            };
          }
          return {
            ...pe,
            exercise: exerciseDetail,
            completed: !!(pe.feedbackHistory && pe.feedbackHistory.length > 0), // Mark as completed if any feedback exists
            feedbackHistory: pe.feedbackHistory || [], 
          };
        });

        setProgramExercises(displayExercises);
        const { exercises, ...meta } = sourceProgram;
        setProgramMeta(meta);

        const initialActiveId = exerciseIdFromQuery || displayExercises[0]?.exercise.id;
        if (initialActiveId) {
          const initialActive = displayExercises.find(ex => ex.exercise.id === initialActiveId);
          setActiveExercise(initialActive || (displayExercises.length > 0 ? displayExercises[0] : null));
        }
        
        setIsLoading(false);
      } catch (e) {
        console.error("Error loading program:", e);
        setError("Failed to load program data.");
        setIsLoading(false);
      }
    }, 700); // Reduced timeout for faster load in dev
  }, [exerciseIdFromQuery]);

  const handleMarkComplete = (exerciseId: string, feedback: { painLevel: number, comments: string }) => {
    const currentTimestamp = new Date().toISOString();
    const newFeedbackEntry: ProgramExerciseFeedback = { ...feedback, timestamp: currentTimestamp, acknowledgedByClinician: false };

    setProgramExercises(prevProgram =>
      prevProgram.map(ex =>
        ex.exercise.id === exerciseId 
        ? { ...ex, completed: true, feedbackHistory: [...(ex.feedbackHistory || []), newFeedbackEntry] } 
        : ex
      )
    );
    if (activeExercise && activeExercise.exercise.id === exerciseId) {
      setActiveExercise(prev => prev ? { ...prev, completed: true, feedbackHistory: [...(prev.feedbackHistory || []), newFeedbackEntry] } : null);
    }

    if (programMeta) {
      const programToUpdateInSharedList = clinicianAssignedPrograms.find(p => p.id === programMeta.id);
      if (programToUpdateInSharedList) {
        const updatedExercisesForSharedList = programToUpdateInSharedList.exercises.map(progEx => {
          if (progEx.exerciseId === exerciseId) {
            return {
              ...progEx,
              feedbackHistory: [...(progEx.feedbackHistory || []), newFeedbackEntry]
            };
          }
          return progEx;
        });
        // Calculate new adherence rate
        const completedCount = updatedExercisesForSharedList.filter(ex => ex.feedbackHistory && ex.feedbackHistory.length > 0).length;
        const totalExercises = updatedExercisesForSharedList.length;
        const newAdherenceRate = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

        updateClinicianProgram({ 
            ...programToUpdateInSharedList, 
            exercises: updatedExercisesForSharedList,
            adherenceRate: newAdherenceRate // Update adherence rate
        });
        
        const clinicianToNotify = programToUpdateInSharedList.clinicianId; 
        const patientName = programMeta.patientId; // Using patientId as name for now
        addClinicianNotification(clinicianToNotify, {
          title: `Feedback on "${activeExercise?.exercise.name || 'Exercise'}"`,
          description: `Patient ${patientName} reported pain: ${feedback.painLevel}/10. Comment: "${feedback.comments.substring(0,30)}..."`,
          type: feedback.painLevel > 6 ? 'warning' : 'info',
          link: `/clinician/patients/${programMeta.patientId}?tab=programs`, 
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <PageLoaderIcon className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your program...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Program</h2>
        <p>{error}</p>
         <Button variant="outline" asChild className="mt-4">
            <Link href="/patient/dashboard">Go to Dashboard</Link>
          </Button>
      </div>
    );
  }

  if (!programMeta || programExercises.length === 0) {
    return <p className="text-center py-10 text-muted-foreground">No program assigned or program is empty.</p>;
  }
  
  const currentExerciseIndex = activeExercise ? programExercises.findIndex(ex => ex.exercise.id === activeExercise.exercise.id) : -1;
  const nextExercise = currentExerciseIndex !== -1 && currentExerciseIndex < programExercises.length - 1 ? programExercises[currentExerciseIndex + 1] : null;
  const prevExercise = currentExerciseIndex !== -1 && currentExerciseIndex > 0 ? programExercises[currentExerciseIndex - 1] : null;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="sticky top-20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">{programMeta.name}</CardTitle>
            <CardDescription>{programMeta.description || "Your prescribed exercise plan. Click an exercise to view details."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue={activeExercise ? `item-${programExercises.findIndex(e=>e.exercise.id === activeExercise.exercise.id)}` : "item-0"}>
            {programExercises.map((progEx, index) => (
              <AccordionItem value={`item-${index}`} key={progEx.exercise.id}>
                <AccordionTrigger 
                    className={cn(
                        "hover:no-underline p-3 rounded-md text-left", 
                        activeExercise?.exercise.id === progEx.exercise.id && "bg-primary/10",
                        progEx.completed && "opacity-70"
                    )}
                    onClick={() => setActiveExercise(progEx)}
                >
                  <div className="flex items-center gap-3 w-full">
                     <Image 
                        src={progEx.exercise.thumbnailUrl || `https://placehold.co/50x50.png?text=${progEx.exercise.name.charAt(0)}`}
                        alt={progEx.exercise.name}
                        width={50}
                        height={50}
                        className="rounded-md object-cover aspect-square"
                        data-ai-hint="exercise fitness"
                     />
                    <div className="flex-grow overflow-hidden">
                        <p className={cn("font-medium truncate", activeExercise?.exercise.id === progEx.exercise.id ? "text-primary" : "text-foreground")}>
                            {progEx.exercise.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {progEx.sets} sets x {progEx.reps} reps {progEx.duration && `(${progEx.duration})`}
                        </p>
                    </div>
                    {progEx.completed ? 
                        (progEx.feedbackHistory && progEx.feedbackHistory.some(fb => fb.acknowledgedByClinician)) ?
                          <Eye className="h-5 w-5 text-blue-500 shrink-0" title="Feedback seen by clinician"/> :
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" title="Completed, pending review"/>
                        : 
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-3 pl-16 text-sm">
                    {progEx.notes && <p className="italic text-muted-foreground mb-2">Notes: {progEx.notes}</p>}
                    {progEx.feedbackHistory && progEx.feedbackHistory.some(fb => fb.acknowledgedByClinician) && (
                      <p className="text-xs text-blue-600 mb-1 flex items-center"><Eye className="h-3 w-3 mr-1"/> Clinician has reviewed your feedback.</p>
                    )}
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setActiveExercise(progEx)}>
                        View Details & Video
                    </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
            </Accordion>
          </CardContent>
           <CardFooter>
            <Link href="/patient/dashboard" className="w-full">
                <Button variant="outline" className="w-full">Back to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {activeExercise ? (
          <PatientExerciseView
            exercise={activeExercise.exercise}
            programDetails={activeExercise} 
            onMarkComplete={(feedback) => handleMarkComplete(activeExercise.exercise.id, feedback)}
            isCompleted={activeExercise.completed}
            feedbackHistory={activeExercise.feedbackHistory}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/30 rounded-lg p-8 text-center">
            <Play className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground">Select an Exercise</h2>
            <p className="text-muted-foreground">Click on an exercise from the list to view its details and video.</p>
          </div>
        )}
        
        {activeExercise && (
        <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => prevExercise && setActiveExercise(prevExercise)} disabled={!prevExercise}>
              Previous Exercise
            </Button>
            <Button variant="outline" onClick={() => nextExercise && setActiveExercise(nextExercise)} disabled={!nextExercise}>
              Next Exercise
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

