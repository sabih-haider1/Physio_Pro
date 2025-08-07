import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  contentClassName?: string;
  containerClassName?: string;
}

export function Section({
  id,
  className,
  children,
  title,
  subtitle,
  titleClassName,
  subtitleClassName,
  contentClassName,
  containerClassName,
}: SectionProps) {
  return (
    <section id={id} className={cn('py-12 md:py-20', className)}>
      <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8', containerClassName)}>
        {(title || subtitle) && (
          <div className="mb-8 md:mb-12 text-center">
            {title && (
              <h2 className={cn('text-3xl md:text-4xl font-headline font-bold text-primary mb-2', titleClassName)}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn('text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto', subtitleClassName)}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={contentClassName}>
          {children}
        </div>
      </div>
    </section>
  );
}
