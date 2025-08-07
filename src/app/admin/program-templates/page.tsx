
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
import type { Program } from '@/lib/types';
import { Layers, PlusCircle, MoreHorizontal, Edit2, Trash2, Search, RefreshCcw } from "lucide-react";
import { cn } from '@/lib/utils';

export let initialMockTemplates: Program[] = [
  { 
    id: 'tpl1', 
    name: 'ACL Rehab - Phase 1', 
    isTemplate: true, 
    category: 'Post-Surgery', 
    description: 'Initial phase for ACL recovery, focusing on gentle motion and swelling reduction.', 
    exercises: [
      { exerciseId: 'ex1', sets: 3, reps: 15, notes: 'Slow and controlled.' },
      { exerciseId: 'ex3', sets: 3, reps: 10, notes: 'Focus on range.' },
    ], 
    clinicianId: 'admin-system', 
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'template',
  },
  { 
    id: 'tpl2', 
    name: 'Rotator Cuff Strengthening - Basic', 
    isTemplate: true, 
    category: 'Shoulder', 
    description: 'Fundamental exercises to improve rotator cuff strength and stability.', 
    exercises: [
      { exerciseId: 'ex2', sets: 3, reps: 12 },
      { exerciseId: 'ex5', sets: 2, reps: 1, duration: '30s hold' },
    ], 
    clinicianId: 'admin-system', 
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'active', 
  },
  { 
    id: 'tpl3', 
    name: 'Low Back Pain Relief - Gentle', 
    isTemplate: true, 
    category: 'Spine', 
    description: 'Gentle mobility and stabilization exercises for acute low back pain.', 
    exercises: [
       { exerciseId: 'ex3', sets: 2, reps: 10 }, 
    ], 
    clinicianId: 'admin-system', 
    createdAt: new Date().toISOString(),
    status: 'draft', 
  },
];

export const addMockProgramTemplate = (newTemplate: Program) => {
  initialMockTemplates = [newTemplate, ...initialMockTemplates];
};

export const updateMockProgramTemplate = (updatedTemplate: Program) => {
  const index = initialMockTemplates.findIndex(t => t.id === updatedTemplate.id);
  if (index !== -1) {
    initialMockTemplates[index] = updatedTemplate;
  } else {
    addMockProgramTemplate(updatedTemplate);
  }
  initialMockTemplates = [...initialMockTemplates]; 
};


export default function ProgramTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Program[]>(() => [...initialMockTemplates]);
  const [searchTerm, setSearchTerm] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState<Program | null>(null);

  useEffect(() => {
    setTemplates([...initialMockTemplates]);
  }, [initialMockTemplates.length]);

  const refreshTemplates = () => {
    setTemplates([...initialMockTemplates]);
    toast({ title: 'Template List Refreshed', description: 'Displaying the latest template data.' });
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(tpl => 
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tpl.description && tpl.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tpl.category && tpl.category.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a,b) => a.name.localeCompare(b.name)); // Default sort by name
  }, [searchTerm, templates]);

  const handleDeleteTemplate = () => {
    if (!templateToDelete) return;
    initialMockTemplates = initialMockTemplates.filter(tpl => tpl.id !== templateToDelete.id);
    setTemplates([...initialMockTemplates]);
    toast({ title: 'Template Deleted', description: `"${templateToDelete.name}" has been removed.` });
    setTemplateToDelete(null);
  };
  
  const getStatusBadgeVariant = (status: Program['status']): "default" | "secondary" | "outline" => {
    if (status === 'template') return 'default'; 
    switch (status) {
      case 'active': return 'default';
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
            <Layers className="mr-3 h-8 w-8" /> Program Template Management
          </h1>
          <p className="text-muted-foreground">Create, manage, and categorize exercise program templates.</p>
        </div>
        <Button asChild>
          <Link href="/admin/program-templates/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Template
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Template List</CardTitle>
              <CardDescription>Browse and manage all available program templates.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshTemplates}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh List
            </Button>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Exercises</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      {template.category ? <Badge variant="outline">{template.category}</Badge> : <span className="text-xs text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground line-clamp-2 max-w-xs">{template.description || '-'}</TableCell>
                    <TableCell className="text-center">{template.exercises.length}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(template.status)} className="capitalize">{template.status === 'template' ? 'Active' : template.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/program-templates/${template.id}/edit`}><Edit2 className="mr-2 h-4 w-4" /> Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10" 
                            onSelect={(e) => { e.preventDefault(); setTemplateToDelete(template); }}
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
              <h3 className="text-lg font-medium">No Templates Found</h3>
              <p>Try adjusting your search terms or add a new template.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template: {templateToDelete?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the program template.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTemplate} className={cn(buttonVariants({ variant: "destructive" }))}>
                Delete Template
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
