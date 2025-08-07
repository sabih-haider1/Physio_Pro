
"use client"; 

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/global/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Dumbbell, Users, Calendar, MessageSquare, BarChart3, Settings, LogOut, Briefcase, Layers, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/global/NotificationBell"; 
import { clinicianNotifications } from '@/lib/data/mock-notifications'; // Import clinician notifications
import { useState } from 'react'; // Import useState
import type { NotificationItem } from '@/lib/types'; // Import NotificationItem type

const clinicianNavItems = [
  { href: "/clinician/dashboard", label: "Dashboard", icon: Home },
  { href: "/clinician/exercise-library", label: "Exercise Library", icon: Dumbbell },
  { href: "/clinician/program-builder", label: "Program Builder", icon: Briefcase },
  { href: "/clinician/program-templates", label: "Program Templates", icon: Layers },
  { href: "/clinician/programs", label: "My Programs", icon: Layers }, // Changed "Program Templates" to "My Programs" for assigned ones
  { href: "/clinician/patients", label: "Patients", icon: Users }, 
  { href: "/clinician/appointments", label: "Appointments", icon: Calendar },
  { href: "/clinician/messaging", label: "Messaging", icon: MessageSquare },
  { href: "/clinician/analytics", label: "Adherence Analytics", icon: BarChart3 },
];

export default function ClinicianLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); 
  const [currentClinicianNotifications, setCurrentClinicianNotifications] = useState<NotificationItem[]>(clinicianNotifications);

  const handleLogout = () => {
    router.push('/login');
  };
  

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar variant="sidebar" collapsible="icon" side="left">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <Logo className="text-sidebar-foreground group-data-[collapsible=icon]:hidden" />
              <div className="group-data-[collapsible=icon]:mx-auto">
                <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent" />
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2 flex-grow">
            <SidebarMenu>
              {clinicianNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== "/clinician/dashboard" && pathname.startsWith(item.href))}
                    tooltip={{children: item.label, className: "bg-primary text-primary-foreground"}}
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
            <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
                <NotificationBell 
                  notifications={currentClinicianNotifications} 
                  onUpdateNotifications={setCurrentClinicianNotifications} 
                />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center">
                    <Avatar className="h-8 w-8 mr-2 group-data-[collapsible=icon]:mr-0">
                        <AvatarImage src="https://placehold.co/100x100.png?text=C" alt="Clinician" data-ai-hint="person doctor" />
                        <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <div className="group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-medium">Dr. Clinician</p>
                        <p className="text-xs text-sidebar-foreground/70">Clinician View</p>
                    </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56 ml-2 mb-1">
                    <DropdownMenuLabel>Dr. Clinician</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                    <Link href="/clinician/settings"><Settings className="mr-2 h-4 w-4" /> Settings & Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-background">
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
