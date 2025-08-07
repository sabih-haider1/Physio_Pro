
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { EducationalResource } from '@/lib/types';
import { BookOpen, PlusCircle, MoreHorizontal, Edit2, Trash2, Search, Filter, RefreshCcw, Eye } from "lucide-react";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { mockEducationalResources, updateEducationalResource } from '@/lib/data/mock-educational-resources'; // Import centralized data
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const resourceStatuses: EducationalResource['status'][] = ['published', 'draft', 'archived'];
const resourceTypes: EducationalResource['type'][] = ['article', 'video'];

export default function AdminEducationalResourcesPage() {
  const { toast } = useToast();
  const [resources, setResources] = useState<EducationalResource[]>(() => [...mockEducationalResources]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ status: string; type: string }>({
    status: 'all',
    type: 'all',
  });
  const [resourceToDelete, setResourceToDelete] = useState<EducationalResource | null>(null);

  useEffect(() => {
    setResources([...mockEducationalResources]);
  }, [mockEducationalResources.length]);

  const refreshResources = () => {
    setResources([...mockEducationalResources]);
    toast({ title: 'Resource List Refreshed' });
  };

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const searchMatch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (res.tags && res.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const statusMatch = filters.status === 'all' || res.status === filters.status;
      const typeMatch = filters.type === 'all' || res.type === filters.type;
      return searchMatch && statusMatch && typeMatch;
    });
  }, [searchTerm, filters, resources]);

  const handleDeleteResource = () => {
    if (!resourceToDelete) return;
    const index = mockEducationalResources.findIndex(r => r.id === resourceToDelete.id);
    if (index !== -1) {
        mockEducationalResources.splice(index, 1); // Modify the imported array directly
    }
    refreshResources(); // This will now reflect the change
    toast({ title: 'Resource Deleted', description: `"${resourceToDelete.title}" has been removed.` });
    setResourceToDelete(null);
  };
  
  const getStatusBadgeVariant = (status: EducationalResource['status']): "default" | "secondary" | "outline" => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <BookOpen className="mr-3 h-8 w-8" /> Educational Resources Management
          </h1>
          <p className="text-muted-foreground">Create, edit, and manage articles and videos for patient education.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="default" onClick={refreshResources}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh List
            </Button>
            <Button asChild size="default">
            <Link href="/admin/content/education/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Resource
            </Link>
            </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Resource List ({filteredResources.length})</CardTitle>
          <CardDescription>Manage all educational content available to patients.</CardDescription>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, summary, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger><Filter className="mr-2 h-4 w-4 shrink-0 opacity-50"/><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {resourceStatuses.map(stat => <SelectItem key={stat} value={stat} className="capitalize">{stat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger><Filter className="mr-2 h-4 w-4 shrink-0 opacity-50"/><SelectValue placeholder="Filter by Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {resourceTypes.map(type => <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResources.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium max-w-xs truncate">{resource.title}</TableCell>
                    <TableCell className="capitalize">{resource.type}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(resource.status)} className="capitalize">{resource.status}</Badge></TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate">{(resource.tags || []).join(', ')}</TableCell>
                    <TableCell className="text-xs">{format(new Date(resource.createdAt), 'PP')}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                             <Link href={`/patient/education/${resource.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> Preview (Patient View)</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/content/education/${resource.id}/edit`}><Edit2 className="mr-2 h-4 w-4" /> Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10" 
                            onSelect={() => setResourceToDelete(resource)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Educational Resources Found</h3>
              <p>Try adjusting your filters or add a new resource.</p>
            </div>
          )}
        </CardContent>
      </Card>

       <AlertDialog open={!!resourceToDelete} onOpenChange={() => setResourceToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Resource: {resourceToDelete?.title}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the educational resource.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteResource} className={cn(buttonVariants({ variant: "destructive" }))}>
                Delete Resource
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

