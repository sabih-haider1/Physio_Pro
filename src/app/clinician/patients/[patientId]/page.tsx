
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCircle, Mail, Phone, CalendarDays, HomeIcon, ClipboardList, Activity, Edit3, MessageSquare, FilePlus, BarChartHorizontalBig, PlayCircle, RefreshCw, MessageCircle, AlertTriangle, Check, Square, Star, CheckCircle as CheckCircleIcon, Eye } from 'lucide-react';
import Link from 'next/link';
import type { Patient, Program, Appointment, ProgramExercise, ProgramExerciseFeedback } from '@/lib/types'; 
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { mockPatientsData, updatePatient } from '@/app/clinician/patients/page'; 
import { clinicianAssignedPrograms, updateClinicianProgram } from '@/app/clinician/programs/page'; 
import { initialMockExercises } from '@/app/admin/exercises/page'; 
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { addPatientNotification } from '@/lib/data/mock-notifications';


const mockPatientAppointments: { [patientId: string]: Appointment[] } = {
    'p1': [
        { id: 'apt1', patientId: 'p1', clinicianId: 'doc_current', clinicianName: 'Dr. Clinician', start: new Date(2024, 6, 20, 10, 0), end: new Date(2024, 6, 20, 10, 30), title: 'Follow-up', status: 'completed', type: 'Follow-up' },
        { id: 'apt2', patientId: 'p1', clinicianId: 'doc_current', clinicianName: 'Dr. Clinician', start: new Date(new Date().setDate(new Date().getDate() + 3)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(14, 30)), title: 'Check-in', status: 'scheduled', type: 'Telehealth Check-in' },
    ],
    'p2': [
        { id: 'apt3', patientId: 'p2', clinicianId: 'doc_current', clinicianName: 'Dr. Clinician', start: new Date(new Date().setDate(new Date().getDate() + 5)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 5)).setHours(11,0)), title: 'Initial Assessment', status: 'scheduled', type: 'Initial Consultation' },
    ]
};


export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const patientId = params.patientId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinicianNotes, setClinicianNotes] = useState<string>("");

  const loadPatientData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const fetchedPatient = mockPatientsData.find(p => p.id === patientId);
      const fetchedPrograms = clinicianAssignedPrograms.filter(p => p.patientId === patientId);
      const fetchedAppointments = mockPatientAppointments[patientId] || [];

      if (fetchedPatient) {
        setPatient(fetchedPatient);
        setPrograms(fetchedPrograms);
        setAppointments(fetchedAppointments);
        setClinicianNotes(fetchedPatient.medicalNotes || "");
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Patient not found.' });
        router.push('/clinician/patients');
      }
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    } else {
      router.push('/clinician/patients');
    }
  }, [patientId, router, toast]);


  const handleSaveNotes = () => {
    if (!patient) return;
    const updatedPatientData = { ...patient, medicalNotes: clinicianNotes };
    updatePatient(updatedPatientData);
    toast({ title: "Notes Saved", description: "Clinician notes have been updated for this patient." });
  };

  const handleAcknowledgeFeedback = (programId: string, exerciseId: string, feedbackTimestamp: string) => {
    const programIndex = clinicianAssignedPrograms.findIndex(p => p.id === programId);
    if (programIndex === -1) return;

    const programToUpdate = { ...clinicianAssignedPrograms[programIndex] };
    const exerciseIndex = programToUpdate.exercises.findIndex(ex => ex.exerciseId === exerciseId);
    if (exerciseIndex === -1) return;

    const exerciseToUpdate = { ...programToUpdate.exercises[exerciseIndex] };
    const feedbackIndex = exerciseToUpdate.feedbackHistory?.findIndex(fb => fb.timestamp === feedbackTimestamp);

    if (exerciseToUpdate.feedbackHistory && feedbackIndex !== undefined && feedbackIndex !== -1) {
      exerciseToUpdate.feedbackHistory[feedbackIndex].acknowledgedByClinician = true;
      programToUpdate.exercises[exerciseIndex] = exerciseToUpdate;
      updateClinicianProgram(programToUpdate); // Update the shared mock data
      setPrograms(prev => prev.map(p => p.id === programId ? programToUpdate : p)); // Update local state for UI refresh
      
      const exerciseName = getExerciseName(exerciseId);
      addPatientNotification(patientId, {
        title: "Feedback Reviewed",
        description: `Your clinician has reviewed your feedback for "${exerciseName}".`,
        type: 'info',
        link: `/patient/program` // Or link to specific exercise if possible
      });

      toast({ title: "Feedback Acknowledged", description: `You've marked the feedback for ${exerciseName} as reviewed.` });
    }
  };

  const getExerciseName = (exerciseId: string) => {
    return initialMockExercises.find(ex => ex.id === exerciseId)?.name || 'Unknown Exercise';
  };
  
  const painLevelColor = (level: number) => {
    if (level <= 3) return 'text-green-600';
    if (level <= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading patient details...</p></div>;
  }

  if (!patient) {
    return <div className="text-center py-10">Patient data could not be loaded.</div>;
  }

  const currentProgram = programs.find(p => p.status === 'active');

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient List
            </Button>
            <Button variant="ghost" size="sm" onClick={loadPatientData} title="Refresh patient data">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
            </Button>
        </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/30 p-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person patient" />
            <AvatarFallback className="text-3xl">{patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <CardTitle className="text-3xl font-headline text-primary">{patient.name}</CardTitle>
            <div className="text-muted-foreground space-y-1 mt-1">
              {patient.email && <p className="flex items-center text-sm"><Mail className="mr-2 h-4 w-4"/> {patient.email}</p>}
              {patient.phone && <p className="flex items-center text-sm"><Phone className="mr-2 h-4 w-4"/> {patient.phone}</p>}
              {patient.dateOfBirth && <p className="flex items-center text-sm"><CalendarDays className="mr-2 h-4 w-4"/> Born: {format(new Date(patient.dateOfBirth), 'PPP')}</p>}
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0 items-end sm:items-stretch">
            <Button variant="outline" size="sm" onClick={() => toast({title: "Edit Patient (Simulated)", description: "Opening edit form for " + patient.name})}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
            <Button size="sm" onClick={() => router.push(`/clinician/messaging?patientId=${patient.id}`)}>
                <MessageSquare className="mr-2 h-4 w-4" /> Message
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="programs">Programs &amp; Feedback</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="notes">Clinician Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg font-semibold flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary"/>Patient Information</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {patient.address && <p><strong className="text-muted-foreground">Address:</strong> {patient.address}</p>}
                  {patient.gender && <p><strong className="text-muted-foreground">Gender:</strong> {patient.gender}</p>}
                  <p><strong className="text-muted-foreground">Conditions:</strong> {patient.conditions.join(', ')}</p>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader><CardTitle className="text-lg font-semibold flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Current Program Snapshot</CardTitle></CardHeader>
                <CardContent>
                  {currentProgram ? (
                    <div>
                      <h4 className="font-medium">{currentProgram.name}</h4>
                      <p className="text-sm text-muted-foreground">Assigned: {currentProgram.assignedDate ? format(new Date(currentProgram.assignedDate), 'PPP') : 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">Adherence: <span className="font-semibold text-primary">{currentProgram.adherenceRate || patient.overallAdherence || 'N/A'}%</span></p>
                       <Button variant="link" asChild className="p-0 h-auto mt-1"><Link href={`/clinician/program-builder?programId=${currentProgram.id}&patientId=${patient.id}`}>View/Edit Program</Link></Button>
                    </div>
                  ) : <p className="text-muted-foreground">No active program assigned.</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="programs" className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">Assigned Programs & Feedback</h3>
                <Button size="sm" onClick={() => router.push(`/clinician/program-builder?patientId=${patient.id}`)}>
                  <FilePlus className="mr-2 h-4 w-4" /> Assign New Program
                </Button>
              </div>
              {programs.length > 0 ? programs.map(prog => (
                <Card key={prog.id} className="bg-background shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{prog.name}</CardTitle>
                        <Badge variant={prog.status === 'active' ? 'default' : 'secondary'} className="capitalize">{prog.status}</Badge>
                    </div>
                    <CardDescription>Assigned: {prog.assignedDate ? format(new Date(prog.assignedDate), 'PPP') : 'N/A'} | Adherence: {prog.adherenceRate || 'N/A'}%</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="text-sm font-semibold mb-2">Exercises & Feedback:</h4>
                    {prog.exercises.length > 0 ? (
                      <ul className="space-y-3">
                        {prog.exercises.map((ex, idx) => (
                          <li key={idx} className="p-3 border rounded-md bg-muted/30">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-sm">{getExerciseName(ex.exerciseId)}</span>
                                <span className="text-xs text-muted-foreground">
                                    {ex.sets} sets x {ex.reps} reps {ex.duration && `(${ex.duration})`}
                                </span>
                            </div>
                            {ex.feedbackHistory && ex.feedbackHistory.length > 0 ? (
                              <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-primary/30">
                                {ex.feedbackHistory.map((fb, fbIdx) => (
                                  <div key={fbIdx} className="text-xs p-1.5 bg-background rounded shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <span className={cn("font-semibold", painLevelColor(fb.painLevel))}>Pain: {fb.painLevel}/10</span>
                                        <span className="text-muted-foreground/70">{format(new Date(fb.timestamp), 'MMM d, p')}</span>
                                    </div>
                                    {fb.comments && <p className="text-muted-foreground mt-0.5 italic">"{fb.comments}"</p>}
                                    <div className="mt-1.5 text-right">
                                        {fb.acknowledgedByClinician ? (
                                            <Badge variant="secondary" size="sm" className="cursor-default text-xs">
                                                <CheckCircleIcon className="h-3 w-3 mr-1" /> Acknowledged
                                            </Badge>
                                        ) : (
                                            <Button 
                                                size="xs" 
                                                variant="outline"
                                                className="h-6 px-1.5 py-0.5 text-xs"
                                                onClick={() => handleAcknowledgeFeedback(prog.id, ex.exerciseId, fb.timestamp)}
                                            >
                                                Acknowledge
                                            </Button>
                                        )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1 italic">No feedback submitted for this exercise yet.</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-xs text-muted-foreground">No exercises in this program.</p>}
                  </CardContent>
                  <CardFooter className="pt-3 border-t">
                     <Button variant="outline" size="sm" onClick={() => router.push(`/clinician/program-builder?programId=${prog.id}&patientId=${patient.id}`)}>View/Edit Full Program</Button>
                  </CardFooter>
                </Card>
              )) : <p className="text-muted-foreground">No programs assigned to this patient yet.</p>}
            </TabsContent>
            
            <TabsContent value="appointments" className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Appointments</h3>
                    <Button size="sm" onClick={() => router.push(`/clinician/appointments?patientId=${patient.id}&defaultDate=${new Date().toISOString()}`)}>
                        <CalendarDays className="mr-2 h-4 w-4"/> Schedule New
                    </Button>
                </div>
                {appointments.length > 0 ? appointments.map(apt => (
                    <Card key={apt.id} className="bg-muted/20">
                        <CardHeader className="pb-2">
                             <CardTitle className="text-md">{apt.title || apt.type || "Appointment"}</CardTitle>
                             <CardDescription>
                                {format(new Date(apt.start), 'PPP p')} - {format(new Date(apt.end), 'p')}
                                <span className="ml-2 capitalize">({apt.status})</span>
                             </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Type: {apt.type || "Not specified"}</p>
                        </CardContent>
                         <CardFooter className="pt-2">
                            <Button variant="outline" size="sm" onClick={() => toast({title: "Edit Appointment (Simulated)"})}>Edit</Button>
                        </CardFooter>
                    </Card>
                )) : <p className="text-muted-foreground">No appointments scheduled for this patient.</p>}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <h3 className="text-lg font-semibold">Clinician Notes</h3>
              <Textarea 
                placeholder="Enter clinical notes for this patient... (e.g., observations, progress, adjustments needed)" 
                rows={10} 
                value={clinicianNotes}
                onChange={(e) => setClinicianNotes(e.target.value)}
                className="shadow-sm"
              />
              <Button onClick={handleSaveNotes}>Save Notes</Button>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

