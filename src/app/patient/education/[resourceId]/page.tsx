
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpenText, Youtube, FileText as FileTextIcon } from 'lucide-react'; // Renamed FileText to avoid conflict
import Link from 'next/link';
import Image from 'next/image';
import type { EducationalResource } from '@/lib/types';
import { mockEducationalResources } from '@/lib/data/mock-educational-resources'; // Import from centralized location

export default function EducationalResourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const resourceId = params.resourceId as string;

  const [resource, setResource] = useState<EducationalResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (resourceId) {
      setIsLoading(true);
      // Simulate fetching resource
      setTimeout(() => {
        const foundResource = mockEducationalResources.find(r => r.id === resourceId);
        setResource(foundResource || null);
        setIsLoading(false);
      }, 300);
    }
  }, [resourceId]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading resource...</div>;
  }

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-2xl font-semibold mb-4">Resource Not Found</h2>
        <p className="text-muted-foreground mb-6">The educational material you're looking for doesn't seem to exist.</p>
        <Button onClick={() => router.push('/patient/education')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Education Hub
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <Button variant="outline" onClick={() => router.push('/patient/education')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Education Hub
      </Button>

      <Card className="shadow-lg">
        {resource.thumbnailUrl && (
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <Image 
                src={resource.thumbnailUrl} 
                alt={resource.title} 
                layout="fill" 
                objectFit="cover" 
                data-ai-hint="education learning"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            {resource.type === 'video' ? <Youtube className="mr-3 h-8 w-8 text-red-600" /> : <FileTextIcon className="mr-3 h-8 w-8 text-blue-600" />}
            {resource.title}
          </CardTitle>
          <CardDescription className="text-sm">
            Type: <span className="capitalize font-medium">{resource.type}</span>
            {resource.estimatedReadTime && ` | Estimated Time: ${resource.estimatedReadTime}`}
          </CardDescription>
          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {resource.tags.map(tag => (
                <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
          {resource.type === 'article' && (
            <>
              <p className="lead">{resource.summary}</p>
              {resource.content ? (
                 <div dangerouslySetInnerHTML={{ __html: resource.content.replace(/\n/g, '<br />') }} />
              ) : (
                <p className="text-muted-foreground">Full article content coming soon.</p>
              )}
            </>
          )}
          {resource.type === 'video' && resource.contentUrl && (
            <div className="my-4">
              <p className="mb-2">{resource.summary}</p>
              <Button asChild>
                <Link href={resource.contentUrl} target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-4 w-4" /> Watch Video on Provider Site
                </Link>
              </Button>
            </div>
          )}
          {!resource.contentUrl && resource.type === 'video' && (
            <p className="text-muted-foreground">Video content is not available at this moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
