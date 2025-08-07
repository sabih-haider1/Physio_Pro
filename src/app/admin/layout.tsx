
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
  SidebarGroupContent, 
} from "@/components/ui/sidebar";
import { Logo } from "@/components/global/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Users, Dumbbell, CreditCard, Settings, LogOut, User, Shield, History, Mail, Layers, MessageSquareWarning, Database, Megaphone, BarChartHorizontalBig, BookOpen } from "lucide-react"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/global/NotificationBell"; 
import { adminNotifications } from '@/lib/data/mock-notifications'; // Import admin notifications
import { useState } from 'react'; // Import useState for managing notifications
import type { NotificationItem } from '@/lib/types'; // Import NotificationItem type

const primaryNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Platform Analytics", icon: BarChartHorizontalBig },
];

const userManagementNavItems = [
   { href: "/admin/users", label: "Clinician Management", icon: Users },
   { href: "/admin/users/data-tools", label: "Patient Data Utilities", icon: Database },
   { href: "/admin/team", label: "Team Management", icon: Shield }, 
];

const contentManagementNavItems = [
  { href: "/admin/exercises", label: "Exercise Management", icon: Dumbbell },
  { href: "/admin/program-templates", label: "Program Templates", icon: Layers },
  { href: "/admin/content/education", label: "Educational Resources", icon: BookOpen },
];

const communicationNavItems = [
  { href: "/admin/communication/email-composer", label: "AI Email Composer", icon: Mail },
  { href: "/admin/communication/announcements", label: "Platform Announcements", icon: Megaphone },
];

const operationalNavItems = [
  { href: "/admin/billing", label: "Billing Management", icon: CreditCard },
  { href: "/admin/support/tickets", label: "Support Tickets", icon: MessageSquareWarning },
  { href: "/admin/audit-log", label: "Audit Log", icon: History }, 
  { href: "/admin/settings", label: "System Settings", icon: Settings },
];


export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Use state to manage notifications so NotificationBell can update it
  const [currentAdminNotifications, setCurrentAdminNotifications] = useState<NotificationItem[]>(adminNotifications);

  const handleLogout = () => {
    router.push('/login');
  };
  
  const renderNavGroup = (groupLabel: string, items: typeof primaryNavItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">{groupLabel}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/admin/analytics" && pathname.startsWith(item.href))}
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
      </SidebarGroupContent>
    </SidebarGroup>
  );
  

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
          <SidebarContent className="p-0 flex-grow"> 
            <SidebarMenu>
              {primaryNavItems.map((item) => (
                <SidebarMenuItem key={item.href} className="px-2">
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/admin/analytics" && pathname.startsWith(item.href))}
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
            
            {renderNavGroup("User & Team", userManagementNavItems)}
            {renderNavGroup("Content", contentManagementNavItems)}
            {renderNavGroup("Communication", communicationNavItems)}
            {renderNavGroup("Operations", operationalNavItems)}

          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
            <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
                <NotificationBell 
                  notifications={currentAdminNotifications} 
                  onUpdateNotifications={setCurrentAdminNotifications} 
                />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center">
                    <Avatar className="h-8 w-8 mr-2 group-data-[collapsible=icon]:mr-0">
                        <AvatarImage src="https://placehold.co/100x100.png?text=A" alt="Admin" data-ai-hint="person admin" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-medium">Admin User</p>
                        <p className="text-xs text-sidebar-foreground/70">Administrator</p>
                    </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56 ml-2 mb-1">
                    <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                    <Link href="/admin/profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
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
