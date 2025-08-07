
"use client";

import { useState, useEffect } from 'react';
import type { Exercise, ProgramExercise, ProgramExerciseFeedback } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle, Info, PlayCircle, Loader2, Eye } from 'lucide-react'; 
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { validateFeedback, type ValidateFeedbackInput } from '@/ai/flows/ai-driven-validation'; 
import Link from 'next/link'; 

interface PatientExerciseViewProps {
  exercise: Exercise; 
  programDetails: ProgramExercise; 
  onMarkComplete: (feedback: { painLevel: number, comments: string }) => void;
  isCompleted: boolean;
  feedbackHistory?: ProgramExerciseFeedback[]; 
}

export function PatientExerciseView({ exercise, programDetails, onMarkComplete, isCompleted, feedbackHistory }: PatientExerciseViewProps) {
  const { toast } = useToast();
  
  const latestFeedback = feedbackHistory && feedbackHistory.length > 0 ? feedbackHistory[feedbackHistory.length - 1] : null;
  
  const [painLevel, setPainLevel] = useState<number>(latestFeedback?.painLevel || 1);
  const [comments, setComments] = useState<string>(latestFeedback?.comments || '');
  const [timer, setTimer] = useState<number>(0); 
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(isCompleted); 
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const numericDuration = parseInt(String(programDetails.duration)?.replace(/[^0-9]/g, '') || '0');

  useEffect(() => {
    const latestFb = feedbackHistory && feedbackHistory.length > 0 ? feedbackHistory[feedbackHistory.length - 1] : null;
    if (isCompleted && latestFb) {
        setPainLevel(latestFb.painLevel);
        setComments(latestFb.comments);
        setShowFeedbackForm(true);
    } else if (!isCompleted) {
        setPainLevel(1);
        setComments('');
        setShowFeedbackForm(false);
    }
  }, [isCompleted, feedbackHistory, exercise.id]);


  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timer === 0) {
      setIsTimerRunning(false);
      toast({ title: "Timer Finished!", description: `${exercise.name} duration complete.` });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, exercise.name, toast]);

  const handleStartTimer = () => {
    if (numericDuration > 0) {
      setTimer(numericDuration);
      setIsTimerRunning(true);
    }
  };

  const handleComplete = async () => {
    if (painLevel < 1 || painLevel > 10) {
        toast({ variant: 'destructive', title: 'Invalid Pain Level', description: 'Please select a pain level between 1 and 10.' });
        return;
    }
    setIsSubmitting(true);
    try {
      const validationInput: ValidateFeedbackInput = {
        exerciseName: exercise.name,
        painLevel: painLevel,
        comments: comments,
      };
      const validationResult = await validateFeedback(validationInput);

      if (!validationResult.isValid) {
        toast({
          variant: 'destructive',
          title: 'Feedback Requires Attention',
          description: validationResult.suggestions || 'Please provide more detailed or clear feedback.',
          duration: 7000, 
        });
        setIsSubmitting(false);
        return;
      }
      
      onMarkComplete({ painLevel, comments });
      toast({ title: "Exercise Completed!", description: `${exercise.name} marked as complete with your feedback.` });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({ variant: 'destructive', title: 'Submission Error', description: 'Could not save feedback. Please try again.'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const painGradient = (level: number) => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-headline text-primary">{exercise.name}</CardTitle>
        <CardDescription>{exercise.category} - {exercise.difficulty}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
            <video
              key={exercise.videoUrl} 
              src={exercise.videoUrl} 
              controls
              className="w-full h-full object-cover"
              poster={exercise.thumbnailUrl || `https://placehold.co/600x400.png?text=Video+Preview`}
              data-ai-hint="exercise video"
              aria-label={`Video demonstration of ${exercise.name}`}
            >
              Your browser does not support the video tag.
            </video>
        </div>

        <div className="p-4 bg-muted/50 rounded-md">
          <h4 className="font-semibold text-lg mb-2">Instructions:</h4>
          <p className="text-sm text-foreground whitespace-pre-line">{exercise.description || "Follow video instructions."}</p>
        </div>

        {exercise.precautions && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <h5 className="font-semibold">Precautions:</h5>
              <p className="text-sm">{exercise.precautions}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Sets', value: programDetails.sets },
            { label: 'Reps', value: programDetails.reps },
            { label: 'Duration', value: programDetails.duration || '-' },
            { label: 'Rest', value: programDetails.rest || '-' },
          ].map(detail => (
            (detail.value || String(detail.value) === '0') ? ( 
              <div key={detail.label} className="p-3 bg-secondary rounded-md">
                <p className="text-xs text-secondary-foreground/70">{detail.label}</p>
                <p className="text-lg font-semibold text-secondary-foreground">{String(detail.value)}</p>
              </div>
            ) : null
          ))}
        </div>

        {numericDuration > 0 && (
          <div className="text-center">
            {isTimerRunning ? (
              <p className="text-4xl font-bold text-primary">{formatTime(timer)}</p>
            ) : (
              <Button onClick={handleStartTimer} variant="outline" size="lg" disabled={isCompleted}>
                <PlayCircle className="mr-2 h-5 w-5" /> Start Timer ({programDetails.duration})
              </Button>
            )}
          </div>
        )}
        
        {!isCompleted && !showFeedbackForm && (
          <Button onClick={() => setShowFeedbackForm(true)} size="lg" className="w-full">
            Provide Feedback & Mark Complete
          </Button>
        )}
        
        {(showFeedbackForm || isCompleted) && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold text-center">
                {isCompleted && latestFeedback ? "Your Submitted Feedback" : "Your Feedback"}
            </h3>
             {isCompleted && latestFeedback?.acknowledgedByClinician && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 flex items-center gap-2 text-sm justify-center">
                    <Eye className="h-4 w-4" /> Clinician has reviewed this feedback.
                </div>
            )}
            <div>
              <Label htmlFor="painLevel" className="text-base flex justify-between items-center mb-1">
                <span>Pain Level (1-10):</span> 
                <span className={`px-2 py-0.5 rounded-full text-xs text-white ${painGradient(painLevel)}`}>{painLevel}</span>
              </Label>
              <Slider
                id="painLevel"
                min={1} max={10} step={1}
                value={[painLevel]}
                onValueChange={(value) => setPainLevel(value[0])}
                disabled={isCompleted || isSubmitting} 
                className="my-3"
              />
               <div className="flex justify-between text-xs text-muted-foreground">
                <span>No Pain</span>
                <span>Moderate</span>
                <span>Severe Pain</span>
              </div>
            </div>
            <div>
              <Label htmlFor="comments" className="text-base">Comments:</Label>
              <Textarea
                id="comments"
                placeholder="How did this exercise feel? Any difficulties?"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                disabled={isCompleted || isSubmitting} 
                className="mt-1"
              />
            </div>
            {!isCompleted && (
              <Button onClick={handleComplete} disabled={isSubmitting} size="lg" className="w-full">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Submitting...' : 'Submit Feedback & Complete'}
              </Button>
            )}
          </div>
        )}
        
        {isCompleted && !showFeedbackForm && ( 
           <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center gap-3 text-center justify-center">
            <CheckCircle className="h-6 w-6" />
            <p className="font-semibold text-lg">Exercise Completed!</p>
            <Button variant="link" size="sm" onClick={() => setShowFeedbackForm(true)}>View/Edit Feedback</Button>
          </div>
        )}

      </CardContent>
      <CardFooter className="flex justify-center p-4">
        <Link href="/patient/program" className="text-sm text-primary hover:underline">
          Back to Full Program
        </Link>
      </CardFooter>
    </Card>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
