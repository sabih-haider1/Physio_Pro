
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpenCheck, UploadCloud } from 'lucide-react';
import type { EducationalResource } from '@/lib/types';
import { addEducationalResource } from '@/lib/data/mock-educational-resources'; 

const resourceStatuses: EducationalResource['status'][] = ['draft', 'published', 'archived'];
const resourceTypes: EducationalResource['type'][] = ['article', 'video'];

const newResourceFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  type: z.enum(resourceTypes, { required_error: "Resource type is required." }),
  summary: z.string().min(20, { message: "Summary must be at least 20 characters." }).max(500, "Summary too long."),
  content: z.string().optional(), 
  contentUrl: z.string().url({ message: "Please enter a valid URL for videos or external articles." }).optional().or(z.literal('')),
  thumbnailUrl: z.string().url({ message: "Please enter a valid URL for thumbnail." }).optional().or(z.literal('')),
  tags: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  estimatedReadTime: z.string().optional(),
  status: z.enum(resourceStatuses, { required_error: "Status is required." }),
}).refine(data => data.type === 'video' ? !!data.contentUrl : true, {
  message: "Content URL is required for video resources.",
  path: ["contentUrl"],
});

type NewResourceFormValues = z.infer<typeof newResourceFormSchema>;

export default function NewEducationalResourcePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NewResourceFormValues>({
    resolver: zodResolver(newResourceFormSchema),
    defaultValues: {
      title: '',
      type: 'article',
      summary: '',
      content: '',
      contentUrl: '',
      thumbnailUrl: '',
      tags: [],
      estimatedReadTime: '',
      status: 'draft',
    },
  });

  const onSubmit = async (data: NewResourceFormValues) => {
    setIsLoading(true);
    
    const newResourceData: Omit<EducationalResource, 'id' | 'createdAt' | 'updatedAt'> = {
      ...data,
      // Tags are already transformed by Zod resolver on submit
      tags: Array.isArray(data.tags) ? data.tags : (data.tags as unknown as string).split(',').map(s => s.trim()).filter(Boolean),
    };
    
    addEducationalResource(newResourceData);
    
    await new Promise(resolve => setTimeout(resolve, 700)); 

    toast({
      title: 'Educational Resource Created',
      description: `Resource "${data.title}" has been added.`,
    });
    setIsLoading(false);
    router.push('/admin/content/education'); 
  };
  
  const handleFileUpload = (fieldName: 'thumbnailUrl') => {
     toast({ 
        title: "File Upload (Simulated)", 
        description: `Using placeholder for ${fieldName}.`
    });
     const placeholderUrl = `https://placehold.co/300x170.png?text=UploadedThumb`;
     form.setValue(fieldName, placeholderUrl, { shouldValidate: true });
  };

  const selectedType = form.watch('type');

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resource List
      </Button>
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <BookOpenCheck className="mr-3 h-7 w-7" /> Add New Educational Resource
          </CardTitle>
          <CardDescription>Provide details for the new educational content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Understanding ACL Injuries" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>{resourceTypes.map(type => <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl><Textarea placeholder="A brief overview of the content..." {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedType === 'article' && (
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Article Content</FormLabel>
                      <FormControl><Textarea placeholder="Write the full article here... Supports basic Markdown." {...field} value={field.value || ''} rows={10} /></FormControl>
                      <FormDescription>You can use Markdown for formatting.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedType === 'video' && (
                 <FormField
                  control={form.control}
                  name="contentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl><Input placeholder="https://youtube.com/watch?v=example" {...field} value={field.value || ''} /></FormControl>
                      <FormDescription>Link to the video (e.g., YouTube, Vimeo).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL (Optional)</FormLabel>
                      <div className="flex gap-2">
                      <FormControl><Input placeholder="https://example.com/thumb.jpg" {...field} value={field.value || ''} className="flex-grow" data-ai-hint="education learning"/></FormControl>
                      <Button type="button" variant="outline" onClick={() => handleFileUpload('thumbnailUrl')}><UploadCloud className="mr-2 h-4 w-4"/> Upload</Button>
                    </div>
                    <FormDescription>URL of an image for the resource preview.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field: { onChange, value, ...rest }}) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., knee, rehab, stretching (comma-separated)" 
                        value={Array.isArray(value) ? value.join(', ') : value || ''} 
                        onChange={e => onChange(e.target.value)} 
                        {...rest} 
                      />
                    </FormControl>
                    <FormDescription>Comma-separated list of keywords.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="estimatedReadTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est. Time (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., 5 min read, 10 min watch" {...field} value={field.value || ''} /></FormControl>
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
                        <SelectContent>{resourceStatuses.map(stat => <SelectItem key={stat} value={stat} className="capitalize">{stat}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/content/education')} disabled={isLoading || form.formState.isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || form.formState.isSubmitting}>
                  {isLoading || form.formState.isSubmitting ? 'Saving...' : 'Create Resource'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
