
"use client";

import { useState, useEffect } from 'react'; // Added useEffect
import type { Appointment, Patient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react"; // Renamed to avoid conflict
import { AppointmentCalendar } from '@/components/features/appointments/AppointmentCalendar';
import { AppointmentFormModal } from '@/components/features/appointments/AppointmentFormModal';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with actual data fetching
const mockPatients: Patient[] = [
  { id: "p1", userId: "usr_p1", name: "Alice Green", conditions: ["Knee Rehab"], avatarUrl: "https://placehold.co/40x40.png?text=AG" },
  { id: "p2", userId: "usr_p2", name: "Bob White", conditions: ["Shoulder Mobility"], avatarUrl: "https://placehold.co/40x40.png?text=BW" },
  { id: "p3", userId: "usr_p3", name: "Charlie Black", conditions: ["Low Back Pain"], avatarUrl: "https://placehold.co/40x40.png?text=CB" },
];

// Make initialMockAppointments exportable if it's not already, or manage it via state
export let initialMockAppointments: Appointment[] = [
  { id: 'apt1', patientId: 'p1', clinicianId: 'doc_current', start: new Date(new Date().setDate(new Date().getDate() + 1)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(new Date().getHours() + 1)), title: 'Follow-up for Alice', status: 'scheduled', type: 'Follow-up' },
  { id: 'apt2', patientId: 'p2', clinicianId: 'doc_current', start: new Date(new Date().setDate(new Date().getDate() + 2)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(new Date().getHours() + 1)), title: 'Initial Assessment Bob', status: 'scheduled', type: 'Initial Consultation'},
  { id: 'apt3', patientId: 'p1', clinicianId: 'doc_current', start: new Date(new Date().setDate(new Date().getDate() - 1)), end: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(new Date().getHours() + 1)), title: 'Alice Previous Session', status: 'completed', type: 'Follow-up' },
];

export default function AppointmentsPage() {
  const { toast } = useToast();
  // Manage appointments with state for dynamic updates
  const [appointments, setAppointments] = useState<Appointment[]>(() => [...initialMockAppointments]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [initialDateForNew, setInitialDateForNew] = useState<Date | undefined>(new Date());
  const currentClinicianId = "doc_current"; 
  
  // Simulate AI suggested slots for dates
  const [aiSuggestedCalendarSlots, setAiSuggestedCalendarSlots] = useState<Date[]>([]);

  useEffect(() => {
    // Simulate fetching AI suggested slots for the current month
    const today = new Date();
    setAiSuggestedCalendarSlots([
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
    ]);
  }, []);


  const handleAddAppointment = (date: Date) => {
    setEditingAppointment(null);
    setInitialDateForNew(date);
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };
  
  const handleSaveAppointment = async (data: Omit<Appointment, 'id' | 'status'> | Appointment) => {
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if ('id' in data) { // Editing existing
          // Update in the global mock array
          const index = initialMockAppointments.findIndex(apt => apt.id === data.id);
          if (index !== -1) initialMockAppointments[index] = { ...initialMockAppointments[index], ...data };
          
          // Update local state
          setAppointments(prev => prev.map(apt => apt.id === data.id ? { ...apt, ...data } : apt));
        } else { // Creating new
          const newAppointment: Appointment = {
            ...data,
            id: `apt${Date.now()}`,
            status: 'scheduled', 
          };
          initialMockAppointments.push(newAppointment); // Add to global mock array
          setAppointments(prev => [...prev, newAppointment]); // Update local state
        }
        resolve();
      }, 500);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Appointment Scheduling</h1>
          <p className="text-muted-foreground">Manage your appointments and schedule new ones.</p>
        </div>
      </div>

      <AppointmentCalendar 
        appointments={appointments} // Pass stateful appointments
        onAddAppointment={handleAddAppointment}
        onEditAppointment={handleEditAppointment}
        aiSuggestedSlots={aiSuggestedCalendarSlots} // Pass simulated AI suggested slots
      />

      <AppointmentFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        appointment={editingAppointment}
        initialDate={initialDateForNew}
        patients={mockPatients}
        clinicianId={currentClinicianId}
        onSave={handleSaveAppointment} // This will now update the state, re-rendering the calendar
      />
    </div>
  );
}
