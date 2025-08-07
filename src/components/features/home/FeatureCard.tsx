import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn(
        "h-full transform transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 bg-card",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="bg-primary/10 text-primary p-3 rounded-lg">
          <Icon size={28} strokeWidth={1.5} />
        </div>
        <CardTitle className="text-xl font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
