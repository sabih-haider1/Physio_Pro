
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, CalendarCheck, MessageSquarePlus, Activity, ArrowRight, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Placeholder data - replace with actual data fetching
const summaryStats = [
  { title: "Active Patients", value: "78", icon: Users, color: "text-blue-500", bgColor: "bg-blue-100" },
  { title: "Appointments Today", value: "12", icon: CalendarCheck, color: "text-green-500", bgColor: "bg-green-100" },
  { title: "Unread Messages", value: "5", icon: MessageSquarePlus, color: "text-yellow-500", bgColor: "bg-yellow-100" },
  { title: "Overall Adherence", value: "85%", icon: Activity, color: "text-purple-500", bgColor: "bg-purple-100" },
];

const upcomingAppointments = [
  { id: "1", patientName: "John Doe", time: "10:00 AM", type: "Telehealth" },
  { id: "2", patientName: "Jane Smith", time: "11:30 AM", type: "In-Person" },
  { id: "3", patientName: "Robert Brown", time: "02:00 PM", type: "Telehealth" },
];

const atRiskPatients = [
  { id: "p1", name: "Alice Green", adherence: "60%", lastActivity: "3 days ago", program: "Knee Rehab" },
  { id: "p2", name: "Bob White", adherence: "55%", lastActivity: "4 days ago", program: "Shoulder Mobility" },
];

export default function ClinicianDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Clinician Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. Clinician! Here's your overview.</p>
        </div>
        <Button asChild>
          <Link href="/clinician/program-builder">Create New Program</Link>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">Current overview</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Upcoming Appointments</CardTitle>
            <CardDescription>Your schedule for today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div>
                    <p className="font-semibold">{apt.patientName}</p>
                    <p className="text-sm text-muted-foreground">{apt.time} - {apt.type}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/clinician/patients/${apt.id}`}>View <ArrowRight className="ml-1 h-4 w-4"/></Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No upcoming appointments today.</p>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/clinician/appointments">View Full Calendar</Link>
            </Button>
          </CardContent>
        </Card>

        {/* At-Risk Patients */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline">AI Insights: At-Risk Patients</CardTitle>
            <CardDescription>Patients needing attention based on adherence and activity.</CardDescription>
          </CardHeader>
          <CardContent>
            {atRiskPatients.length > 0 ? (
              <div className="space-y-4">
                {atRiskPatients.map((patient) => (
                  <div key={patient.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center mb-2 sm:mb-0">
                       <Image src={`https://placehold.co/40x40.png?text=${patient.name.charAt(0)}`} alt={patient.name} width={40} height={40} className="rounded-full mr-3" data-ai-hint="person face"/>
                      <div>
                        <p className="font-semibold text-primary">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.program}</p>
                      </div>
                    </div>
                    <div className="text-sm sm:text-right">
                      <p>Adherence: <span className="font-semibold text-destructive">{patient.adherence}</span></p>
                      <p className="text-muted-foreground">Last active: {patient.lastActivity}</p>
                    </div>
                     <Button variant="secondary" size="sm" asChild className="mt-2 sm:mt-0 sm:ml-4">
                        <Link href={`/clinician/patients/${patient.id}`}>Review Profile</Link>
                      </Button>
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-muted-foreground">No patients currently flagged as at-risk. Great job!</p>
            )}
             <Button variant="outline" className="w-full mt-6" asChild>
              <Link href="/clinician/analytics">View All Adherence Data</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

       {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" size="lg" asChild className="flex-col h-auto py-4">
            <Link href="/clinician/exercise-library" className="flex flex-col items-center">
              <BarChart3 className="h-6 w-6 mb-1" />
              <span>Exercise Library</span>
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="flex-col h-auto py-4">
            <Link href="/clinician/messaging" className="flex flex-col items-center">
              <MessageSquarePlus className="h-6 w-6 mb-1" />
              <span>Send Message</span>
            </Link>
          </Button>
           <Button variant="outline" size="lg" asChild className="flex-col h-auto py-4">
            <Link href="/clinician/patients" className="flex flex-col items-center">
              <Users className="h-6 w-6 mb-1" />
              <span>Manage Patients</span>
            </Link>
          </Button>
           <Button variant="outline" size="lg" asChild className="flex-col h-auto py-4">
            <Link href="/clinician/settings" className="flex flex-col items-center"> 
              <Settings className="h-6 w-6 mb-1" />
              <span>Account Settings</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
