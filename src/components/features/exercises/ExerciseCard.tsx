
import type { Exercise } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlayCircle, Star, Tag, PlusCircle } from 'lucide-react'; 
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
  onPreview: (exercise: Exercise) => void;
  onAddToProgram?: (exercise: Exercise) => void; 
  isFavorite?: boolean;
  onToggleFavorite?: (exerciseId: string) => void;
}

export function ExerciseCard({ exercise, onPreview, onAddToProgram, isFavorite, onToggleFavorite }: ExerciseCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="p-0 relative">
        <Image
          src={exercise.thumbnailUrl || `https://placehold.co/400x225.png?text=${encodeURIComponent(exercise.name)}`}
          alt={exercise.name}
          width={400}
          height={225}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          data-ai-hint="exercise fitness" // Added hint
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4">
           <CardTitle className="text-lg font-headline text-primary-foreground leading-tight line-clamp-2">{exercise.name}</CardTitle>
        </div>
        {onToggleFavorite && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 text-white hover:text-yellow-400 bg-black/30 hover:bg-black/50 rounded-full h-8 w-8"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(exercise.id); }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={cn("h-5 w-5", isFavorite ? "fill-yellow-400 text-yellow-400" : "text-white")} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">
              <Tag className="mr-1 h-3 w-3" /> {exercise.category}
            </Badge>
            <Badge variant="outline" className="text-xs">{exercise.difficulty}</Badge>
          </div>
           <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {exercise.description || "No description available."}
          </CardDescription>
          {exercise.bodyParts && exercise.bodyParts.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <strong>Body Parts:</strong> {exercise.bodyParts.join(', ')}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex w-full justify-between items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onPreview(exercise)} className="flex-1">
            <PlayCircle className="mr-2 h-4 w-4" />
            Preview
          </Button>
          {onAddToProgram && (
             <Button size="sm" onClick={() => onAddToProgram(exercise)} className="flex-1">
              <PlusCircle className="mr-2 h-4 w-4" /> Add to Program
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
