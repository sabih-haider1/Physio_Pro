
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users, PlusCircle, Search as SearchIcon, Filter, ArrowUpDown, MoreVertical,
  Eye, Edit, Trash2, PlayCircle, LogIn, ShieldAlert, ShieldCheck, Mail, CalendarDays, UserCheck, Briefcase, ListFilter, UserPlus, Trash, FileDown, UserCog, RefreshCw, Download, CreditCard, MapPin
} from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import type { AdminUser, UserRole, UserStatus, ProfessionalRole, SubscriptionStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { professionalRoles as professionalRolesList } from '@/lib/types';
import { mockPlans } from '@/app/admin/billing/page'; 

const isProfessionalRole = (role: UserRole): role is ProfessionalRole => {
  return professionalRolesList.includes(role as ProfessionalRole);
};


export let initialMockUsers: AdminUser[] = [
  { id: 'doc1', name: 'Dr. Ayesha Khan', email: 'ayesha@medcare.com', role: 'Physiotherapist', status: 'active', joinedDate: '2024-01-12', patientCount: 18, appointmentCount: 152, avatarUrl: 'https://placehold.co/100x100.png?text=AK', specialization: "Musculoskeletal Rehab", currentPlanId: "plan_pro_monthly", subscriptionStatus: 'active', city: "Karachi" },
  { id: 'doc2', name: 'Dr. Usman Tariq', email: 'usman@brainclinic.com', role: 'Doctor', status: 'suspended', joinedDate: '2024-03-03', patientCount: 5, appointmentCount: 32, avatarUrl: 'https://placehold.co/100x100.png?text=UT', specialization: "Neurology", currentPlanId: "plan_basic_monthly", subscriptionStatus: 'cancelled', city: "Lahore" },
  { id: 'doc3', name: 'Dr. Sofia Alverez', email: 'sofia.a@health.org', role: 'Chiropractor', status: 'pending', joinedDate: '2024-05-01', patientCount: 0, appointmentCount: 0, avatarUrl: 'https://placehold.co/100x100.png?text=SA', specialization: "Spinal Adjustments", subscriptionStatus: 'trial', city: "Islamabad" },
  { id: 'doc_current', name: 'Dr. Clinician (Demo)', email: 'dr.clinician@physiopro.app', role: 'Physiotherapist', status: 'active', joinedDate: '2023-05-01', patientCount: 12, appointmentCount: 88, avatarUrl: 'https://placehold.co/100x100.png?text=DC', specialization: "Sports Injury Rehab", currentPlanId: "plan_pro_monthly", subscriptionStatus: 'active', city: "Karachi" },
  { id: 'doc4', name: 'Dr. Ken Miles', email: 'ken.miles@health.org', role: 'Sports Therapist', status: 'active', joinedDate: '2023-11-15', patientCount: 25, appointmentCount: 210, avatarUrl: 'https://placehold.co/100x100.png?text=KM', whatsappNumber: "+15551237890", currentPlanId: "plan_pro_monthly", subscriptionStatus: 'active', city: "Lahore" },
  { id: 'doc5', name: 'Dr. Lena Ray', email: 'lena.ray@clinic.dev', role: 'Nutritionist', status: 'inactive', joinedDate: '2024-02-01', patientCount: 10, appointmentCount: 45, avatarUrl: 'https://placehold.co/100x100.png?text=LR', specialization: "Pediatric Nutrition", subscriptionStatus: 'none', city: "Islamabad" },
];

export const addMockClinician = (newClinicianData: Omit<AdminUser, 'id' | 'joinedDate' | 'patientCount' | 'appointmentCount' | 'avatarUrl'>) => {
  const newClinician: AdminUser = {
    ...newClinicianData,
    id: `doc${Date.now()}`,
    joinedDate: new Date().toISOString().split('T')[0],
    patientCount: 0,
    appointmentCount: 0,
    avatarUrl: `https://placehold.co/100x100.png?text=${newClinicianData.name.split(' ').map(n=>n[0]).join('') || 'P'}`,
    subscriptionStatus: newClinicianData.currentPlanId ? 'active' : 'trial', 
    city: newClinicianData.city || 'Not Specified',
  };
  initialMockUsers = [newClinician, ...initialMockUsers];
  initialMockUsers = [...initialMockUsers]; // Ensure new array reference
};

export const updateMockUser = (updatedUser: AdminUser) => {
  const index = initialMockUsers.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    initialMockUsers[index] = updatedUser;
  } else {
    initialMockUsers = [updatedUser, ...initialMockUsers];
  }
  initialMockUsers = [...initialMockUsers]; // Ensure new array reference
};


const userStatusesForFilter: UserStatus[] = ['active', 'inactive', 'pending', 'suspended'];
const subscriptionStatusesForFilter: SubscriptionStatus[] = ['active', 'trial', 'pending_payment', 'payment_rejected', 'cancelled', 'none'];


type SortByType = 'joinedDateDesc' | 'joinedDateAsc' | 'nameAsc' | 'nameDesc';

interface UserCardProps {
  user: AdminUser;
  onEdit: (userId: string) => void;
  onSuspend: (userId: string) => void;
  onActivate: (userId: string) => void;
  onDelete: (user: AdminUser) => void;
  onLoginAs?: (userId: string) => void;
  isSelected: boolean;
  onToggleSelect: (userId: string) => void;
}

const UserCardComponent: React.FC<UserCardProps> = ({
  user, onEdit, onSuspend, onActivate, onDelete, onLoginAs, isSelected, onToggleSelect
}) => {

  const getStatusStyles = (status: UserStatus) => {
    switch (status) {
      case 'active': return { icon: ShieldCheck, color: 'text-green-600', text: 'ACTIVE' };
      case 'pending': return { icon: ShieldAlert, color: 'text-yellow-600', text: 'PENDING' };
      case 'suspended': return { icon: ShieldAlert, color: 'text-red-600', text: 'SUSPENDED' };
      case 'inactive': return { icon: ShieldAlert, color: 'text-gray-500', text: 'INACTIVE' };
      default: return { icon: ShieldAlert, color: 'text-gray-500', text: status.toUpperCase() };
    }
  };
  const statusInfo = getStatusStyles(user.status);
  const planDetails = mockPlans.find(p => p.id === user.currentPlanId);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(user.id)}
              aria-label={`Select user ${user.name}`}
              className="mt-1"
            />
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person professional"/>
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-primary">{user.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center">
                <Briefcase className="mr-1.5 h-4 w-4"/>
                {user.role}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => onEdit(user.id)}><Edit className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
              {user.status === 'active' && <DropdownMenuItem onSelect={() => onSuspend(user.id)} className="text-orange-600 focus:text-orange-600"><ShieldAlert className="mr-2 h-4 w-4" /> Suspend</DropdownMenuItem>}
              {(user.status === 'suspended' || user.status === 'inactive' || user.status === 'pending') && <DropdownMenuItem onSelect={() => onActivate(user.id)} className="text-green-600 focus:text-green-600"><ShieldCheck className="mr-2 h-4 w-4" /> Activate</DropdownMenuItem>}
              {onLoginAs && <DropdownMenuItem onSelect={() => onLoginAs(user.id)}><LogIn className="mr-2 h-4 w-4" /> Login As</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onDelete(user)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Account</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <p className="flex items-center text-muted-foreground"><Mail className="mr-2 h-4 w-4 shrink-0"/> {user.email}</p>
          <p className="flex items-center text-muted-foreground"><CalendarDays className="mr-2 h-4 w-4 shrink-0"/> Joined: {new Date(user.joinedDate).toLocaleDateString()}</p>
          <p className="flex items-center text-muted-foreground"><Users className="mr-2 h-4 w-4 shrink-0"/> {user.patientCount ?? 0} Patients</p>
          <p className={cn("flex items-center font-medium", statusInfo.color)}><statusInfo.icon className="mr-2 h-4 w-4 shrink-0"/> Status: {statusInfo.text}</p>
          <p className="flex items-center text-muted-foreground"><ListFilter className="mr-2 h-4 w-4 shrink-0"/> Appointments: {user.appointmentCount ?? 0}</p>
          <p className="flex items-center text-muted-foreground capitalize">
            <CreditCard className="mr-2 h-4 w-4 shrink-0"/> Plan: {planDetails?.name || user.currentPlanId || 'N/A'} ({user.subscriptionStatus?.replace('_',' ') || 'N/A'})
          </p>
           {user.city && <p className="flex items-center text-muted-foreground"><MapPin className="mr-2 h-4 w-4 shrink-0"/> {user.city}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

const escapeCSVField = (field: any): string => {
  if (field === null || field === undefined) {
    return '';
  }
  let stringField = String(field);
  if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
    stringField = `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};


export default function ClinicianManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionStatus | 'all'>('all');
  const [cityFilter, setCityFilter] = useState<string | 'all'>('all'); // New city filter state
  const [sortBy, setSortBy] = useState<SortByType>('joinedDateDesc');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { toast } = useToast();
  const router = require('next/navigation').useRouter();
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const refreshClinicianList = useCallback(() => {
    const professionalUsers = initialMockUsers.filter(user => isProfessionalRole(user.role));
    setUsers([...professionalUsers]); // Create new array reference
    setAvailableCities(Array.from(new Set(professionalUsers.map(user => user.city || "Unknown").filter(city => city !== "Unknown"))).sort());
  }, []); // Removed initialMockUsers.length dependency

  useEffect(() => {
    refreshClinicianList();
  }, [refreshClinicianList]);


  const filteredAndSortedClinicians = useMemo(() => {
    let SfilteredUsers = users.filter(user => {
      const roleMatch = isProfessionalRole(user.role);
      const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const SstatusMatch = statusFilter === 'all' || user.status === statusFilter;
      const subStatusMatch = subscriptionFilter === 'all' || user.subscriptionStatus === subscriptionFilter;
      const currentCityFilter = cityFilter === 'all' || user.city === cityFilter;
      return roleMatch && searchMatch && SstatusMatch && subStatusMatch && currentCityFilter;
    });

    SfilteredUsers.sort((a, b) => {
      switch (sortBy) {
        case 'joinedDateDesc': return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        case 'joinedDateAsc': return new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
        case 'nameAsc': return a.name.localeCompare(b.name);
        case 'nameDesc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });
    return SfilteredUsers;
  }, [users, searchTerm, statusFilter, subscriptionFilter, cityFilter, sortBy]);

  const handleToggleSelectUser = (userId: string) => {
    setSelectedUserIds(prevSelected =>
      prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredAndSortedClinicians.length && filteredAndSortedClinicians.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredAndSortedClinicians.map(user => user.id));
    }
  };

  const handleEditUser = (userId: string) => router.push(`/admin/users/${userId}/edit`);

  const handleSuspendUser = (userId: string) => {
    const userToUpdate = initialMockUsers.find(u => u.id === userId);
    if (userToUpdate) {
      updateMockUser({ ...userToUpdate, status: 'suspended' });
      refreshClinicianList();
      toast({ title: 'Clinician Suspended', description: `Clinician ${userToUpdate.name} has been suspended.` });
    }
  };
  const handleActivateUser = (userId: string) => {
     const userToUpdate = initialMockUsers.find(u => u.id === userId);
    if (userToUpdate) {
      updateMockUser({ ...userToUpdate, status: 'active' });
      refreshClinicianList();
      toast({ title: 'Clinician Activated', description: `Clinician ${userToUpdate.name} has been activated.` });
    }
  };
  const handleDeleteUserConfirmed = () => {
    if (!userToDelete) return;
    updateMockUser({ ...userToDelete, status: 'inactive' }); // Soft delete by making inactive for demo
    // initialMockUsers = initialMockUsers.filter(u => u.id !== userToDelete.id); // For hard delete
    refreshClinicianList();
    toast({ title: 'Clinician Account Deactivated', description: `Clinician ${userToDelete.name} has been set to inactive.` });
    setUserToDelete(null);
    setSelectedUserIds(prev => prev.filter(id => id !== userToDelete.id));
  };
  const handleLoginAs = (userId: string) => {
    const userToLoginAs = users.find(u=>u.id===userId);
    toast({ title: 'Login As Feature (Simulated)', description: `Simulating login as ${userToLoginAs?.name}. Redirecting to clinician dashboard...` });
    setTimeout(() => {
        router.push('/clinician/dashboard');
    }, 1500);
  };

  const generateClinicianCSV = (cliniciansToExport: AdminUser[]): string => {
    if (cliniciansToExport.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'There are no clinicians to export.',
        variant: 'destructive'
      });
      return '';
    }

    const headers = [
      "ID", "Name", "Email", "Role", "Specialization", "Account Status",
      "Joined Date", "Patient Count", "Appointment Count", "WhatsApp Number", "Current Plan ID", "Subscription Status", "City"
    ];

    const csvRows = [headers.join(',')];

    cliniciansToExport.forEach(user => {
      const row = [
        escapeCSVField(user.id),
        escapeCSVField(user.name),
        escapeCSVField(user.email),
        escapeCSVField(user.role),
        escapeCSVField(user.specialization),
        escapeCSVField(user.status),
        escapeCSVField(user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : ''),
        escapeCSVField(user.patientCount),
        escapeCSVField(user.appointmentCount),
        escapeCSVField(user.whatsappNumber),
        escapeCSVField(user.currentPlanId),
        escapeCSVField(user.subscriptionStatus),
        escapeCSVField(user.city),
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  };

  const downloadCSV = (csvString: string, filename: string) => {
    if (!csvString) return;
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBulkExport = () => {
    const selectedClinicians = initialMockUsers.filter(user => selectedUserIds.includes(user.id) && isProfessionalRole(user.role));
    const csvString = generateClinicianCSV(selectedClinicians);
    if (csvString) {
      downloadCSV(csvString, 'selected_clinicians.csv');
      toast({
        title: 'Export Successful',
        description: `CSV file with ${selectedClinicians.length} selected clinicians has been downloaded.`,
      });
    }
  };

  const handleExportAllVisibleCSV = () => {
    const csvString = generateClinicianCSV(filteredAndSortedClinicians);
    if (csvString) {
      downloadCSV(csvString, 'all_visible_clinicians.csv');
      toast({
        title: 'Export Successful',
        description: `CSV file with ${filteredAndSortedClinicians.length} visible clinicians has been downloaded.`,
      });
    }
  };


  const handleBulkSuspend = () => {
    selectedUserIds.forEach(id => {
      const userToUpdate = initialMockUsers.find(u => u.id === id);
      if (userToUpdate) updateMockUser({ ...userToUpdate, status: 'suspended' });
    });
    refreshClinicianList();
    toast({ title: 'Bulk Suspend', description: `${selectedUserIds.length} clinicians suspended.` });
    setSelectedUserIds([]);
  };
  const handleBulkDelete = () => {
    // For demo, we'll mark as inactive instead of hard delete
    const numToDelete = selectedUserIds.length;
    selectedUserIds.forEach(id => {
      const userToUpdate = initialMockUsers.find(u => u.id === id);
      if (userToUpdate) updateMockUser({ ...userToUpdate, status: 'inactive' });
    });
    refreshClinicianList();
    toast({ title: 'Bulk Deactivate', description: `${numToDelete} clinicians set to inactive.` });
    setSelectedUserIds([]);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
             <UserCog className="mr-3 h-8 w-8"/> Clinician Management
          </h1>
          <p className="text-muted-foreground">View, manage, and approve clinician accounts. Internal admin staff are managed under "Team Management".</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="default" onClick={handleExportAllVisibleCSV} disabled={filteredAndSortedClinicians.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export All Visible
            </Button>
            <Button variant="outline" size="default" onClick={refreshClinicianList}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh List
            </Button>
            <Button asChild size="default">
            <Link href="/admin/users/new"><UserPlus className="mr-2 h-4 w-4" /> Add Clinician</Link>
            </Button>
        </div>
      </div>

      <Card className="shadow-sm">
         <CardHeader>
          <CardTitle>Clinician List & Tools</CardTitle>
          <CardDescription>Browse, filter, sort, and manage all clinician accounts on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:flex gap-3">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatus | 'all')}>
                <SelectTrigger className="w-full lg:w-[160px]">
                  <Filter className="mr-2 h-4 w-4 shrink-0"/>
                  <SelectValue placeholder="Acc. Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Acc. Statuses</SelectItem>
                  {userStatusesForFilter.map(status => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={subscriptionFilter} onValueChange={(value) => setSubscriptionFilter(value as SubscriptionStatus | 'all')}>
                <SelectTrigger className="w-full lg:w-[160px]">
                  <CreditCard className="mr-2 h-4 w-4 shrink-0"/>
                  <SelectValue placeholder="Sub. Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub. Statuses</SelectItem>
                  {subscriptionStatusesForFilter.map(status => <SelectItem key={status} value={status} className="capitalize">{status.replace('_',' ')}</SelectItem>)}
                </SelectContent>
              </Select>
               <Select value={cityFilter} onValueChange={(value) => setCityFilter(value as string | 'all')}>
                <SelectTrigger className="w-full lg:w-[160px]">
                  <MapPin className="mr-2 h-4 w-4 shrink-0"/>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {availableCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortByType)}>
                <SelectTrigger className="w-full lg:w-[160px]">
                  <ArrowUpDown className="mr-2 h-4 w-4 shrink-0"/>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joinedDateDesc">Date Joined (Newest)</SelectItem>
                  <SelectItem value="joinedDateAsc">Date Joined (Oldest)</SelectItem>
                  <SelectItem value="nameAsc">Name (A-Z)</SelectItem>
                  <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2 my-2">
              <Checkbox
                id="selectAllVisible"
                checked={selectedUserIds.length === filteredAndSortedClinicians.length && filteredAndSortedClinicians.length > 0}
                onCheckedChange={handleSelectAll}
                disabled={filteredAndSortedClinicians.length === 0}
              />
              <label htmlFor="selectAllVisible" className="text-sm font-medium">
                Select All Visible ({filteredAndSortedClinicians.length})
              </label>
            </div>


          {filteredAndSortedClinicians.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAndSortedClinicians.map((user) => (
                <UserCardComponent
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onSuspend={handleSuspendUser}
                  onActivate={handleActivateUser}
                  onDelete={setUserToDelete}
                  onLoginAs={handleLoginAs}
                  isSelected={selectedUserIds.includes(user.id)}
                  onToggleSelect={handleToggleSelectUser}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <SearchIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No clinicians found matching your criteria.</p>
              {users.filter(u => isProfessionalRole(u.role)).length === 0 && (
                <p className="mt-2">There are currently no clinicians registered on the platform.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUserIds.length > 0 && (
        <Card className="shadow-md sticky bottom-4 z-10 backdrop-blur-sm bg-background/90">
          <CardContent className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm font-medium">
               {selectedUserIds.length} clinician(s) selected
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button variant="outline" size="sm" onClick={handleBulkSuspend} disabled={selectedUserIds.length === 0}><ShieldAlert className="mr-2 h-4 w-4"/>Suspend</Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={selectedUserIds.length === 0}><Trash className="mr-2 h-4 w-4"/>Deactivate</Button>
              <Button variant="outline" size="sm" onClick={handleBulkExport} disabled={selectedUserIds.length === 0}><FileDown className="mr-2 h-4 w-4"/>Export CSV</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Clinician Account: {userToDelete.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will set the clinician's account to 'inactive'. They will not be permanently deleted but will lose access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUserConfirmed} className={buttonVariants({ variant: "destructive" })}>
                Deactivate Clinician
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
