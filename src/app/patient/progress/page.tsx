
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, CheckCircle, TrendingUp, Award, Activity, Loader2 as PageLoaderIcon } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BadgeDisplay } from '@/components/features/patient-portal/BadgeDisplay';
import type { Program, Exercise, ProgramExercise, PatientProgress } from '@/lib/types';
import { mockExerciseDetails, mockFullProgramData as initialMockProgramData } from '@/app/patient/program/page'; // Import shared mock data

const mockPatientBadges = ['10_workouts', '7_day_streak']; // Example achieved badges

// Updated structure for currentProgram to include full exercise details and completion status
type EnrichedProgramExercise = ProgramExercise & { exerciseDetails: Exercise, completed: boolean };
type EnrichedProgram = Omit<Program, 'exercises'> & { exercises: EnrichedProgramExercise[] };

export default function PatientProgressPage() {
  const [isClient, setIsClient] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<EnrichedProgram | null>(null);
  const [progressStats, setProgressStats] = useState<PatientProgress | null>(null);
  const [exerciseCompletionData, setExerciseCompletionData] = useState<any[]>([]);

  const exerciseCompletionConfig = { completed: { label: "Completed %" } } satisfies ChartConfig;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Enrich the initial mock program data (similar to dashboard)
      const enrichedExercises = initialMockProgramData.exercises.map(ex => {
        const details = mockExerciseDetails[ex.exerciseId];
        const isCompleted = !!(ex.feedbackHistory && ex.feedbackHistory.length > 0);
        return {
          ...ex,
          exerciseDetails: details || {} as Exercise,
          completed: isCompleted,
        };
      });

      const enrichedProgram: EnrichedProgram = {
        ...initialMockProgramData,
        exercises: enrichedExercises,
      };
      setCurrentProgram(enrichedProgram);

      const completedCount = enrichedExercises.filter(ex => ex.completed).length;
      const totalCount = enrichedExercises.length;
      const overallCompletionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const generatedMockProgressStats: PatientProgress = {
        streak: 8, // Example streak
        badges: mockPatientBadges, 
        completionRate: overallCompletionRate,
      };
      setProgressStats(generatedMockProgressStats);

      // Prepare data for Exercise Completion chart
      const chartData = enrichedExercises.map((ex, index) => ({
        name: ex.exerciseDetails.name || `Exercise ${index + 1}`,
        completed: ex.completed ? 100 : 0, // For simplicity, 100% if any feedback, else 0%
        target: 100,
        fill: `hsl(var(--chart-${(index % 5) + 1}))` // Cycle through chart colors
      }));
      setExerciseCompletionData(chartData);
    }
  }, [isClient]);


  if (!isClient || !progressStats || !currentProgram) {
    return <div className="flex justify-center items-center h-screen"><PageLoaderIcon className="h-12 w-12 animate-spin text-primary" /></div>; 
  }
  
  const streakHistory = [ // True for completed day, false for missed. Last 30 days.
    ...Array(progressStats.streak).fill(true), // Show current streak
    ...Array(30 - progressStats.streak).fill(false) // Fill rest as missed/future for demo
  ].slice(0,30);


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Your Progress</h1>
          <p className="text-muted-foreground">Track your achievements and stay motivated!</p>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-primary"/>Overall Program Completion</CardTitle>
          <CardDescription>Your progress through the current exercise program: {currentProgram.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressStats.completionRate} className="h-6" />
          <p className="text-right text-lg font-semibold text-primary">{progressStats.completionRate}% Complete</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"><BarChart className="mr-2 h-5 w-5 text-primary"/>Exercise Completion</CardTitle>
            <CardDescription>Completion rates for individual exercises in your program.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={exerciseCompletionConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={exerciseCompletionData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={100} />
                  <Tooltip content={<ChartTooltipContent indicator="dashed" />} cursor={{fill: 'hsl(var(--muted))'}}/>
                  <Bar dataKey="completed" radius={4}>
                     {exerciseCompletionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"><Award className="mr-2 h-5 w-5 text-primary"/>Your Badges & Achievements</CardTitle>
            <CardDescription>Milestones you've unlocked on your recovery journey.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[300px]">
             <BadgeDisplay achievedBadgeIds={progressStats.badges} />
             <p className="mt-4 text-muted-foreground text-sm">Keep up the great work to earn more!</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary"/>Workout Consistency (Last 30 Days)</CardTitle>
          <CardDescription>A visual of your daily workout completion.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5 p-2 bg-muted/30 rounded-md">
            {Array.from({ length: 35 }).map((_, index) => {
              const dayInMockMonth = index % 30;
              const isCompleted = streakHistory[dayInMockMonth % streakHistory.length];
              let bgColor = 'bg-gray-200 dark:bg-gray-700';
              if (isCompleted === true) bgColor = 'bg-green-500';
              else if (isCompleted === false) bgColor = 'bg-red-300 dark:bg-red-800'; 
              
              return (
                <div 
                  key={index} 
                  className={`w-full aspect-square rounded ${bgColor} opacity-70 hover:opacity-100`}
                  title={isCompleted === true ? "Completed" : isCompleted === false ? "Missed" : "Future/Past"}
                />
              );
            })}
          </div>
           <p className="text-xs text-muted-foreground mt-2 text-center">Green: Completed, Red: Missed (mock data shown).</p>
        </CardContent>
      </Card>
    </div>
  );
}

