
"use client";

import { useState, useMemo, useEffect } from 'react'; // Added useEffect
import Link from 'next/link';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Program } from '@/lib/types';
import { Layers, Search, Eye, Briefcase, RefreshCcw } from "lucide-react"; // Added RefreshCcw
import { initialMockTemplates } from '@/app/admin/program-templates/page'; 
import { useRouter } from 'next/navigation'; 

export default function ClinicianProgramTemplatesPage() {
  const { toast } = useToast();
  const router = useRouter();
  // Local state to hold templates, initialized from the shared mock data
  const [templates, setTemplates] = useState<Program[]>(() => 
    initialMockTemplates.filter(t => t.status === 'active' || t.status === 'template')
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Effect to re-sync local state if global mockTemplates array length changes
  useEffect(() => {
    setTemplates(initialMockTemplates.filter(t => t.status === 'active' || t.status === 'template'));
  }, [initialMockTemplates.length]); // Basic re-sync on add/delete from global

  const refreshTemplates = () => {
    setTemplates(initialMockTemplates.filter(t => t.status === 'active' || t.status === 'template'));
    toast({ title: 'Template List Refreshed', description: 'Displaying the latest template data.' });
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(tpl => 
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tpl.description && tpl.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tpl.category && tpl.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, templates]);

  const handleUseTemplate = (templateId: string) => {
    toast({ title: "Use Template (Simulated)", description: `Navigating to program builder with template ${templateId} pre-selected.` });
    router.push(`/clinician/program-builder?templateId=${templateId}`);
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
            <Layers className="mr-3 h-8 w-8" /> Program Templates
          </h1>
          <p className="text-muted-foreground">Browse available program templates to kickstart your patient programs.</p>
        </div>
         <Button variant="outline" size="sm" onClick={refreshTemplates}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh List
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>Review and select from professionally designed program templates.</CardDescription>
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
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleUseTemplate(template.id)}>
                        <Briefcase className="mr-2 h-4 w-4" /> Use Template
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Templates Found</h3>
              <p>No active program templates match your search, or none are available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

