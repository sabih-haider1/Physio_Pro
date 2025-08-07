
"use client";

import { useState, useCallback, useMemo } from 'react'; // Added useMemo
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Added Label import
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Layers, PlusCircle, Trash2, Search, GripVertical } from 'lucide-react';
import type { Exercise, Program, ProgramExercise } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { initialMockExercises } from '@/app/admin/exercises/page';
import { addMockProgramTemplate } from '@/app/admin/program-templates/page'; // Import add function
import { cn } from '@/lib/utils';

const programExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Exercise ID is required"),
  sets: z.union([z.string(), z.number()]).optional(),
  reps: z.union([z.string(), z.number()]).optional(),
  duration: z.string().optional(),
  rest: z.string().optional(),
  notes: z.string().optional(),
});

const newTemplateFormSchema = z.object({
  name: z.string().min(3, { message: "Template name must be at least 3 characters." }),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived', 'template']).default('template'),
  exercises: z.array(programExerciseSchema).min(1, "Add at least one exercise to the template."),
});

type NewTemplateFormValues = z.infer<typeof newTemplateFormSchema>;

export default function NewProgramTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');

  const form = useForm<NewTemplateFormValues>({
    resolver: zodResolver(newTemplateFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      status: 'template',
      exercises: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const searchedExercises = useMemo(() => {
    if (!exerciseSearchTerm.trim()) return [];
    return initialMockExercises.filter(ex =>
      ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) &&
      !fields.some(f => f.exerciseId === ex.id)
    ).slice(0, 5);
  }, [exerciseSearchTerm, fields, initialMockExercises]); // Added initialMockExercises to dependency array

  const addExerciseToTemplate = (exercise: Exercise) => {
    if (fields.some(f => f.exerciseId === exercise.id)) {
      toast({ variant: 'default', title: 'Exercise already added' });
      return;
    }
    append({ exerciseId: exercise.id, sets: "3", reps: "10", duration: "", rest: "60s", notes: "" });
    setExerciseSearchTerm('');
  };

  const getExerciseDetails = useCallback((exerciseId: string): Exercise | undefined => {
    return initialMockExercises.find(ex => ex.id === exerciseId);
  }, [initialMockExercises]); // Added initialMockExercises to dependency array


  const onSubmit = async (data: NewTemplateFormValues) => {
    setIsLoading(true);
    const newTemplate: Program = {
      id: `tpl${Date.now()}`, // Simple unique ID
      isTemplate: true,
      clinicianId: 'admin-system', // Or logged-in admin's ID
      createdAt: new Date().toISOString(),
      ...data,
      exercises: data.exercises.map(ex => ({
        ...ex,
        sets: ex.sets ? String(ex.sets) : undefined,
        reps: ex.reps ? String(ex.reps) : undefined,
      })),
    };

    addMockProgramTemplate(newTemplate); // Add to central mock store
    console.log('New program template data added to mock store:', newTemplate);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Program Template Created',
      description: `Template "${data.name}" has been successfully created.`,
    });
    setIsLoading(false);
    router.push('/admin/program-templates');
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Template List
      </Button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <Layers className="mr-3 h-7 w-7" /> Add New Program Template
              </CardTitle>
              <CardDescription>Define a new reusable program template for clinicians.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl><Input placeholder="e.g., ACL Rehab - Phase 1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Briefly describe this template..." {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., Post-Surgery, Shoulder, Spine" {...field} /></FormControl>
                      <FormDescription>Helps clinicians find relevant templates.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="template">Template (Active)</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-headline">Template Exercises</CardTitle>
              <CardDescription>Add and configure exercises for this template.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20">
                <Label htmlFor="exerciseSearch">Add Exercise from Library</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="exerciseSearch"
                    placeholder="Search exercise by name..."
                    value={exerciseSearchTerm}
                    onChange={(e) => setExerciseSearchTerm(e.target.value)}
                    className="flex-grow"
                  />
                </div>
                {exerciseSearchTerm && searchedExercises.length > 0 && (
                  <ScrollArea className="mt-2 border rounded-md max-h-40">
                    {searchedExercises.map(ex => (
                      <div key={ex.id} className="p-2 flex items-center justify-between hover:bg-accent/20">
                        <div className="flex items-center gap-2">
                           <Image src={ex.thumbnailUrl || `https://placehold.co/30x30.png?text=${ex.name.charAt(0)}`} alt={ex.name} width={30} height={30} className="rounded object-cover" data-ai-hint="exercise fitness"/>
                           <span className="text-sm">{ex.name}</span>
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={() => addExerciseToTemplate(ex)}>
                          <PlusCircle className="h-4 w-4 mr-1"/> Add
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                )}
                {exerciseSearchTerm && searchedExercises.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">No exercises found matching "{exerciseSearchTerm}".</p>
                )}
              </div>

              {fields.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No exercises added to this template yet.</p>
              )}
              <FormField
                control={form.control}
                name="exercises"
                render={() => (
                    <FormItem className={fields.length > 0 ? "mt-4" : ""}>
                    {fields.map((field, index) => {
                       const exerciseDetail = getExerciseDetails(field.exerciseId);
                       return (
                        <Card key={field.id} className="mb-4 p-4 relative group bg-background">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{exerciseDetail?.name || `Exercise ID: ${field.exerciseId}`}</h4>
                              <p className="text-xs text-muted-foreground">{exerciseDetail?.category} - {exerciseDetail?.difficulty}</p>
                            </div>
                            <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10 h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <FormField
                                control={form.control}
                                name={`exercises.${index}.sets`}
                                render={({ field: itemField }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs">Sets</FormLabel>
                                    <FormControl><Input placeholder="e.g., 3" {...itemField} value={itemField.value || ''} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`exercises.${index}.reps`}
                                render={({ field: itemField }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs">Reps</FormLabel>
                                    <FormControl><Input placeholder="e.g., 10" {...itemField} value={itemField.value || ''} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`exercises.${index}.duration`}
                                render={({ field: itemField }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs">Duration</FormLabel>
                                    <FormControl><Input placeholder="e.g., 30s" {...itemField} value={itemField.value || ''} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`exercises.${index}.rest`}
                                render={({ field: itemField }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs">Rest</FormLabel>
                                    <FormControl><Input placeholder="e.g., 60s" {...itemField} value={itemField.value || ''} /></FormControl>
                                    </FormItem>
                                )}
                            />
                          </div>
                           <FormField
                                control={form.control}
                                name={`exercises.${index}.notes`}
                                render={({ field: itemField }) => (
                                    <FormItem className="mt-2">
                                    <FormLabel className="text-xs">Notes</FormLabel>
                                    <FormControl><Textarea placeholder="Specific instructions for this exercise..." {...itemField} value={itemField.value || ''} rows={2}/></FormControl>
                                    </FormItem>
                                )}
                            />
                        </Card>
                       );
                    })}
                     <FormMessage className="mt-2">{form.formState.errors.exercises?.message || form.formState.errors.exercises?.root?.message}</FormMessage>
                    </FormItem>
                )}
                />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/program-templates')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

