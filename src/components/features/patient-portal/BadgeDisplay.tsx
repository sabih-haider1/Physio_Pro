
import { Award, Medal, Star, Trophy, Zap } from 'lucide-react'; // Added Trophy, Zap
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Flame icon if not available in lucide-react (it is, but as fallback)
const Flame = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path>
  </svg>
);


interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string; // Tailwind color class e.g. text-yellow-500
  bgColor: string; // Tailwind background class e.g. bg-yellow-500/10
}

const allBadgeDefinitions: BadgeDefinition[] = [
  { id: '1_workout', name: 'First Step', description: 'Completed your first workout!', icon: Star, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  { id: '10_workouts', name: 'Workout Warrior', description: 'Completed 10 workouts!', icon: Medal, color: 'text-slate-400', bgColor: 'bg-slate-400/10' },
  { id: '25_workouts', name: 'Dedicated Performer', description: 'Completed 25 workouts!', icon: Trophy, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { id: '7_day_streak', name: 'Streak Starter', description: '7 day workout streak!', icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { id: 'program_complete', name: 'Program Graduate', description: 'Successfully completed a full program!', icon: Award, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { id: 'early_bird', name: 'Early Bird', description: 'Completed a workout before 8 AM!', icon: Zap, color: 'text-sky-400', bgColor: 'bg-sky-400/10' },
];

interface BadgeDisplayProps {
  achievedBadgeIds: string[]; 
  maxDisplayed?: number;
}

export function BadgeDisplay({ achievedBadgeIds, maxDisplayed = 6 }: BadgeDisplayProps) {
  const badgesToDisplay = allBadgeDefinitions.map(badgeDef => ({
    ...badgeDef,
    achieved: achievedBadgeIds.includes(badgeDef.id)
  })).sort((a,b) => (b.achieved ? 1 : 0) - (a.achieved ? 1: 0)); // Show achieved first

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-3 justify-center">
        {badgesToDisplay.slice(0, maxDisplayed).map(badge => (
          <Tooltip key={badge.id} delayDuration={100}>
            <TooltipTrigger asChild>
              <div 
                className={cn(
                  "p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-110 flex flex-col items-center w-20 h-20 justify-center text-center",
                  badge.achieved 
                    ? `${badge.color} ${badge.bgColor} border-current shadow-lg` 
                    : "text-muted-foreground/40 border-muted-foreground/20 bg-muted/10"
                )}
              >
                <badge.icon className="h-7 w-7 mb-0.5" strokeWidth={badge.achieved ? 2 : 1.5} />
                <span className="text-[10px] font-medium leading-tight line-clamp-2">{badge.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground shadow-xl max-w-xs">
              <p className="font-semibold text-primary">{badge.name}</p>
              <p className="text-xs">{badge.achieved ? badge.description : "Keep going to unlock this badge!"}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
