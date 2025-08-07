
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Exercise, Program, ProgramExercise, Patient } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2, Save, Brain, Info, Loader2, ListPlus, Wand2, Copy, RefreshCw, ArrowRightLeft, Lightbulb } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { buildProgram, type BuildProgramInput, type BuildProgramOutput } from '@/ai/flows/ai-program-builder';
import { aiExerciseSearch } from '@/ai/flows/ai-exercise-search';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { addClinicianProgram, updateClinicianProgram, clinicianAssignedPrograms } from '@/app/clinician/programs/page';
import { mockPatientsData, updatePatient } from '@/app/clinician/patients/page';
import { addPatientNotification } from '@/lib/data/mock-notifications'; // Import notification function

interface ProgramBuilderProps {
  patients: Patient[];
  exerciseLibrary: Exercise[];
  programTemplates?: Program[];
  onSaveProgram: (program: Omit<Program, 'id' | 'createdAt' | 'status'>) => Promise<void>;
}

const initialProgramExerciseValues: Omit<ProgramExercise, 'exerciseId'> = { sets: "3", reps: "10", duration: "", rest: "60s", notes: "" };
const NO_TEMPLATE_VALUE = "__NONE__";

export function ProgramBuilder({ patients, exerciseLibrary, programTemplates, onSaveProgram }: ProgramBuilderProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [programIdToEdit, setProgramIdToEdit] = useState<string | null>(null);
  const [programName, setProgramName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [currentExercises, setCurrentExercises] = useState<(ProgramExercise & { exerciseDetails: Exercise })[]>([]);

  const [manualSearchTerm, setManualSearchTerm] = useState('');
  const [aiSearchTerm, setAiSearchTerm] = useState('');
  const [isAiLibSearching, setIsAiLibSearching] = useState(false);
  const [aiLibSearchResults, setAiLibSearchResults] = useState<Exercise[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isAiSuggestingProgram, setIsAiSuggestingProgram] = useState(false);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [programDescription, setProgramDescription] = useState<string>('');

  const [isProgressionModalOpen, setIsProgressionModalOpen] = useState(false);
  const [progressionSuggestion, setProgressionSuggestion] = useState<BuildProgramOutput['modifiedExerciseSuggestion'] | null>(null);
  const [exerciseForProgression, setExerciseForProgression] = useState<Exercise | null>(null);
  const [isSuggestingProgression, setIsSuggestingProgression] = useState(false);

  const [isProgramModificationModalOpen, setIsProgramModificationModalOpen] = useState(false);
  const [programModificationGoal, setProgramModificationGoal] = useState('');
  const [programModificationOutput, setProgramModificationOutput] = useState<Pick<BuildProgramOutput, 'overallProgramModificationAdvice' | 'exerciseSpecificSuggestions'>>({});
  const [isModifyingProgramAI, setIsModifyingProgramAI] = useState(false);


  const loadProgramForEditing = useCallback((progId: string, patId?: string) => {
    const programToEdit = clinicianAssignedPrograms.find(p => p.id === progId);
    if (programToEdit) {
        setProgramName(programToEdit.name);
        setProgramDescription(programToEdit.description || '');
        if(patId) setSelectedPatientId(patId); else if(programToEdit.patientId) setSelectedPatientId(programToEdit.patientId);

        const loadedExercises = programToEdit.exercises.map(te => {
            const details = exerciseLibrary.find(libEx => libEx.id === te.exerciseId);
            return details ? { ...initialProgramExerciseValues, ...te, exerciseDetails: details } : null;
        }).filter(Boolean) as (ProgramExercise & { exerciseDetails: Exercise })[];
        setCurrentExercises(loadedExercises);
        setProgramIdToEdit(progId);
        toast({ title: "Program Loaded for Editing", description: `Editing "${programToEdit.name}".` });
    }
  }, [exerciseLibrary, toast]);


  const handleClearProgram = useCallback(() => {
    setProgramName('');
    setProgramDescription('');
    setCurrentExercises([]);
    setSelectedTemplateId(''); 
    setProgramIdToEdit(null); 
    toast({ title: 'Program Cleared', description: 'Current program details and exercises have been reset.' });
  }, [toast]);

  const handleLoadTemplate = useCallback((templateId: string, fromQueryParam = false) => {
    const template = programTemplates?.find(t => t.id === templateId);
    if (template) {
      setProgramName(template.name);
      setProgramDescription(template.description || '');
      const templateExercises = template.exercises.map(te => {
        const details = exerciseLibrary.find(libEx => libEx.id === te.exerciseId);
        return details ? { ...initialProgramExerciseValues, ...te, exerciseDetails: details } : null;
      }).filter(Boolean) as (ProgramExercise & { exerciseDetails: Exercise })[];
      setCurrentExercises(templateExercises);
      setSelectedTemplateId(templateId);
      setProgramIdToEdit(null); 
      const message = fromQueryParam ? `Program "${template.name}" loaded from link.` : `Program "${template.name}" loaded.`;
      toast({ title: "Template Loaded", description: message });
    }
  }, [programTemplates, exerciseLibrary, toast]);


  useEffect(() => {
    const templateIdFromQuery = searchParams.get('templateId');
    const programIdFromQuery = searchParams.get('programId');
    const patientIdFromQuery = searchParams.get('patientId');

    if (programIdFromQuery) {
        loadProgramForEditing(programIdFromQuery, patientIdFromQuery || undefined);
    } else if (templateIdFromQuery && programTemplates && programTemplates.length > 0) {
      handleLoadTemplate(templateIdFromQuery, true);
    }
  }, [searchParams, programTemplates, loadProgramForEditing, handleLoadTemplate]);


  const availableExercisesForManualSearch = exerciseLibrary.filter(ex =>
    ex.name.toLowerCase().includes(manualSearchTerm.toLowerCase()) ||
    ex.category.toLowerCase().includes(manualSearchTerm.toLowerCase())
  ).slice(0, 10);


  const handleAiLibSearch = async () => {
    if (!aiSearchTerm.trim()) return;
    setIsAiLibSearching(true);
    setAiLibSearchResults([]);
    try {
      const result = await aiExerciseSearch({ query: aiSearchTerm });
      const foundExercises = result.results
        .map(name => exerciseLibrary.find(ex => ex.name === name))
        .filter(Boolean) as Exercise[];
      setAiLibSearchResults(foundExercises);
       if (foundExercises.length === 0) {
        toast({ title: "AI Search", description: "No direct matches found. Try refining your AI search query." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "AI Search Error", description: "Could not perform AI library search." });
    } finally {
      setIsAiLibSearching(false);
    }
  };

  const addExerciseToProgram = (exercise: Exercise, params?: Partial<ProgramExercise>) => {
    if (currentExercises.find(e => e.exerciseId === exercise.id)) {
      toast({ variant: 'default', title: 'Exercise already in program', description: `${exercise.name} is already part of this program.`});
      return;
    }
    setCurrentExercises(prev => [...prev, {
      ...initialProgramExerciseValues,
      ...params,
      exerciseId: exercise.id,
      exerciseDetails: exercise
    }]);
  };

  const removeExerciseFromProgram = (exerciseId: string) => {
    setCurrentExercises(prev => prev.filter(ex => ex.exerciseId !== exerciseId));
  };

  const updateExerciseParam = (exerciseId: string, param: keyof ProgramExercise, value: string | number) => {
    setCurrentExercises(prev => prev.map(ex =>
      ex.exerciseId === exerciseId ? { ...ex, [param]: String(value) } : ex
    ));
  };

  const handleAiSuggestInitialProgram = async () => {
    if (!selectedPatientId) {
      toast({ variant: 'destructive', title: 'Patient Not Selected', description: 'Please select a patient to get AI suggestions.' });
      return;
    }
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient || !patient.conditions || patient.conditions.length === 0) {
      toast({ variant: 'destructive', title: 'Patient Conditions Missing', description: 'Selected patient has no conditions specified for AI suggestions.' });
      return;
    }

    setIsAiSuggestingProgram(true);
    setCurrentExercises([]); 
    try {
      const input: BuildProgramInput = {
        patientConditions: patient.conditions.join(', '),
        exerciseLibrary: exerciseLibrary.map(ex => ex.name).join('; '),
      };
      const result = await buildProgram(input);

      if (result.suggestedExercises && result.suggestedExercises.length > 0) {
        const newExercises = result.suggestedExercises.map((name, index) => {
          const detail = exerciseLibrary.find(ex => ex.name === name);
          const params = parseParams(result.suggestedParameters?.[index] || "");
          return detail ? { ...initialProgramExerciseValues, ...params, exerciseId: detail.id, exerciseDetails: detail } : null;
        }).filter(Boolean) as (ProgramExercise & { exerciseDetails: Exercise })[];
        setCurrentExercises(newExercises);
        if(!programName && patient.conditions.length > 0) {
          setProgramName(`${patient.conditions[0]} Program - Initial Phase`);
        }
        toast({ title: 'AI Program Suggested', description: `Added ${newExercises.length} exercises based on patient conditions.` });
      } else {
        toast({ title: 'No AI Suggestions', description: `Could not find specific exercises for "${patient.conditions.join(', ')}". Try adding exercises manually.` });
      }
    } catch (error) {
      console.error("AI program builder error:", error);
      toast({ variant: 'destructive', title: 'AI Suggestion Failed', description: 'Could not generate AI suggestions.' });
    } finally {
      setIsAiSuggestingProgram(false);
    }
  };

  const handleSuggestModification = async (exercise: Exercise, type: 'progression' | 'regression') => {
    setExerciseForProgression(exercise);
    setIsSuggestingProgression(true);
    setIsProgressionModalOpen(true);
    setProgressionSuggestion(null);
    try {
      const input: BuildProgramInput = {
        exerciseToModify: exercise.name,
        modificationType: type,
        exerciseLibrary: exerciseLibrary.map(ex => ex.name).join('; '),
      };
      const result = await buildProgram(input);
      if (result.modifiedExerciseSuggestion) {
        setProgressionSuggestion(result.modifiedExerciseSuggestion);
      } else {
        toast({ title: `No ${type} Found`, description: `AI could not suggest a ${type} for ${exercise.name}.` });
        setIsProgressionModalOpen(false); 
      }
    } catch (error) {
      toast({ variant: "destructive", title: "AI Suggestion Error", description: `Failed to get ${type}.`});
      setIsProgressionModalOpen(false);
    } finally {
      setIsSuggestingProgression(false);
    }
  };

  const handleApplyProgression = () => {
    if (!progressionSuggestion || !exerciseForProgression) return;
    const newExDetail = exerciseLibrary.find(ex => ex.name === progressionSuggestion.newExerciseName);
    if (newExDetail) {
      const newParams = parseParams(progressionSuggestion.newParameters);
      setCurrentExercises(prev => prev.map(ex =>
        ex.exerciseId === exerciseForProgression.id
        ? { ...initialProgramExerciseValues, ...newParams, exerciseId: newExDetail.id, exerciseDetails: newExDetail, notes: progressionSuggestion.reason }
        : ex
      ));
      toast({ title: "Exercise Swapped", description: `${exerciseForProgression.name} replaced with ${newExDetail.name}.` });
    } else {
      toast({ variant: "destructive", title: "Swap Failed", description: `Could not find ${progressionSuggestion.newExerciseName} in library.` });
    }
    setIsProgressionModalOpen(false);
    setProgressionSuggestion(null);
    setExerciseForProgression(null);
  };

  const handleOpenProgramModification = () => {
    if(currentExercises.length === 0) {
      toast({variant: 'destructive', title: 'Empty Program', description: 'Add exercises before requesting AI modifications.'});
      return;
    }
    setProgramModificationGoal('');
    setProgramModificationOutput({});
    setIsProgramModificationModalOpen(true);
  };

  const handleRequestProgramModification = async () => {
    if (!programModificationGoal.trim()) {
      toast({variant: 'destructive', title: 'Input Required', description: 'Please provide a goal or feedback.'});
      return;
    }
    setIsModifyingProgramAI(true);
    setProgramModificationOutput({});
    try {
      const input: BuildProgramInput = {
        existingProgramExercises: currentExercises.map(ex => ({
          exerciseName: ex.exerciseDetails.name,
          sets: String(ex.sets),
          reps: String(ex.reps),
          duration: ex.duration
        })),
        newGoalOrFeedback: programModificationGoal,
        exerciseLibrary: exerciseLibrary.map(exL => exL.name).join('; ')
      };
      const result = await buildProgram(input);
      setProgramModificationOutput({
        overallProgramModificationAdvice: result.overallProgramModificationAdvice,
        exerciseSpecificSuggestions: result.exerciseSpecificSuggestions
      });
      if (!result.overallProgramModificationAdvice && (!result.exerciseSpecificSuggestions || result.exerciseSpecificSuggestions.length === 0)) {
        toast({title: "No Specific Modifications", description: "AI did not suggest specific changes. Review general advice if provided."});
      }
    } catch (error) {
      toast({variant: 'destructive', title: 'AI Modification Error', description: 'Failed to get program modifications.'});
    } finally {
      setIsModifyingProgramAI(false);
    }
  };

  const handleApplySingleModification = (suggestion: NonNullable<BuildProgramOutput['exerciseSpecificSuggestions']>[number]) => {
    const { exerciseName, suggestedAction, newExerciseName, newParameterSuggestion, reason } = suggestion;
    let exerciseApplied = false;

    if (suggestedAction === 'remove') {
        const targetEx = currentExercises.find(ex => ex.exerciseDetails.name === exerciseName);
        if(targetEx) {
            removeExerciseFromProgram(targetEx.exerciseId);
            exerciseApplied = true;
        }
    } else if (suggestedAction === 'add' && newExerciseName) {
        const detail = exerciseLibrary.find(libEx => libEx.name === newExerciseName);
        if (detail) {
            addExerciseToProgram(detail, newParameterSuggestion ? parseParams(newParameterSuggestion) : undefined);
            exerciseApplied = true;
        }
    } else if (suggestedAction === 'replace' && newExerciseName) {
        const oldEx = currentExercises.find(ex => ex.exerciseDetails.name === exerciseName);
        const newExDetail = exerciseLibrary.find(libEx => libEx.name === newExerciseName);
        if (oldEx && newExDetail) {
            const newParams = newParameterSuggestion ? parseParams(newParameterSuggestion) : {};
            setCurrentExercises(prev => prev.map(ex =>
                ex.exerciseId === oldEx.exerciseId
                ? { ...initialProgramExerciseValues, ...newParams, exerciseId: newExDetail.id, exerciseDetails: newExDetail, notes: reason }
                : ex
            ));
            exerciseApplied = true;
        }
    } else if (suggestedAction === 'modify_params' && newParameterSuggestion) {
        const targetEx = currentExercises.find(ex => ex.exerciseDetails.name === exerciseName);
        if(targetEx) {
            const updatedParams = parseParams(newParameterSuggestion);
            setCurrentExercises(prev => prev.map(ex =>
                ex.exerciseId === targetEx.exerciseId
                ? { ...ex, ...updatedParams, notes: ex.notes ? `${ex.notes}; ${reason}` : reason }
                : ex
            ));
            exerciseApplied = true;
        }
    }

    if (exerciseApplied) {
        toast({ title: "Modification Applied", description: `Suggestion for "${exerciseName}" applied.` });
        // Remove the applied suggestion from the list to prevent re-application
        setProgramModificationOutput(prev => ({
            ...prev,
            exerciseSpecificSuggestions: prev.exerciseSpecificSuggestions?.filter(s => 
                !(s.exerciseName === exerciseName && s.suggestedAction === suggestedAction && s.newExerciseName === newExerciseName)
            )
        }));
    } else {
         toast({ variant: 'destructive', title: "Application Failed", description: `Could not apply suggestion for "${exerciseName}". Exercise details might be missing or action is unclear.` });
    }
  };
  
  const handleSaveProgram = async () => {
    if (!programName || !selectedPatientId || currentExercises.length === 0) {
      toast({ variant: 'destructive', title: 'Incomplete Program', description: 'Please provide a program name, select a patient, and add at least one exercise.' });
      return;
    }
    setIsLoading(true);

    const isEditingExistingProgram = !!programIdToEdit && clinicianAssignedPrograms.some(p => p.id === programIdToEdit);
    let finalProgramData: Program;

    if (isEditingExistingProgram) {
      const existingProgram = clinicianAssignedPrograms.find(p => p.id === programIdToEdit)!;
      finalProgramData = {
        ...existingProgram,
        name: programName,
        description: programDescription,
        patientId: selectedPatientId,
        exercises: currentExercises.map(({ exerciseDetails, ...params }) => params),
        status: 'active', 
      };
      updateClinicianProgram(finalProgramData);
    } else { 
      finalProgramData = {
        id: `prog_${Date.now()}`,
        name: programName,
        description: programDescription,
        patientId: selectedPatientId,
        clinicianId: 'doc_current', 
        exercises: currentExercises.map(({ exerciseDetails, ...params }) => params),
        createdAt: new Date().toISOString(),
        status: 'active',
        assignedDate: new Date().toISOString(),
        adherenceRate: 0,
        isTemplate: false,
      };
      addClinicianProgram(finalProgramData);
    }

    const patientToUpdate = mockPatientsData.find(p => p.id === selectedPatientId);
    if (patientToUpdate) {
      updatePatient({ ...patientToUpdate, currentProgramId: finalProgramData.id });
    }
    
    try {
      await onSaveProgram(finalProgramData); // External action, if any

      addPatientNotification(selectedPatientId, {
        title: `Program ${isEditingExistingProgram ? 'Updated' : 'Assigned'}: ${finalProgramData.name}`,
        description: `Your clinician has ${isEditingExistingProgram ? 'updated' : 'assigned'} your exercise program. Check "My Program" in your portal.`,
        type: 'success',
        link: '/patient/program'
      });

      toast({ title: `Program ${isEditingExistingProgram ? 'Updated' : 'Saved & Assigned'}!`, description: `"${finalProgramData.name}" for ${patients.find(p=>p.id === selectedPatientId)?.name}.` });
      handleClearProgram();
      setSelectedPatientId(''); // Clear patient selection after successful assignment
    } catch (error) {
      console.error("Save program error:", error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the program.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{programIdToEdit ? "Edit Assigned Program" : "Program Details"}</CardTitle>
            <CardDescription>Define the program name, assign it to a patient, or load from a template.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <Input
              placeholder="Program Name (e.g., Post-ACL Rehab Week 1)"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="text-base"
            />
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId} disabled={!!programIdToEdit && !!patients.find(p=>p.id === selectedPatientId)}>
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Select Patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} {p.conditions && p.conditions.length > 0 ? `(${p.conditions.join(', ')})` : ''}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Program Description (Optional)"
              value={programDescription}
              onChange={(e) => setProgramDescription(e.target.value)}
              className="sm:col-span-2 text-sm"
              rows={2}
            />
            {programTemplates && programTemplates.length > 0 && !programIdToEdit && (
              <div className="sm:col-span-2">
                <Select
                  value={selectedTemplateId}
                  onValueChange={(value) => {
                    if (value === NO_TEMPLATE_VALUE) {
                      setSelectedTemplateId(''); 
                      handleClearProgram();
                    } else {
                      setSelectedTemplateId(value); 
                      handleLoadTemplate(value);
                    }
                  }}
                >
                  <SelectTrigger className="text-base">
                    <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Load from Template (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TEMPLATE_VALUE}><em>None (Start Fresh)</em></SelectItem>
                    {programTemplates.filter(t => t.status === 'active' || t.status === 'template').map(template => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl font-headline">
              <span>Program Exercises ({currentExercises.length})</span>
               <Button variant="outline" size="sm" onClick={handleAiSuggestInitialProgram} disabled={isAiSuggestingProgram || !selectedPatientId}>
                {isAiSuggestingProgram ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4 text-primary" />}
                AI Suggest Initial Program
              </Button>
            </CardTitle>
             <CardDescription>
              Add exercises manually or use AI. After adding exercises, you can ask AI to review the entire program based on new goals or feedback using the "AI: Review & Modify" button below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentExercises.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No exercises added yet. Use the panel on the right or AI suggestions.</p>
            )}
            <ScrollArea className={cn("space-y-4", currentExercises.length > 0 ? "max-h-[500px] p-1" : "")}>
              {currentExercises.map((progEx) => (
                <Card key={progEx.exerciseId} className="p-3 bg-muted/30 relative group mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                         <Image src={progEx.exerciseDetails.thumbnailUrl || `https://placehold.co/40x40.png?text=${progEx.exerciseDetails.name.charAt(0)}`} alt={progEx.exerciseDetails.name} width={40} height={40} className="rounded object-cover" data-ai-hint="exercise fitness"/>
                        <div>
                            <h4 className="font-semibold">{progEx.exerciseDetails.name}</h4>
                            <p className="text-xs text-muted-foreground">{progEx.exerciseDetails.category} - {progEx.exerciseDetails.difficulty}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeExerciseFromProgram(progEx.exerciseId)} className="text-destructive hover:bg-destructive/10 h-7 w-7">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <Input placeholder="Sets" value={progEx.sets || ''} onChange={(e) => updateExerciseParam(progEx.exerciseId, 'sets', e.target.value)} className="text-sm" />
                    <Input placeholder="Reps" value={progEx.reps || ''} onChange={(e) => updateExerciseParam(progEx.exerciseId, 'reps', e.target.value)} className="text-sm" />
                    <Input placeholder="Duration (e.g., 30s)" value={progEx.duration || ''} onChange={(e) => updateExerciseParam(progEx.exerciseId, 'duration', e.target.value)} className="text-sm" />
                    <Input placeholder="Rest (e.g., 60s)" value={progEx.rest || ''} onChange={(e) => updateExerciseParam(progEx.exerciseId, 'rest', e.target.value)} className="text-sm" />
                  </div>
                  <Textarea
                    placeholder="Notes for this exercise (e.g., focus on form)"
                    value={progEx.notes || ''}
                    onChange={(e) => updateExerciseParam(progEx.exerciseId, 'notes', e.target.value)}
                    className="mt-2 text-sm"
                    rows={1}
                  />
                  <div className="mt-2 flex gap-2">
                    <Button size="xs" variant="outline" onClick={() => handleSuggestModification(progEx.exerciseDetails, 'progression')} disabled={isSuggestingProgression}>Suggest Progression</Button>
                    <Button size="xs" variant="outline" onClick={() => handleSuggestModification(progEx.exerciseDetails, 'regression')} disabled={isSuggestingProgression}>Suggest Regression</Button>
                  </div>
                </Card>
              ))}
            </ScrollArea>
          </CardContent>
           <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
             <Button variant="outline" onClick={handleClearProgram} className="w-full sm:w-auto" disabled={currentExercises.length === 0 && !programName && !selectedTemplateId && !programDescription}>
                <RefreshCw className="mr-2 h-4 w-4" /> Clear All
              </Button>
              <Button onClick={handleOpenProgramModification} variant="outline" className="w-full sm:w-auto flex-grow" disabled={currentExercises.length === 0}>
                <Lightbulb className="mr-2 h-4 w-4 text-yellow-500"/> AI: Review & Modify Program
              </Button>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full sm:w-auto flex-grow" size="lg" disabled={isLoading || currentExercises.length === 0 || !programName || !selectedPatientId}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {programIdToEdit ? "Update Program" : "Save & Assign Program"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm {programIdToEdit ? "Update" : "Save & Assign"} Program</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to {programIdToEdit ? "update" : "save and assign"} the program "{programName || 'Untitled Program'}" for {patients.find(p=>p.id === selectedPatientId)?.name || 'the selected patient'}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSaveProgram}>{programIdToEdit ? "Update Program" : "Save & Assign"}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20 self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center"><ListPlus className="mr-2 h-5 w-5 text-primary"/>Exercise Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Manually search library..."
              value={manualSearchTerm}
              onChange={(e) => setManualSearchTerm(e.target.value)}
            />
            <div className="flex gap-2">
                 <Input
                    placeholder="AI: 'beginner shoulder exercises'"
                    value={aiSearchTerm}
                    onChange={(e) => setAiSearchTerm(e.target.value)}
                    className="flex-grow"
                />
                <Button onClick={handleAiLibSearch} disabled={isAiLibSearching} size="icon">
                    {isAiLibSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4"/>}
                </Button>
            </div>

            <ScrollArea className="h-[250px] pr-1">
              {(aiLibSearchResults.length > 0 ? aiLibSearchResults : manualSearchTerm ? availableExercisesForManualSearch : exerciseLibrary.slice(0,5)).map(ex => (
                <div key={ex.id} className="flex items-center justify-between p-1.5 hover:bg-muted/30 rounded-md">
                  <div className="flex items-center gap-2">
                    <Image
                      src={ex.thumbnailUrl || `https://placehold.co/32x32.png?text=${ex.name.charAt(0)}`}
                      alt={ex.name}
                      width={32}
                      height={32}
                      className="rounded object-cover"
                      data-ai-hint="exercise fitness"
                    />
                    <div>
                      <p className="text-sm font-medium">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">{ex.category}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => addExerciseToProgram(ex)} className="h-7 w-7">
                    <PlusCircle className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              ))}
              {manualSearchTerm && availableExercisesForManualSearch.length === 0 && !aiSearchTerm && (
                 <p className="text-xs text-muted-foreground text-center py-2">No exercises match manual search.</p>
              )}
              {aiSearchTerm && aiLibSearchResults.length === 0 && !isAiLibSearching && (
                 <p className="text-xs text-muted-foreground text-center py-2">No AI results for this query.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-accent/10 border-accent/30">
          <CardHeader className="pb-2">
             <CardTitle className="text-base font-semibold text-accent-foreground flex items-center"><Info className="mr-2 h-5 w-5 text-accent"/>Pro Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-accent-foreground/80">
              Use "AI Suggest Initial Program" for patient conditions. Then refine by adding/removing exercises or use "AI: Review & Modify" for specific feedback or goals.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progression/Regression Modal */}
      <Dialog open={isProgressionModalOpen} onOpenChange={setIsProgressionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Suggestion for {exerciseForProgression?.name}</DialogTitle>
            <DialogDescription>
              {isSuggestingProgression ? "Thinking..." : progressionSuggestion ? `AI suggests replacing with ${progressionSuggestion.newExerciseName}.` : "No suggestion available."}
            </DialogDescription>
          </DialogHeader>
          {isSuggestingProgression && <div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}
          {progressionSuggestion && !isSuggestingProgression && (
            <div className="space-y-2">
              <p><strong>New Exercise:</strong> {progressionSuggestion.newExerciseName}</p>
              <p><strong>Suggested Parameters:</strong> {progressionSuggestion.newParameters}</p>
              <p><strong>Reason:</strong> {progressionSuggestion.reason}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProgressionModalOpen(false)}>Cancel</Button>
            <Button onClick={handleApplyProgression} disabled={!progressionSuggestion || isSuggestingProgression}>
              <ArrowRightLeft className="mr-2 h-4 w-4" /> Apply Suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Program Modification Modal */}
      <Dialog open={isProgramModificationModalOpen} onOpenChange={setIsProgramModificationModalOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-yellow-500"/>AI: Review & Modify Program</DialogTitle>
                <DialogDescription>
                    Enter a new goal, patient feedback, or desired change for the current program. AI will suggest modifications.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3">
                <Textarea
                    placeholder="e.g., Patient finds lunges too difficult. Suggest alternatives. OR Focus on increasing endurance for all exercises."
                    value={programModificationGoal}
                    onChange={(e) => setProgramModificationGoal(e.target.value)}
                    rows={3}
                />
                <Button onClick={handleRequestProgramModification} disabled={isModifyingProgramAI || !programModificationGoal.trim()} className="w-full">
                    {isModifyingProgramAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Brain className="mr-2 h-4 w-4"/>}
                    Get AI Modification Suggestions
                </Button>

                {isModifyingProgramAI && <p className="text-sm text-muted-foreground text-center">AI is analyzing the program...</p>}

                {programModificationOutput.overallProgramModificationAdvice && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <h4 className="font-semibold text-blue-700 text-sm">Overall AI Advice:</h4>
                        <p className="text-xs text-blue-600">{programModificationOutput.overallProgramModificationAdvice}</p>
                    </div>
                )}
                {programModificationOutput.exerciseSpecificSuggestions && programModificationOutput.exerciseSpecificSuggestions.length > 0 && (
                     <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                        <h4 className="font-semibold text-sm sticky top-0 bg-background py-1">Specific Exercise Suggestions:</h4>
                        {programModificationOutput.exerciseSpecificSuggestions.map((sugg, idx) => (
                            <Card key={idx} className="p-2.5 text-xs bg-muted/40">
                                <p className="font-medium text-primary">{sugg.exerciseName} <span className="text-muted-foreground capitalize">({sugg.suggestedAction.replace('_', ' ')})</span></p>
                                {sugg.newExerciseName && <p><span className="text-muted-foreground">New:</span> {sugg.newExerciseName}</p>}
                                {sugg.newParameterSuggestion && <p><span className="text-muted-foreground">Params:</span> {sugg.newParameterSuggestion}</p>}
                                <p className="italic text-muted-foreground/80 mt-0.5">Reason: {sugg.reason}</p>
                                <Button size="xs" variant="outline" className="mt-1.5 h-6 px-1.5 py-0.5 text-xs" onClick={() => handleApplySingleModification(sugg)}>Apply This Change</Button>
                            </Card>
                        ))}
                    </div>
                )}

            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function parseParams(paramString: string): Partial<ProgramExercise> {
  const params: Partial<ProgramExercise> = {};
  if (!paramString) return params;
  const parts = paramString.split(/,\s*/);
  parts.forEach(part => {
    const [key, value] = part.split(/:\s*/);
    if (key && value) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('sets')) params.sets = value.trim();
      else if (lowerKey.includes('reps')) params.reps = value.trim();
      else if (lowerKey.includes('duration')) params.duration = value.trim();
      else if (lowerKey.includes('rest')) params.rest = value.trim();
    }
  });
  return params;
}


    