
"use client";

import { useState, useEffect } from 'react';
import type { Appointment } from '@/lib/types';
import { Calendar as ShadCalendar } from "@/components/ui/calendar"; // Day picker
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ChevronLeft, ChevronRight, Video, MapPin, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek, endOfWeek, isSameDay, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAddAppointment: (date: Date) => void;
  onEditAppointment: (appointment: Appointment) => void;
  aiSuggestedSlots?: Date[]; 
}

export function AppointmentCalendar({ appointments, onAddAppointment, onEditAppointment, aiSuggestedSlots = [] }: AppointmentCalendarProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonthDate), { weekStartsOn: 1 }), 
    end: endOfWeek(endOfMonth(currentMonthDate), { weekStartsOn: 1 }),
  });

  const appointmentsForSelectedDate = selectedDate 
    ? appointments.filter(apt => isSameDay(new Date(apt.start), selectedDate))
    : [];

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const DayCell = ({ day }: { day: Date }) => {
    const dayAppointments = appointments.filter(apt => isSameDay(new Date(apt.start), day) && apt.status === 'scheduled'); // Only show scheduled
    const isToday = isSameDay(day, new Date());
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    const isCurrentMonth = isSameMonth(day, currentMonthDate);
    const isAiSuggestedDate = aiSuggestedSlots.some(slotDate => isSameDay(slotDate, day));

    return (
      <div
        onClick={() => handleDayClick(day)}
        className={cn(
          "h-28 p-1.5 border border-border flex flex-col cursor-pointer transition-colors relative overflow-hidden", // Increased height
          isCurrentMonth ? "bg-background hover:bg-muted/50" : "bg-muted/30 text-muted-foreground hover:bg-muted/60",
          isSelected && "bg-primary/10 border-primary ring-2 ring-primary",
          isToday && "border-2 border-accent font-semibold"
        )}
      >
        <div className="flex justify-between items-center">
            <span className={cn("text-sm", isToday && "text-accent font-bold")}>
            {format(day, 'd')}
            </span>
            {isAiSuggestedDate && !isSelected && (
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <div className="h-2.5 w-2.5 bg-green-500 rounded-full" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-green-600 text-white text-xs p-1.5">
                             AI Suggested Availability
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
        {dayAppointments.length > 0 && (
          <div className="mt-1 space-y-0.5 text-xs overflow-y-auto max-h-[70px]"> {/* Adjusted max-h */}
            {dayAppointments.slice(0, 3).map(apt => ( 
              <div 
                key={apt.id} 
                className={cn(
                    "bg-primary/80 text-primary-foreground p-0.5 rounded-sm truncate text-[10px] leading-tight flex items-center",
                    apt.type === 'Telehealth Check-in' && 'bg-blue-500',
                    apt.type === 'Initial Consultation' && 'bg-purple-500'
                )}
                title={`${apt.title || apt.type} at ${format(new Date(apt.start), 'p')}`}
              >
                {apt.type === 'Telehealth Check-in' ? <Video className="h-2.5 w-2.5 mr-0.5 shrink-0"/> : <MapPin className="h-2.5 w-2.5 mr-0.5 shrink-0"/>}
                <span className="truncate">{apt.title || apt.type}</span>
              </div>
            ))}
            {dayAppointments.length > 3 && <div className="text-[10px] text-muted-foreground mt-0.5 text-center">+{dayAppointments.length - 3} more</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-headline">
            {format(currentMonthDate, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonthDate(subMonths(currentMonthDate, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={() => { setCurrentMonthDate(new Date()); setSelectedDate(new Date());}} className="hidden sm:inline-flex">Today</Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonthDate(addMonths(currentMonthDate, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button onClick={() => onAddAppointment(selectedDate || new Date())} className="ml-2">
              <PlusCircle className="mr-2 h-4 w-4" /> New Appointment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 text-center font-medium text-sm text-muted-foreground border-b border-t py-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
              <div key={dayName}>{dayName}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {daysInMonth.map((day, index) => (
              <DayCell key={index} day={day} />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1"><div className="h-3 w-3 bg-green-500 rounded-full"></div>AI Suggested Availability</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 border-2 border-accent rounded-sm"></div>Today</div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-1 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline">
            {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : "Select a Date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ShadCalendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
                setCurrentMonthDate(date); 
              }
            }}
            className="rounded-md border p-0 mb-4"
            month={currentMonthDate} // Ensure picker syncs with calendar month
            onMonthChange={setCurrentMonthDate} // Allow picker to change calendar month
            modifiers={{ aisuggested: aiSuggestedSlots }}
            modifiersClassNames={{ aisuggested: 'bg-green-100 text-green-700 rounded-full' }}
          />
          <h4 className="font-semibold mb-2 text-primary">Appointments for {selectedDate ? format(selectedDate, 'MMM d') : 'selected date'}:</h4>
          {appointmentsForSelectedDate.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {appointmentsForSelectedDate.map(apt => (
                <div 
                  key={apt.id} 
                  className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => onEditAppointment(apt)}
                >
                  <p className="font-semibold text-sm">{apt.title || apt.type || "Appointment"}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(apt.start), 'p')} - {format(new Date(apt.end), 'p')}
                  </p>
                  <div className="flex items-center text-xs mt-1">
                    {apt.type === 'Telehealth Check-in' ? <Video className="h-3 w-3 mr-1 text-blue-500" /> : <MapPin className="h-3 w-3 mr-1 text-primary" />}
                    <span className={apt.type === 'Telehealth Check-in' ? 'text-blue-600' : 'text-primary'}>{apt.type}</span>
                  </div>
                   <div className={cn("text-xs mt-0.5 capitalize", 
                      apt.status === 'scheduled' && 'text-blue-600',
                      apt.status === 'completed' && 'text-green-600',
                      apt.status === 'cancelled' && 'text-red-600',
                  )}>Status: {apt.status}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No appointments for this day.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
