
"use client";

import { useState, useEffect }
from 'react';
import type { Appointment, Patient } from '@/lib/types'; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Users, AlertTriangle, Wand2 } from 'lucide-react'; // Added Wand2
import { Calendar } from '@/components/ui/calendar'; 
import { format, setHours, setMinutes, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appointment?: Appointment | null; 
  initialDate?: Date;
  patients: Patient[]; 
  clinicianId: string; 
  onSave: (appointmentData: Omit<Appointment, 'id' | 'status'> | Appointment) => Promise<void>;
}

const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => { 
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return format(setMinutes(setHours(new Date(), hour), minute), 'HH:mm');
});

export function AppointmentFormModal({
  isOpen,
  onOpenChange,
  appointment,
  initialDate,
  patients,
  clinicianId,
  onSave,
}: AppointmentFormModalProps) {
  const { toast } = useToast();
  const [patientId, setPatientId] = useState<string>(appointment?.patientId || '');
  const [date, setDate] = useState<Date | undefined>(appointment ? new Date(appointment.start) : initialDate || new Date());
  const [startTime, setStartTime] = useState<string>(appointment ? format(new Date(appointment.start), 'HH:mm') : '09:00');
  const [duration, setDuration] = useState<number>(appointment ? (new Date(appointment.end).getTime() - new Date(appointment.start).getTime()) / (60 * 1000) : 30);
  const [customTitle, setCustomTitle] = useState<string>(appointment?.title || '');
  const [appointmentType, setAppointmentType] = useState<Appointment['type']>(appointment?.type || 'Follow-up');
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestedTimeSlots, setAiSuggestedTimeSlots] = useState<string[]>([]); 
  const [isFetchingAISlots, setIsFetchingAISlots] = useState(false);

  useEffect(() => {
    if (appointment) {
      setPatientId(appointment.patientId);
      setDate(new Date(appointment.start));
      setStartTime(format(new Date(appointment.start), 'HH:mm'));
      setDuration((new Date(appointment.end).getTime() - new Date(appointment.start).getTime()) / (60 * 1000));
      setCustomTitle(appointment.title || '');
      setAppointmentType(appointment.type || 'Follow-up');
    } else if (initialDate) {
      setDate(initialDate);
      // Reset other fields for new appointment
      setPatientId('');
      setStartTime('09:00');
      setDuration(30);
      setCustomTitle('');
      setAppointmentType('Follow-up');
    }
  }, [appointment, initialDate, isOpen]); // Re-evaluate when modal opens or appointment/initialDate changes

  // Simulate fetching AI suggested time slots when date or patient changes
  useEffect(() => {
    if (date && patientId && isOpen) { // Fetch only when modal is open and relevant fields are set
      setIsFetchingAISlots(true);
      setAiSuggestedTimeSlots([]); // Clear previous suggestions
      // Simulate API call
      setTimeout(() => {
        const mockSuggestions = ['10:30', '11:00', '14:00', '14:30']; // Example suggestions
        // Filter suggestions to ensure they are not in the past if date is today
        const now = new Date();
        const relevantSuggestions = isSameDay(date, now) 
          ? mockSuggestions.filter(slot => {
              const [h, m] = slot.split(':').map(Number);
              return (h > now.getHours() || (h === now.getHours() && m > now.getMinutes()));
            })
          : mockSuggestions;
        setAiSuggestedTimeSlots(relevantSuggestions);
        setIsFetchingAISlots(false);
        if (relevantSuggestions.length > 0) {
          toast({ title: "AI Suggestions", description: "AI has suggested some optimal time slots." });
        }
      }, 700);
    } else {
      setAiSuggestedTimeSlots([]);
    }
  }, [date, patientId, clinicianId, isOpen, toast]); // Add isOpen to dependencies

  const handleSubmit = async () => {
    if (!patientId || !date || !startTime) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select patient, date, and time.' });
      return;
    }
    setIsLoading(true);

    const startDateTime = parse(startTime, 'HH:mm', date);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
    
    const patientName = patients.find(p => p.id === patientId)?.name || 'Patient';
    const titleToSave = customTitle || `${appointmentType} with ${patientName}`;

    const appointmentData: Omit<Appointment, 'id' | 'status'> = {
      patientId,
      clinicianId,
      start: startDateTime,
      end: endDateTime,
      title: titleToSave,
      type: appointmentType,
      clinicianName: "Dr. Current Clinician" // Placeholder
    };

    try {
      if (appointment?.id) { 
        await onSave({ ...appointmentData, id: appointment.id, status: appointment.status });
      } else { 
        await onSave(appointmentData);
      }
      toast({ title: `Appointment ${appointment ? 'Updated' : 'Scheduled'}`, description: `Successfully ${appointment ? 'updated' : 'scheduled'} for ${format(startDateTime, 'MMM d, yyyy \'at\' p')}.`});
      onOpenChange(false);
    } catch (error) {
       toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save appointment.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary">
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
          <DialogDescription>
            {appointment ? 'Update the details for this appointment.' : 'Schedule a new appointment for a patient.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="patient" className="text-right col-span-1">Patient</Label>
            <div className="col-span-3">
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger id="patient" className="w-full">
                   <Users className="h-4 w-4 mr-2 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <SelectValue placeholder="Select Patient" className="pl-8"/>
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right col-span-1">Date</Label>
            <Popover>
              <PopoverTrigger asChild className="col-span-3">
                <Button
                  id="date"
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right col-span-1">Start Time</Label>
            <div className="col-span-3">
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger id="startTime" className="w-full">
                   <Clock className="h-4 w-4 mr-2 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <SelectValue placeholder="Select Time" className="pl-8" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeSlots.map(slot => (
                    <SelectItem 
                        key={slot} 
                        value={slot} 
                        className={cn(aiSuggestedTimeSlots.includes(slot) && "font-bold text-green-600 bg-green-50/50")}
                    >
                      {slot} {aiSuggestedTimeSlots.includes(slot) && <Wand2 className="inline h-3 w-3 ml-1"/>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {isFetchingAISlots && <div className="col-start-2 col-span-3 text-xs text-muted-foreground">Checking for AI suggested slots...</div>}
          {!isFetchingAISlots && aiSuggestedTimeSlots.length > 0 && (
             <div className="col-start-2 col-span-3 text-xs text-green-700 bg-green-50 p-2 rounded-md flex items-center">
                <Wand2 className="h-4 w-4 mr-1.5 text-green-600"/> AI has suggested optimal time slots highlighted in the list.
              </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right col-span-1">Duration</Label>
            <Select value={String(duration)} onValueChange={(val) => setDuration(Number(val))}>
              <SelectTrigger id="duration" className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[15, 30, 45, 60, 90].map(d => <SelectItem key={d} value={String(d)}>{d} minutes</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="appointmentType" className="text-right col-span-1">Type</Label>
            <Select value={appointmentType} onValueChange={(v) => setAppointmentType(v as Appointment['type'])}>
              <SelectTrigger id="appointmentType" className="col-span-3"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Initial Consultation">Initial Consultation</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Telehealth Check-in">Telehealth Check-in</SelectItem>
                <SelectItem value="Routine Visit">Routine Visit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right col-span-1">Title (Opt.)</Label>
            <Input id="title" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} className="col-span-3" placeholder="e.g., Follow-up Session" />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading || isFetchingAISlots}>
            {isLoading ? "Saving..." : (appointment ? 'Save Changes' : 'Schedule Appointment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper to check if a date is today, for disabling past time slots
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};
