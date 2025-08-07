
import Link from 'next/link';
import { Activity } from 'lucide-react'; // Changed from Sparkles to Activity
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export function Logo({ className, iconSize = 24, textSize = "text-2xl" }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-primary hover:opacity-80 transition-opacity", className)}>
      <Activity className="text-accent" size={iconSize} /> {/* Changed icon to Activity */}
      <span className={cn("font-headline font-bold", textSize)}>PhysioPro</span> {/* Changed text to PhysioPro */}
    </Link>
  );
}
