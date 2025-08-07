
"use client";

import { useState, useEffect } from 'react';
import type { PatientTask, PatientProgress, Program, Appointment, Exercise, ProgramExercise } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StreakCounter } from '@/components/features/patient-portal/StreakCounter';
import { BadgeDisplay } from '@/components/features/patient-portal/BadgeDisplay';
import Link from 'next/link';
import { ArrowRight, MessageSquareText, CalendarClock, BookOpenCheck, Activity, Wand2, Loader2 as PageLoaderIcon, Target, PlayCircle, ChevronRight, Sparkles, Zap, Bot, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { generateMotivationalMessage, type AiPatientMotivationInput } from '@/ai/flows/ai-patient-motivator';
import { mockExerciseDetails, mockFullProgramData as initialMockProgramData } from '@/app/patient/program/page'; 
import { mockPatientsData } from '@/app/clinician/patients/page'; 

const mockPatientIdForDashboard = 'p1'; 

type EnrichedProgramExercise = ProgramExercise & { exerciseDetails: Exercise, completed: boolean };
type EnrichedProgram = Omit<Program, 'exercises'> & { exercises: EnrichedProgramExercise[] };

export default function PatientDashboardPage() {
  const { toast } = useToast();
  
  const [isClient, setIsClient] = useState(false);
  const [patientName, setPatientName] = useState<string>("Patient"); 
  const [currentProgram, setCurrentProgram] = useState<EnrichedProgram | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[] | null>(null);
  const [progressStats, setProgressStats] = useState<PatientProgress | null>(null);
  const [motivationalMessage, setMotivationalMessage] = useState<string>("Loading personalized tip...");
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(true); 
  const [currentDateString, setCurrentDateString] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const currentPatientData = mockPatientsData.find(p => p.id === mockPatientIdForDashboard);
      if (currentPatientData) {
        setPatientName(currentPatientData.name);
      }

      const enrichedExercises = initialMockProgramData.exercises.map(ex => {
        const details = mockExerciseDetails[ex.exerciseId];
        const isCompleted = !!(ex.feedbackHistory && ex.feedbackHistory.length > 0);
        return {
          ...ex,
          exerciseDetails: details || { id: ex.exerciseId, name: `Unknown Exercise (${ex.exerciseId})`, description: '', category: '', bodyParts: [], difficulty: 'Beginner', status: 'active' } as Exercise, 
          completed: isCompleted,
        };
      });

      const enrichedProgram: EnrichedProgram = {
        ...initialMockProgramData,
        exercises: enrichedExercises,
      };
      setCurrentProgram(enrichedProgram);

      const generatedMockUpcomingAppointments: Appointment[] = [
        { id: 'apt1', patientId: 'p1', clinicianId: 'doc_current', clinicianName: 'Dr. Emily Carter', start: new Date(new Date().setDate(new Date().getDate() + 2)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(new Date().getHours() + 1)), title: 'Follow-up Session', status: 'scheduled', type: 'Telehealth Check-in' },
        { id: 'apt2', patientId: 'p1', clinicianId: 'doc_current', clinicianName: 'Dr. Emily Carter', start: new Date(new Date().setDate(new Date().getDate() + 7)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 7)).setHours(new Date().getHours() + 1)), title: 'Progress Review', status: 'scheduled', type: 'In-Person' },
      ];
      setUpcomingAppointments(generatedMockUpcomingAppointments);
      
      const completedCount = enrichedExercises.filter(ex => ex.completed).length;
      const totalCount = enrichedExercises.length;
      const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const generatedMockProgressStats: PatientProgress = {
        streak: 8,
        badges: ['10_workouts', '7_day_streak'], 
        completionRate: completionRate,
      };
      setProgressStats(generatedMockProgressStats);

      setCurrentDateString(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !progressStats || !currentProgram || !patientName || patientName === "Patient") {
      setIsLoadingMotivation(true);
      return;
    }
    
    const fetchMotivationalMessage = async () => {
      setIsLoadingMotivation(true);
      try {
        const input: AiPatientMotivationInput = {
          patientName: patientName.split(' ')[0],
          currentProgramName: currentProgram?.name,
          currentProgramAdherence: progressStats?.completionRate,
          workoutStreak: progressStats?.streak,
          completedExercisesToday: currentProgram.exercises.filter(task => !task.completed).length === 0,
          upcomingDifficultExercise: currentProgram.exercises.find(task => !task.completed && task.exerciseDetails.difficulty === 'Advanced')?.exerciseDetails.name,
        };
        const result = await generateMotivationalMessage(input);
        setMotivationalMessage(result.motivationalMessage);
      } catch (error) {
        console.error("Failed to fetch motivational message:", error);
        setMotivationalMessage(`Keep up the great work, ${patientName.split(' ')[0]}!`);
      } finally {
        setIsLoadingMotivation(false);
      }
    };

    fetchMotivationalMessage();
  }, [progressStats, patientName, currentProgram, isClient]);
  
  const nextExercisesToShow = currentProgram?.exercises.filter(task => !task.completed).slice(0, 2) || [];

  if (!isClient || !currentProgram || !upcomingAppointments || !progressStats || !currentDateString) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <PageLoaderIcon className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <Card className="bg-gradient-to-br from-primary/80 via-primary to-purple-600 text-primary-foreground shadow-xl animate-fade-in">
        <CardContent className="p-6">
          <h1 className="text-3xl md:text-4xl font-bold">
            Hello, {patientName}!
          </h1>
          <p className="text-lg opacity-90 mt-1">
            {currentDateString}
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {currentProgram && (
            <Card className="shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-headline text-primary flex items-center">
                    <Zap className="mr-2 h-6 w-6" /> Current Program
                  </CardTitle>
                  <Link href="/patient/program">
                    <Button variant="ghost" size="sm" className="text-xs">View Full Program <ChevronRight className="h-3 w-3 ml-1"/></Button>
                  </Link>
                </div>
                <CardDescription className="text-md font-semibold pt-1">{currentProgram.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-semibold text-primary">{progressStats.completionRate}%</span>
                  </div>
                  <Progress value={progressStats.completionRate} className="h-3 bg-primary/20" />
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{currentProgram.description}</p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary flex items-center">
                <Target className="mr-2 h-5 w-5" /> Today's Focus
              </CardTitle>
              <CardDescription>Your next exercises. Let's get started!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextExercisesToShow.length > 0 ? (
                nextExercisesToShow.map(task => (
                  <Card key={task.exerciseId} className="flex items-center p-3 gap-3 bg-muted/30 hover:shadow-md transition-shadow">
                    <Image src={task.exerciseDetails.thumbnailUrl || `https://placehold.co/80x80.png`} alt={task.exerciseDetails.name} width={60} height={60} className="rounded-md object-cover aspect-square" data-ai-hint="exercise fitness" />
                    <div className="flex-grow">
                      <h4 className="font-semibold">{task.exerciseDetails.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {task.sets} sets x {task.reps} reps {task.duration && `(${task.duration})`}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/patient/program?exercise=${task.exerciseId}`}>
                        <PlayCircle className="mr-1.5 h-4 w-4" /> Start
                      </Link>
                    </Button>
                  </Card>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="mx-auto h-10 w-10 mb-2 text-green-500"/>
                  <p className="font-semibold">All assigned exercises complete!</p>
                  <p className="text-sm">Great work. Check your full program for more details.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          <Card className="bg-gradient-to-r from-accent/80 to-accent text-accent-foreground shadow-md">
            <CardContent className="p-5 flex items-start gap-3">
              <Bot className="h-8 w-8 mt-1 opacity-90 shrink-0" />
              <div>
                <h3 className="text-md font-semibold">AI Coach Tip:</h3>
                {isLoadingMotivation ? (
                  <div className="flex items-center space-x-1.5 mt-1 text-sm">
                    <PageLoaderIcon className="h-3 w-3 animate-spin" /> <span>Personalizing...</span>
                  </div>
                ) : (
                  <p className="text-sm mt-0.5 opacity-95">{motivationalMessage}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <StreakCounter streak={progressStats.streak} />
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-headline">Your Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-3">
              <BadgeDisplay achievedBadgeIds={progressStats.badges} />
            </CardContent>
            <CardFooter>
                <Link href="/patient/progress" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">View All Progress <ChevronRight className="h-3 w-3 ml-1"/></Button>
                </Link>
            </CardFooter>
          </Card>

          {upcomingAppointments && upcomingAppointments.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-headline flex items-center">
                    <CalendarClock className="mr-2 h-5 w-5 text-primary"/> Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {upcomingAppointments.slice(0,2).map(apt => (
                  <Link href="/patient/appointments" key={apt.id} className="block p-2.5 bg-muted/40 rounded-md hover:bg-muted/70 transition-colors">
                    <div className="flex justify-between items-center">
                        <p className="font-medium text-sm">{apt.title}</p>
                        <Badge variant="secondary" className="text-xs">{format(new Date(apt.start), 'MMM d')}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{format(new Date(apt.start), 'p')} with {apt.clinicianName}</p>
                  </Link>
                ))}
              </CardContent>
               <CardFooter>
                <Link href="/patient/appointments" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">View All Appointments <ChevronRight className="h-3 w-3 ml-1"/></Button>
                </Link>
            </CardFooter>
            </Card>
          )}
        </div>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Explore & Connect</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            {label: "My Full Program", href: "/patient/program", icon: Activity, color: "text-indigo-500", bgColor: "bg-indigo-50"},
            {label: "Messages", href: "/patient/messaging", icon: MessageSquareText, color: "text-sky-500", bgColor: "bg-sky-50"},
            {label: "Appointments", href: "/patient/appointments", icon: CalendarClock, color: "text-teal-500", bgColor: "bg-teal-50"},
            {label: "Learn More", href: "/patient/education", icon: BookOpenCheck, color: "text-rose-500", bgColor: "bg-rose-50"},
          ].map(link => (
            <Link href={link.href} key={link.href}>
              <Card className={cn("text-center p-4 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col justify-center items-center", link.bgColor)}>
                <link.icon className={cn("h-8 w-8 mb-2", link.color)} />
                <p className={cn("font-semibold text-sm", link.color)}>{link.label}</p>
              </Card>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
