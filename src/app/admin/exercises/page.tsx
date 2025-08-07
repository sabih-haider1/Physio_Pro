
"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Exercise, ExerciseStatus } from '@/lib/types';
import { Dumbbell, PlusCircle, MoreHorizontal, Edit2, Trash2, Search, Star, ThumbsUp, ThumbsDown, XCircle, Link as LinkIcon, Upload, Download, RefreshCcw } from "lucide-react";
import { cn } from '@/lib/utils';

export let initialMockExercises: Exercise[] = [
  { id: 'ex1', name: 'Standard Squat', description: 'A basic squat exercise. Keep back straight and engage core.', videoUrl: 'https://example.com/squat.mp4', thumbnailUrl: 'https://placehold.co/100x100.png?text=Squat', category: 'Strength', bodyParts: ['Legs', 'Glutes'], difficulty: 'Beginner', status: 'active', precautions: 'Keep back straight.', isFeatured: true, sets: "3", reps: "10-12", hold: "" },
  { id: 'ex2', name: 'Push Up', description: 'A classic push up. Maintain a straight line from head to heels.', thumbnailUrl: 'https://placehold.co/100x100.png?text=PushUp', category: 'Strength', bodyParts: ['Chest', 'Arms', 'Core'], difficulty: 'Intermediate', status: 'pending', precautions: 'Engage core.', sets: "3", reps: "As many as possible", hold: "" },
  { id: 'ex3', name: 'Plank', description: 'Hold a plank position, engaging core and glutes.', category: 'Core', bodyParts: ['Core'], difficulty: 'Beginner', status: 'active', videoUrl: 'https://example.com/plank.mp4', sets: "3", reps: "1", hold: "30-60s" },
  { id: 'ex4', name: 'Bicep Curl', description: 'Curl dumbbells to work biceps. Avoid swinging the body.', thumbnailUrl: 'https://placehold.co/100x100.png?text=Curl', category: 'Strength', bodyParts: ['Arms'], equipment: 'Dumbbells', difficulty: 'Beginner', status: 'rejected', precautions: 'Avoid swinging.', sets: "3", reps: "10-15", hold: "" },
  { id: 'ex5', name: 'Hamstring Stretch', description: 'Gentle stretch for the back of the thigh. Hold for specified duration.', category: 'Flexibility', bodyParts: ['Legs'], difficulty: 'Beginner', status: 'active', sets: "1-2", reps: "1", hold: "30s per leg" },
  { id: 'ex6', name: 'Advanced Lunge Matrix', description: 'Complex lunge variations for dynamic strength and balance.', category: 'Strength', bodyParts: ['Legs', 'Core'], difficulty: 'Advanced', status: 'pending', isFeatured: false, sets: "2", reps: "8 per lunge type", hold: "" },
];

export const addMockExercise = (newExercise: Exercise) => {
  initialMockExercises = [newExercise, ...initialMockExercises];
};

export const updateMockExercise = (updatedExercise: Exercise) => {
  const index = initialMockExercises.findIndex(ex => ex.id === updatedExercise.id);
  if (index !== -1) {
    initialMockExercises[index] = updatedExercise;
  } else {
    addMockExercise(updatedExercise);
  }
  initialMockExercises = [...initialMockExercises];
};

const exerciseCategories: string[] = Array.from(new Set(initialMockExercises.map(ex => ex.category))).sort();
const exerciseStatuses: ExerciseStatus[] = ['active', 'pending', 'rejected'];
const exerciseDifficulties: Exercise['difficulty'][] = ['Beginner', 'Intermediate', 'Advanced'];


export default function ExerciseManagementPage() {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>(() => [...initialMockExercises]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ category: string; status: string; difficulty: string }>({
    category: 'all',
    status: 'all',
    difficulty: 'all',
  });
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setExercises([...initialMockExercises]);
  }, [initialMockExercises.length]);

  const refreshExercises = () => {
    setExercises([...initialMockExercises]);
    toast({ title: 'Exercise List Refreshed', description: 'Displaying the latest exercise data.' });
  }

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const searchMatch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || (ex.description && ex.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const categoryMatch = filters.category === 'all' || ex.category === filters.category;
      const statusMatch = filters.status === 'all' || ex.status === filters.status;
      const difficultyMatch = filters.difficulty === 'all' || ex.difficulty === filters.difficulty;
      return searchMatch && categoryMatch && statusMatch && difficultyMatch;
    }).sort((a, b) => a.name.localeCompare(b.name)); // Default sort by name A-Z
  }, [searchTerm, filters, exercises]);

  const handleUpdateStatus = (exerciseId: string, newStatus: ExerciseStatus) => {
    updateMockExercise({ ...initialMockExercises.find(ex => ex.id === exerciseId)!, status: newStatus });
    setExercises([...initialMockExercises]);
    toast({ title: 'Exercise Status Updated', description: `${initialMockExercises.find(ex=>ex.id===exerciseId)?.name} is now ${newStatus}.` });
  };

  const handleDeleteExercise = () => {
    if (!exerciseToDelete) return;
    initialMockExercises = initialMockExercises.filter(ex => ex.id !== exerciseToDelete.id);
    setExercises([...initialMockExercises]);
    toast({ title: 'Exercise Deleted', description: `${exerciseToDelete.name} has been removed.` });
    setExerciseToDelete(null);
  };
  
  const toggleFeatured = (exerciseId: string) => {
     const exerciseToUpdate = initialMockExercises.find(ex => ex.id === exerciseId);
     if (exerciseToUpdate) {
      updateMockExercise({ ...exerciseToUpdate, isFeatured: !exerciseToUpdate.isFeatured });
      setExercises([...initialMockExercises]);
      toast({ title: `Exercise ${exerciseToUpdate.isFeatured ? 'Unfeatured' : 'Featured'}`, description: `${exerciseToUpdate.name} updated.` });
    }
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: 'Import Started (Simulated)',
        description: `Processing ${file.name}... This will take a moment.`,
      });
      console.log('Importing file:', file.name);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
    }
  };
  
  const escapeCSVField = (field: any): string => {
    if (field === null || field === undefined) {
      return '';
    }
    let stringField = String(field);
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
      stringField = `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const handleExportCSV = () => {
    if (filteredExercises.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'There are no exercises matching the current filters.',
        variant: 'destructive'
      });
      return;
    }

    const headers = [
      "ID", "Name", "Description", "Category", "Difficulty", 
      "Body Parts", "Equipment", "Status", "Video URL", "Thumbnail URL", 
      "Precautions", "Is Featured", "Default Sets", "Default Reps", "Default Hold"
    ];
    
    const csvRows = [headers.join(',')];

    filteredExercises.forEach(ex => {
      const row = [
        escapeCSVField(ex.id),
        escapeCSVField(ex.name),
        escapeCSVField(ex.description),
        escapeCSVField(ex.category),
        escapeCSVField(ex.difficulty),
        escapeCSVField(Array.isArray(ex.bodyParts) ? ex.bodyParts.join('; ') : ''),
        escapeCSVField(ex.equipment),
        escapeCSVField(ex.status),
        escapeCSVField(ex.videoUrl),
        escapeCSVField(ex.thumbnailUrl),
        escapeCSVField(ex.precautions),
        escapeCSVField(ex.isFeatured ? 'Yes' : 'No'),
        escapeCSVField(ex.sets),
        escapeCSVField(ex.reps),
        escapeCSVField(ex.hold),
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'physiopro_exercises.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `CSV file with ${filteredExercises.length} exercises has been downloaded.`,
    });
  };

  const getStatusBadgeVariant = (status: ExerciseStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default'; 
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Dumbbell className="mr-3 h-8 w-8" /> Exercise Management
          </h1>
          <p className="text-muted-foreground">Manage the platform's exercise library. Import/Export CSV available.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            className="hidden" 
            id="import-csv-input"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button asChild>
            <Link href="/admin/exercises/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Exercise
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Exercise List & Filters</CardTitle>
              <CardDescription>Browse, filter, and manage all exercises.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshExercises}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh List
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {exerciseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
              <SelectTrigger><SelectValue placeholder="Filter by Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {exerciseDifficulties.map(diff => <SelectItem key={diff} value={diff}>{diff}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {exerciseStatuses.map(stat => <SelectItem key={stat} value={stat} className="capitalize">{stat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExercises.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[80px]">Thumbnail</TableHead>
                  <TableHead>Video URL</TableHead>
                  <TableHead className="min-w-[200px]">Description</TableHead>
                  <TableHead>Reps</TableHead>
                  <TableHead>Sets</TableHead>
                  <TableHead>Hold</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExercises.map((exercise) => (
                  <TableRow key={exercise.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {exercise.name} 
                      {exercise.isFeatured && <Star className="h-3 w-3 inline text-yellow-400 fill-yellow-400 ml-1.5" />}
                      <div className="mt-1">
                         <Badge variant={getStatusBadgeVariant(exercise.status)} className="text-xs capitalize py-0.5 px-1.5 h-auto">
                           {exercise.status}
                         </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Image
                        src={exercise.thumbnailUrl || `https://placehold.co/60x60.png?text=${exercise.name.charAt(0)}`}
                        alt={exercise.name}
                        width={60}
                        height={60}
                        className="rounded-md object-cover aspect-square"
                        data-ai-hint="exercise fitness"
                      />
                    </TableCell>
                    <TableCell>
                      {exercise.videoUrl ? (
                        <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                          <LinkIcon className="mr-1 h-3 w-3"/> View Video
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground line-clamp-3">{exercise.description}</TableCell>
                    <TableCell className="text-xs">{exercise.reps || '-'}</TableCell>
                    <TableCell className="text-xs">{exercise.sets || '-'}</TableCell>
                    <TableCell className="text-xs">{exercise.hold || '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/exercises/${exercise.id}/edit`}><Edit2 className="mr-2 h-4 w-4" /> Edit</Link>
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => toggleFeatured(exercise.id)}>
                            <Star className="mr-2 h-4 w-4" /> {exercise.isFeatured ? 'Unfeature' : 'Feature'}
                          </DropdownMenuItem>
                          {exercise.status === 'pending' && (
                            <>
                              <DropdownMenuItem className="text-green-600 focus:text-green-700 focus:bg-green-50" onClick={() => handleUpdateStatus(exercise.id, 'active')}>
                                <ThumbsUp className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => handleUpdateStatus(exercise.id, 'rejected')}>
                                <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {(exercise.status === 'rejected' || exercise.status === 'active') && exercise.status !== 'pending' && (
                             <DropdownMenuItem className="text-orange-600 focus:text-orange-700 focus:bg-orange-50" onClick={() => handleUpdateStatus(exercise.id, 'pending')}>
                                <XCircle className="mr-2 h-4 w-4" /> Mark as Pending
                              </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10" 
                            onSelect={(e) => { e.preventDefault(); setExerciseToDelete(exercise); }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Exercises Found</h3>
              <p>Try adjusting your search terms or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!exerciseToDelete} onOpenChange={(open) => !open && setExerciseToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Exercise: {exerciseToDelete?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the exercise from the library.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteExercise} className={cn(buttonVariants({ variant: "destructive" }))}>
                Delete Exercise
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
