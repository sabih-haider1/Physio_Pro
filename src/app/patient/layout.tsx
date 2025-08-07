
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
} from "@/components/ui/sidebar";
import { Logo } from "@/components/global/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Zap, BarChart2, MessageSquare, CalendarDays, BookOpen, Settings as SettingsIcon, LogOut } from "lucide-react"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/global/NotificationBell"; 
import { patientNotifications } from '@/lib/data/mock-notifications'; 
import { useState } from 'react'; 
import type { NotificationItem } from '@/lib/types'; 


const patientNavItems = [
  { href: "/patient/dashboard", label: "Dashboard", icon: Home },
  { href: "/patient/program", label: "My Program", icon: Zap },
  { href: "/patient/progress", label: "Progress", icon: BarChart2 },
  { href: "/patient/messaging", label: "Messages", icon: MessageSquare },
  { href: "/patient/appointments", label: "Appointments", icon: CalendarDays }, 
  { href: "/patient/education", label: "Learn", icon: BookOpen },
];

const mockPatientLayoutData = {
  name: "Alex Patient", 
  avatarUrl: "https://placehold.co/100x100.png?text=AP" 
};


export default function PatientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); 
  const [currentPatientNotifications, setCurrentPatientNotifications] = useState<NotificationItem[]>(patientNotifications);

  const handleLogout = () => {
    router.push('/login');
  };
  

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar variant="sidebar" collapsible="icon" side="left" className="shadow-lg">
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
              {patientNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== "/patient/dashboard" && pathname.startsWith(item.href))}
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
                  notifications={currentPatientNotifications} 
                  onUpdateNotifications={setCurrentPatientNotifications} 
                />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center">
                    <Avatar className="h-8 w-8 mr-2 group-data-[collapsible=icon]:mr-0">
                        <AvatarImage src={mockPatientLayoutData.avatarUrl} alt={mockPatientLayoutData.name} data-ai-hint="person face" />
                        <AvatarFallback>{mockPatientLayoutData.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-medium">{mockPatientLayoutData.name}</p>
                        <p className="text-xs text-sidebar-foreground/70">Patient View</p>
                    </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56 ml-2 mb-1">
                    <DropdownMenuLabel>{mockPatientLayoutData.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                    <Link href="/patient/settings"><SettingsIcon className="mr-2 h-4 w-4" /> Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-muted/40"> 
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
