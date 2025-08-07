
"use client";

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ListFilter } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Filters {
  bodyParts: string[];
  conditions: string[];
  equipment: string[];
  difficulty: string[];
}

interface ExerciseFiltersProps {
  initialFilters?: Filters;
  onFilterChange: (filters: Filters) => void;
  // Mock data for filter options
  bodyPartOptions: string[];
  conditionOptions: string[];
  equipmentOptions: string[];
  difficultyOptions: string[];
}

const defaultFilters: Filters = {
  bodyParts: [],
  conditions: [],
  equipment: [],
  difficulty: [],
};

export function ExerciseFilters({ 
  initialFilters = defaultFilters, 
  onFilterChange,
  bodyPartOptions,
  conditionOptions,
  equipmentOptions,
  difficultyOptions
}: ExerciseFiltersProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const handleCheckboxChange = (category: keyof Filters, value: string) => {
    setFilters(prevFilters => {
      const currentCategoryValues = prevFilters[category] as string[];
      const newCategoryValues = currentCategoryValues.includes(value)
        ? currentCategoryValues.filter(item => item !== value)
        : [...currentCategoryValues, value];
      
      const updatedFilters = { ...prevFilters, [category]: newCategoryValues };
      onFilterChange(updatedFilters);
      return updatedFilters;
    });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const filterSections = [
    { title: "Body Part", category: "bodyParts" as keyof Filters, options: bodyPartOptions },
    { title: "Condition", category: "conditions" as keyof Filters, options: conditionOptions },
    { title: "Equipment", category: "equipment" as keyof Filters, options: equipmentOptions },
    { title: "Difficulty", category: "difficulty" as keyof Filters, options: difficultyOptions },
  ];

  const filterContent = (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={filterSections.map(s => s.title)} className="w-full">
        {filterSections.map(section => (
          <AccordionItem value={section.title} key={section.title}>
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              {section.title}
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-40 pr-3"> {/* Max height for scroll */}
                <div className="space-y-2">
                  {section.options.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${section.category}-${option}`}
                        checked={(filters[section.category] as string[]).includes(option)}
                        onCheckedChange={() => handleCheckboxChange(section.category, option)}
                      />
                      <Label htmlFor={`${section.category}-${option}`} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-full lg:w-72 sticky top-20 self-start p-4 border rounded-lg shadow-sm bg-card">
        <h3 className="text-lg font-headline font-semibold mb-4 flex items-center">
          <SlidersHorizontal className="mr-2 h-5 w-5 text-primary" />
          Filter Exercises
        </h3>
        {filterContent}
      </div>

      {/* Mobile Filters (Sheet) */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <ListFilter className="mr-2 h-5 w-5" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[75vh] flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-xl font-headline flex items-center">
                <SlidersHorizontal className="mr-2 h-5 w-5 text-primary" />
                Filter Exercises
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-grow p-4">
              {filterContent}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
