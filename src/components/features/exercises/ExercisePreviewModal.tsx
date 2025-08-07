
"use client";

import type { Exercise } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ShieldCheck, Tag, PlusCircle } from 'lucide-react'; // Added PlusCircle

interface ExercisePreviewModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddToProgram?: (exercise: Exercise) => void;
}

export function ExercisePreviewModal({ exercise, isOpen, onOpenChange, onAddToProgram }: ExercisePreviewModalProps) {
  if (!exercise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-headline text-primary">{exercise.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-4">
            {exercise.videoUrl && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                {/* In a real app, this would be a video player component */}
                <video
                  src={exercise.videoUrl} // Assuming videoUrl is a direct link to an MP4 or similar
                  controls
                  className="w-full h-full object-cover"
                  aria-label={`Video demonstration of ${exercise.name}`}
                  poster={exercise.thumbnailUrl || `https://placehold.co/600x400.png?text=Video+Preview`}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="secondary"><Tag className="mr-1.5 h-3.5 w-3.5" />{exercise.category}</Badge>
              <Badge variant="outline">{exercise.difficulty}</Badge>
              {exercise.equipment && <Badge variant="outline">Equipment: {exercise.equipment}</Badge>}
            </div>

            <DialogDescription className="text-base text-foreground leading-relaxed">
              {exercise.description || "No detailed description available."}
            </DialogDescription>
            
            <Separator />

            <div>
              <h4 className="font-semibold text-md mb-1">Target Body Parts:</h4>
              <p className="text-sm text-muted-foreground">{exercise.bodyParts.join(', ')}</p>
            </div>

             { (exercise.sets || exercise.reps || exercise.hold) && <Separator />}
            
            <div className="grid grid-cols-3 gap-2 text-sm">
                {exercise.sets && <div><strong className="text-muted-foreground">Sets:</strong> {exercise.sets}</div>}
                {exercise.reps && <div><strong className="text-muted-foreground">Reps:</strong> {exercise.reps}</div>}
                {exercise.hold && <div><strong className="text-muted-foreground">Hold:</strong> {exercise.hold}</div>}
            </div>


            {exercise.precautions && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-md mb-2 flex items-center text-amber-600">
                    <AlertCircle className="mr-2 h-5 w-5" /> Precautions:
                  </h4>
                  <p className="text-sm text-muted-foreground bg-amber-50 border border-amber-200 p-3 rounded-md">{exercise.precautions}</p>
                </div>
              </>
            )}
             <div className="text-xs text-muted-foreground flex items-center pt-2">
              <ShieldCheck className="w-3 h-3 mr-1 text-green-600" />
              <span>Exercise data reviewed for safety. Always consult with a healthcare professional.</span>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-4 border-t mt-auto sm:justify-between"> {/* Adjusted padding */}
          <Button variant="outline" onClick={() => onOpenChange(false)}  className="w-full sm:w-auto">
            Close
          </Button>
          {onAddToProgram && (
            <Button onClick={() => { onAddToProgram(exercise); onOpenChange(false); }} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add to Program
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
