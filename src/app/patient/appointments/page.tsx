
"use client";

import { useState, useEffect } from 'react';
import type { Appointment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CalendarDays, PlusCircle, Edit, XCircle, MapPin } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with actual data fetching
const mockAppointments: Appointment[] = [
  { 
    id: 'apt1', patientId: 'p1', clinicianId: 'doc_current', clinicianName: 'Dr. Emily Carter',
    start: new Date(new Date().setDate(new Date().getDate() + 3)), 
    end: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(new Date().getHours() + 1)), 
    title: 'Knee Follow-up', status: 'scheduled', type: 'Follow-up', 
  },
  { 
    id: 'apt2', patientId: 'p1', clinicianId: 'doc_current', clinicianName: 'Dr. Emily Carter',
    start: new Date(new Date().setDate(new Date().getDate() - 7)), 
    end: new Date(new Date(new Date().setDate(new Date().getDate() - 7)).setHours(new Date().getHours() + 1)), 
    title: 'Initial Consultation', status: 'completed', type: 'Initial Consultation'
  },
  { 
    id: 'apt3', patientId: 'p1', clinicianId: 'doc_current', clinicianName: 'Dr. Alex Chen',
    start: new Date(new Date().setDate(new Date().getDate() + 10)), 
    end: new Date(new Date(new Date().setDate(new Date().getDate() + 10)).setHours(new Date().getHours() + 0.5)), 
    title: 'Quick Check-in', status: 'scheduled', type: 'Telehealth Check-in',
  },
   { 
    id: 'apt4', patientId: 'p1', clinicianId: 'doc_current', clinicianName: 'Dr. Emily Carter',
    start: new Date(new Date().setDate(new Date().getDate() - 2)), 
    end: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(new Date().getHours() + 1)), 
    title: 'Pre-surgery consultation', status: 'cancelled', type: 'Follow-up'
  },
];


export default function PatientAppointmentsPage() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const pastAppointments = appointments
    .filter(apt => apt.status !== 'scheduled' || new Date(apt.start) < new Date())
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments(prev => prev.map(apt => apt.id === appointmentId ? {...apt, status: 'cancelled'} : apt));
    toast({ title: "Appointment Cancelled", description: "Your appointment has been cancelled. Please contact your clinician if this was a mistake." });
  };
  
  const getStatusColor = (status: Appointment['status']) => {
    switch(status) {
      case 'scheduled': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  const AppointmentCard = ({ apt }: { apt: Appointment }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg font-semibold">{apt.title || apt.type || "Appointment"}</CardTitle>
                <CardDescription className="text-sm">With {apt.clinicianName || 'Your Clinician'}</CardDescription>
            </div>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", 
                apt.status === 'scheduled' && 'bg-blue-100 text-blue-700',
                apt.status === 'completed' && 'bg-green-100 text-green-700',
                apt.status === 'cancelled' && 'bg-red-100 text-red-700',
                apt.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                !apt.status && 'bg-gray-100 text-gray-700'
            )}>
            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
            </span>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <p><strong className="text-muted-foreground">Date:</strong> {format(new Date(apt.start), 'EEEE, MMMM d, yyyy')}</p>
        <p><strong className="text-muted-foreground">Time:</strong> {format(new Date(apt.start), 'p')} - {format(new Date(apt.end), 'p')}</p>
        <p className="flex items-center">
            <MapPin className="mr-1.5 h-4 w-4 text-primary"/> 
            {apt.type === 'Telehealth Check-in' ? 'Remote Check-in' : apt.city ? apt.city : 'In-Person Visit'}
        </p>
      </CardContent>
      {apt.status === 'scheduled' && new Date(apt.start) >= new Date() && (
        <CardFooter className="border-t pt-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast({title: "Edit Appointment (Simulated)", description: "Please contact your clinic to reschedule."})}>
                <Edit className="mr-1.5 h-3 w-3"/> Reschedule
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleCancelAppointment(apt.id)}>
                <XCircle className="mr-1.5 h-3 w-3"/> Cancel
            </Button>
        </CardFooter>
      )}
    </Card>
  );


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <CalendarDays className="mr-3 h-8 w-8" /> Your Appointments
          </h1>
          <p className="text-muted-foreground">View your upcoming and past appointments.</p>
        </div>
        {/* 
        // Patient self-booking is disabled for now as per requirements
        <Button asChild size="lg" disabled>
          <Link href="/patient/book-appointment"> // This link points to the "unavailable" page
            <PlusCircle className="mr-2 h-5 w-5" /> Book New Appointment
          </Link>
        </Button> 
        */}
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Upcoming Appointments</h2>
        {upcomingAppointments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAppointments.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <p>You have no upcoming appointments scheduled.</p>
              {/* 
              // Patient self-booking is disabled
              <p className="mt-2">
                <Button asChild size="sm" disabled>
                  <Link href="/patient/book-appointment">Book a New Appointment</Link>
                </Button>
              </p> 
              */}
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Past Appointments</h2>
        {pastAppointments.length > 0 ? (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastAppointments.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <p>No past appointment history found.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
