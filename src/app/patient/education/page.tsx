
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Youtube, FileText, Search, ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { EducationalResource } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react"; // Added useEffect
import { mockEducationalResources } from '@/lib/data/mock-educational-resources'; // Import from centralized location

export default function PatientEducationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  // Use the centralized mock data
  const [resources, setResources] = useState<EducationalResource[]>([]);

  useEffect(() => {
    // Filter for published resources from the central store
    setResources(mockEducationalResources.filter(r => r.status === 'published'));
  }, []); // Empty dependency array ensures this runs once on mount

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <BookOpen className="mr-3 h-8 w-8" /> Patient Education Hub
          </h1>
          <p className="text-muted-foreground">Learn more about your condition, exercises, and recovery.</p>
        </div>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Find Resources</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search articles and videos (e.g., knee, stretching, back pain)..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>


      {filteredResources.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              {resource.thumbnailUrl && (
                <div className="aspect-video relative">
                  <Image src={resource.thumbnailUrl} alt={resource.title} layout="fill" objectFit="cover" data-ai-hint={`${resource.type} health education`}/>
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
                    {resource.type === 'video' ? <Youtube className="inline h-3 w-3 mr-1" /> : <FileText className="inline h-3 w-3 mr-1" />}
                    {resource.type === 'video' ? 'Video' : 'Article'}
                  </div>
                </div>
              )}
              <CardHeader className="pt-4 pb-2">
                <CardTitle className="text-lg font-headline leading-tight">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-sm line-clamp-3">{resource.summary}</CardDescription>
                {resource.tags && resource.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {resource.tags.map(tag => (
                      <span key={tag} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 border-t">
                <Button variant="link" asChild className="p-0 h-auto text-primary group">
                  <Link href={resource.type === 'video' && resource.contentUrl ? resource.contentUrl : `/patient/education/${resource.id}`} 
                        target={resource.type === 'video' && resource.contentUrl ? '_blank' : '_self'}
                        rel={resource.type === 'video' && resource.contentUrl ? 'noopener noreferrer' : ''}
                  >
                    {resource.type === 'video' ? 'Watch Video' : 'Read More'}
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                {resource.estimatedReadTime && (
                   <span className="text-xs text-muted-foreground ml-auto">{resource.estimatedReadTime}</span>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold">No Resources Found</h3>
            <p>Try a different search term or browse all available materials.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
