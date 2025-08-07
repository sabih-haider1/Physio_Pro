
import { Flame, TrendingUp } from 'lucide-react'; // Changed Flame to TrendingUp for variety
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  const cardColor = streak > 5 ? "bg-gradient-to-br from-green-400 to-emerald-600" 
                  : streak > 0 ? "bg-gradient-to-br from-sky-400 to-blue-600" 
                  : "bg-gradient-to-br from-slate-300 to-slate-500";
  
  return (
    <Card className={cn("text-white shadow-lg", cardColor)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Workout Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-3">
        <div className="text-center">
          <p className="text-5xl font-bold">{streak}</p>
          <p className="text-sm opacity-90 -mt-1">{streak === 1 ? "day" : "days"}!</p>
        </div>
      </CardContent>
    </Card>
  );
}
