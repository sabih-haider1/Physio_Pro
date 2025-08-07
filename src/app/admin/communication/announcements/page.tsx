
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Megaphone, PlusCircle, Edit, Trash2, MoreHorizontal, Eye, Filter, RefreshCw } from 'lucide-react';
import type { PlatformAnnouncement, AnnouncementTarget } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export let mockAnnouncements: PlatformAnnouncement[] = [
  { id: 'anno1', title: 'New AI Exercise Search Feature!', content: 'We\'ve rolled out a new AI-powered search for the exercise library. Try natural language queries!', targetAudience: 'clinicians', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'published' },
  { id: 'anno2', title: 'Scheduled Maintenance: Sat 2 AM - 4 AM EST', content: 'The platform will undergo scheduled maintenance this Saturday. Expect brief downtime.', targetAudience: 'all', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'published' },
  { id: 'anno3', title: 'Upcoming Webinar: Maximizing Patient Engagement', content: 'Join us next Thursday for a webinar on new strategies for patient engagement. (Draft)', targetAudience: 'clinicians', createdAt: new Date().toISOString(), status: 'draft' },
];

export const addMockAnnouncement = (newAnnouncementData: Omit<PlatformAnnouncement, 'id' | 'createdAt'>) => {
  const newAnnouncement: PlatformAnnouncement = {
    ...newAnnouncementData,
    id: `anno${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  mockAnnouncements = [newAnnouncement, ...mockAnnouncements];
};

export const updateMockAnnouncement = (updatedAnnouncement: PlatformAnnouncement) => {
  const index = mockAnnouncements.findIndex(a => a.id === updatedAnnouncement.id);
  if (index !== -1) {
    mockAnnouncements[index] = updatedAnnouncement;
  } else {
    addMockAnnouncement(updatedAnnouncement); 
  }
  mockAnnouncements = [...mockAnnouncements];
};

export default function PlatformAnnouncementsPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>(() => [...mockAnnouncements]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<PlatformAnnouncement | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<AnnouncementTarget>('all');
  const [status, setStatus] = useState<PlatformAnnouncement['status']>('draft');

  const refreshAnnouncements = () => {
    setAnnouncements([...mockAnnouncements].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    toast({ title: "Announcements Refreshed" });
  };

  useEffect(() => {
    refreshAnnouncements();
  }, [mockAnnouncements.length]);


  const openFormForNew = () => {
    setEditingAnnouncement(null);
    setTitle('');
    setContent('');
    setTargetAudience('all');
    setStatus('draft');
    setIsFormOpen(true);
  };

  const openFormForEdit = (announcement: PlatformAnnouncement) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);
    setTargetAudience(announcement.targetAudience);
    setStatus(announcement.status);
    setIsFormOpen(true);
  };

  const handleSaveAnnouncement = () => {
    if (!title.trim() || !content.trim()) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Title and content are required.' });
      return;
    }

    if (editingAnnouncement) {
      const updatedData: PlatformAnnouncement = { ...editingAnnouncement, title, content, targetAudience, status };
      updateMockAnnouncement(updatedData);
      toast({ title: 'Announcement Updated', description: `"${title}" has been updated.` });
    } else {
      const newAnnouncementData: Omit<PlatformAnnouncement, 'id' | 'createdAt'> = {
        title, content, targetAudience, status,
      };
      addMockAnnouncement(newAnnouncementData);
      toast({ title: 'Announcement Created', description: `"${title}" has been created as ${status}.` });
    }
    refreshAnnouncements();
    setIsFormOpen(false);
    setEditingAnnouncement(null);
  };

  const handleDeleteAnnouncement = (id: string) => {
    mockAnnouncements = mockAnnouncements.filter(a => a.id !== id);
    refreshAnnouncements();
    toast({ title: 'Announcement Deleted', description: 'The announcement has been removed.' });
  };

  const getAudienceBadgeVariant = (audience: AnnouncementTarget) => {
    switch (audience) {
      case 'all': return 'default';
      case 'clinicians': return 'secondary';
      case 'patients': return 'outline'; 
      default: return 'outline';
    }
  };
   const getStatusBadgeVariant = (status: PlatformAnnouncement['status']) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Megaphone className="mr-3 h-8 w-8" /> Platform Announcements
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and publish announcements for clinicians and/or patients.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="default" onClick={refreshAnnouncements}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh List
            </Button>
            <Button onClick={openFormForNew} size="default">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Announcement
            </Button>
        </div>
      </div>

      {isFormOpen && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-headline">{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="announcementTitle">Title</Label>
              <Input id="announcementTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement Title" />
            </div>
            <div>
              <Label htmlFor="announcementContent">Content</Label>
              <Textarea id="announcementContent" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Full announcement text..." rows={5} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select value={targetAudience} onValueChange={(v) => setTargetAudience(v as AnnouncementTarget)}>
                  <SelectTrigger id="targetAudience"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="clinicians">Clinicians Only</SelectItem>
                    <SelectItem value="patients">Patients Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="announcementStatus">Status</Label>
                 <Select value={status} onValueChange={(v) => setStatus(v as PlatformAnnouncement['status'])}>
                  <SelectTrigger id="announcementStatus"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAnnouncement}>{editingAnnouncement ? 'Save Changes' : 'Create Announcement'}</Button>
          </CardFooter>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Existing Announcements ({announcements.length})</CardTitle>
          <CardDescription>View and manage previously created announcements.</CardDescription>
        </CardHeader>
        <CardContent>
          {announcements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((ann) => (
                  <TableRow key={ann.id}>
                    <TableCell className="font-medium max-w-xs truncate">{ann.title}</TableCell>
                    <TableCell><Badge variant={getAudienceBadgeVariant(ann.targetAudience)} className="capitalize">{ann.targetAudience.replace('_',' ')}</Badge></TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(ann.status)} className="capitalize">{ann.status}</Badge></TableCell>
                    <TableCell className="text-xs">{format(new Date(ann.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => openFormForEdit(ann)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => alert('Previewing announcement... (Not implemented)')}><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10" 
                            onSelect={() => handleDeleteAnnouncement(ann.id)}
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
            <p className="text-center text-muted-foreground py-6">No announcements found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
