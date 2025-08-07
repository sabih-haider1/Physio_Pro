
"use client";

import { useState, useMemo, useCallback, useEffect } from 'react'; // Added useEffect
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dumbbell, Search as SearchIcon, Loader2, AlertTriangle, Wand2, RefreshCcw } from "lucide-react"; // Added RefreshCcw
import type { Exercise } from '@/lib/types';
import { ExerciseCard } from '@/components/features/exercises/ExerciseCard';
import { ExerciseFilters, type Filters as ExerciseFilterType } from '@/components/features/exercises/ExerciseFilters';
import { ExercisePreviewModal } from '@/components/features/exercises/ExercisePreviewModal';
import { initialMockExercises } from '@/app/admin/exercises/page'; 
import { useToast } from '@/hooks/use-toast';
import { aiExerciseSearch } from '@/ai/flows/ai-exercise-search';

const bodyPartOptions = ["Legs", "Glutes", "Core", "Chest", "Arms", "Shoulder", "Back", "Full Body"];
const conditionOptions = ["Knee Rehab", "Shoulder Mobility", "Low Back Pain", "Post-ACL", "Rotator Cuff"];
const equipmentOptions = ["Dumbbells", "Resistance Band", "Kettlebell", "Bodyweight", "Machine"];
const difficultyOptions = ["Beginner", "Intermediate", "Advanced"];

export default function ExerciseLibraryPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSearchTerm, setAiSearchTerm] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [filters, setFilters] = useState<ExerciseFilterType>({ bodyParts: [], conditions: [], equipment: [], difficulty: [] });
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayedExercises, setDisplayedExercises] = useState<Exercise[]>(() => initialMockExercises.filter(ex => ex.status === 'active'));
  const [aiLibSearchResults, setAiLibSearchResults] = useState<Exercise[]>([]);

  // Re-sync if the global mock data changes
  useEffect(() => {
    setDisplayedExercises(initialMockExercises.filter(ex => ex.status === 'active'));
  }, [initialMockExercises.length]); // Basic re-sync on add/delete from global

  const refreshExerciseList = () => {
     setDisplayedExercises(initialMockExercises.filter(ex => ex.status === 'active'));
     toast({ title: "Exercise Library Refreshed" });
  }

  const handleAiSearch = async () => {
    if (!aiSearchTerm.trim()) {
      toast({ variant: 'destructive', title: 'Empty AI Search', description: 'Please enter a query for AI search.' });
      return;
    }
    setIsAiSearching(true);
    try {
      const result = await aiExerciseSearch({ query: aiSearchTerm });
      if (result.results && result.results.length > 0) {
        toast({ 
          title: `AI Search Results for "${aiSearchTerm}"`, 
          description: `${result.results.join(', ')}. (Displaying these results not yet implemented, clear manual search to see all.)`,
          duration: 7000
        });
        setSearchTerm(result.results[0] || ''); 
      } else {
        toast({ title: 'No AI Results', description: `AI couldn't find specific exercises for "${aiSearchTerm}". Try a broader query.` });
      }
    } catch (error) {
      console.error("AI exercise search error:", error);
      toast({ variant: 'destructive', title: 'AI Search Failed', description: 'Could not perform AI search.' });
    } finally {
      setIsAiSearching(false);
    }
  };

  const filteredExercises = useMemo(() => {
    return displayedExercises.filter(ex => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = ex.name.toLowerCase().includes(searchLower);
      const categoryMatch = ex.category.toLowerCase().includes(searchLower);
      const descriptionMatch = ex.description?.toLowerCase().includes(searchLower) || false;

      const bodyPartsMatch = filters.bodyParts.length === 0 || (ex.bodyParts && ex.bodyParts.some(bp => filters.bodyParts.includes(bp)));
      const equipmentMatch = filters.equipment.length === 0 || (ex.equipment && filters.equipment.includes(ex.equipment)) || (filters.equipment.includes("Bodyweight") && !ex.equipment);
      const difficultyMatch = filters.difficulty.length === 0 || filters.difficulty.includes(ex.difficulty);
      
      return (nameMatch || categoryMatch || descriptionMatch) && bodyPartsMatch && equipmentMatch && difficultyMatch;
    });
  }, [displayedExercises, searchTerm, filters]);

  const handlePreviewExercise = useCallback((exercise: Exercise) => {
    setPreviewExercise(exercise);
    setIsModalOpen(true);
  }, []);
  
  const handleAddToProgram = useCallback((exercise: Exercise) => {
    toast({
      title: "Action: Add to Program (Simulated)",
      description: `To add "${exercise.name}" to a program, please go to the 'Program Builder' section. This button is for demonstration.`,
      duration: 7000,
    });
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Exercise Library</h1>
          <p className="text-muted-foreground">Browse, search, and filter exercises for your programs.</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshExerciseList}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Library
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Dumbbell className="mr-2 h-5 w-5 text-primary" />
              <span>Explore Exercises ({filteredExercises.length} found)</span>
            </div>
          </CardTitle>
          <CardDescription>Use manual search, AI-powered search, or filters to find approved exercises. Only 'active' exercises from the main library are shown here.</CardDescription>
          <div className="grid md:grid-cols-2 gap-4 pt-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Manually search by name, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
               <Input
                placeholder="AI: e.g., 'low impact knee exercises'"
                value={aiSearchTerm}
                onChange={(e) => setAiSearchTerm(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleAiSearch} disabled={isAiSearching}>
                {isAiSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4"/>}
                <span className="ml-2 hidden sm:inline">AI Search</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <ExerciseFilters 
              onFilterChange={setFilters}
              bodyPartOptions={bodyPartOptions}
              conditionOptions={conditionOptions}
              equipmentOptions={equipmentOptions}
              difficultyOptions={difficultyOptions}
            />
            <div className="flex-1">
              {filteredExercises.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredExercises.map(ex => (
                    <ExerciseCard 
                      key={ex.id} 
                      exercise={ex} 
                      onPreview={handlePreviewExercise}
                      onAddToProgram={handleAddToProgram}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-lg">
                  <AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold">No Exercises Found</h3>
                  <p>Try adjusting your search term or filters.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {previewExercise && (
        <ExercisePreviewModal 
          exercise={previewExercise} 
          isOpen={isModalOpen} 
          onOpenChange={setIsModalOpen}
          onAddToProgram={handleAddToProgram}
        />
      )}
    </div>
  );
}

