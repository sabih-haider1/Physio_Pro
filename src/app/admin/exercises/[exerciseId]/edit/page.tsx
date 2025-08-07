
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UploadCloud, Edit } from 'lucide-react';
import type { Exercise, ExerciseStatus } from '@/lib/types';
import { initialMockExercises, updateMockExercise } from '@/app/admin/exercises/page'; 

const exerciseStatuses: ExerciseStatus[] = ['active', 'pending', 'rejected'];
const difficulties: Exercise['difficulty'][] = ['Beginner', 'Intermediate', 'Advanced'];
const categories = ['Strength', 'Flexibility', 'Cardio', 'Mobility', 'Balance', 'Plyometrics', 'Rehab']; 

const editExerciseFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string({ required_error: "Category is required." }),
  difficulty: z.enum(difficulties as [Exercise['difficulty'], ...Exercise['difficulty'][]], { required_error: "Difficulty is required." }),
  bodyParts: z.string().min(1, { message: "Specify at least one body part." }).transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  equipment: z.string().optional(),
  videoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  thumbnailUrl: z.string().url({ message: "Please enter a valid URL for thumbnail." }).optional().or(z.literal('')),
  precautions: z.string().optional(),
  status: z.enum(exerciseStatuses as [ExerciseStatus, ...ExerciseStatus[]], { required_error: "Status is required." }),
  isFeatured: z.boolean().default(false),
  reps: z.string().optional(),
  sets: z.string().optional(),
  hold: z.string().optional(),
});

type EditExerciseFormValues = z.infer<typeof editExerciseFormSchema>;

export default function EditExercisePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const exerciseId = params.exerciseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [currentExerciseName, setCurrentExerciseName] = useState<string>('Loading...');

  const form = useForm<EditExerciseFormValues>({
    resolver: zodResolver(editExerciseFormSchema),
    defaultValues: {
      name: '', description: '', category: undefined, difficulty: undefined,
      bodyParts: [], equipment: '', videoUrl: '', thumbnailUrl: '', precautions: '', status: 'pending', isFeatured: false,
      reps: '', sets: '', hold: ''
    },
  });

  useEffect(() => {
    if (exerciseId) {
      setIsLoading(true);
      setTimeout(() => { 
        const fetchedExercise = initialMockExercises.find(ex => ex.id === exerciseId);
        if (fetchedExercise) {
          const formData: EditExerciseFormValues = {
            ...fetchedExercise,
            // Ensure bodyParts is always a string for the form input
            bodyParts: Array.isArray(fetchedExercise.bodyParts) ? fetchedExercise.bodyParts.join(', ') : (fetchedExercise.bodyParts || ''),
          };
          setCurrentExerciseName(fetchedExercise.name);
          form.reset(formData); 
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Exercise not found.' });
          router.push('/admin/exercises');
        }
        setIsLoading(false);
      }, 500);
    } else {
      router.push('/admin/exercises'); 
    }
  }, [exerciseId, form, router, toast]);

  const onSubmit = (data: EditExerciseFormValues) => {
    setIsLoading(true);
    
    const exerciseToUpdate = initialMockExercises.find(ex => ex.id === exerciseId);
    if (exerciseToUpdate) {
      const updatedData: Exercise = {
        ...exerciseToUpdate,
        ...data,
        // bodyParts are already transformed by Zod resolver on submit
        bodyParts: Array.isArray(data.bodyParts) ? data.bodyParts : data.bodyParts.split(',').map(s => s.trim()).filter(Boolean),
      };
      updateMockExercise(updatedData); 
    }

    setTimeout(() => {
      toast({
        title: 'Exercise Updated',
        description: `Changes for "${data.name}" have been saved.`,
      });
      setIsLoading(false);
      setCurrentExerciseName(data.name); 
    }, 1000);
  };

  const handleFileUpload = (fieldName: 'videoUrl' | 'thumbnailUrl') => {
     toast({ 
        title: "File Upload (Simulated)", 
        description: `Using placeholder for ${fieldName}.`
    });
     const placeholderUrl = `https://placehold.co/600x400.png?text=${fieldName === 'videoUrl' ? 'SampleVideo' : 'SampleThumb'}`;
     form.setValue(fieldName, placeholderUrl, { shouldValidate: true });
  };

  if (isLoading && !form.formState.isDirty && !form.formState.isSubmitted) { 
    return <div className="flex justify-center items-center h-64">Loading exercise data...</div>;
  }
  
  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercise List
      </Button>
      <Card className="max-w-3xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <Edit className="mr-3 h-7 w-7" /> Edit Exercise: {currentExerciseName}
          </CardTitle>
          <CardDescription>Modify the details for this exercise.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Exercise Name)</FormLabel>
                    <FormControl><Input placeholder="e.g., Standing Calf Raise" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Detailed instructions..." {...field} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="sets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Sets</FormLabel>
                      <FormControl><Input placeholder="e.g., 3 or 2-3" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Reps</FormLabel>
                      <FormControl><Input placeholder="e.g., 10 or 8-12" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Hold Duration</FormLabel>
                      <FormControl><Input placeholder="e.g., 30s or Hold 5s" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                        <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl>
                        <SelectContent>{difficulties.map(diff => <SelectItem key={diff} value={diff}>{diff}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="bodyParts"
                render={({ field: { onChange, value, ...rest }}) => (
                  <FormItem>
                    <FormLabel>Body Parts Targeted</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Legs, Glutes (comma-separated)" 
                        // Ensure value is always a string for the input
                        value={Array.isArray(value) ? value.join(', ') : value || ''}
                        onChange={e => onChange(e.target.value)} 
                        {...rest}
                      />
                    </FormControl>
                    <FormDescription>Enter a comma-separated list.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Dumbbells" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL (Optional)</FormLabel>
                      <div className="flex gap-2">
                        <FormControl><Input placeholder="https://example.com/thumb.jpg" {...field} value={field.value || ''} className="flex-grow"/></FormControl>
                         <Button type="button" variant="outline" onClick={() => handleFileUpload('thumbnailUrl')}><UploadCloud className="mr-2 h-4 w-4"/> Upload</Button>
                      </div>
                      <FormDescription>URL of the image for exercise thumbnail.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL (Optional)</FormLabel>
                       <div className="flex gap-2">
                        <FormControl><Input placeholder="https://example.com/video.mp4" {...field} value={field.value || ''} className="flex-grow"/></FormControl>
                        <Button type="button" variant="outline" onClick={() => handleFileUpload('videoUrl')}><UploadCloud className="mr-2 h-4 w-4"/> Upload</Button>
                      </div>
                      <FormDescription>URL of the video demonstrating the exercise.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="precautions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precautions (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Safety notes..." {...field} value={field.value || ''} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6 items-end"> 
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>{exerciseStatuses.map(stat => <SelectItem key={stat} value={stat} className="capitalize">{stat}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-muted/30 h-10">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal mb-0! leading-none">
                        Feature this exercise
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/exercises')} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
