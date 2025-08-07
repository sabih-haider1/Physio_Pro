"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Testimonial } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TestimonialSliderProps {
  testimonials: Testimonial[];
}

export function TestimonialSlider({ testimonials }: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 4000);
    return () => clearInterval(timer);
  }, [nextTestimonial]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Card className="overflow-hidden shadow-lg bg-background">
        <CardContent className="p-8 md:p-12 text-center min-h-[300px] flex flex-col justify-center items-center">
          <Quote className="text-primary/50 h-12 w-12 mb-4 transform scale-x-[-1]" />
          <p className="text-lg md:text-xl italic text-foreground mb-6">"{current.text}"</p>
          <div className="flex items-center justify-center">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={`https://placehold.co/100x100.png?text=${current.author.charAt(0)}`} alt={current.author} data-ai-hint="person portrait" />
              <AvatarFallback>{current.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-primary">{current.author}</p>
              <p className="text-sm text-muted-foreground">{current.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full hidden sm:flex"
        onClick={prevTestimonial}
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full hidden sm:flex"
        onClick={nextTestimonial}
        aria-label="Next testimonial"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              currentIndex === index ? "bg-primary" : "bg-muted hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
