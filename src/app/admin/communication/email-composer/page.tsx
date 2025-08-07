
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Wand2, Send, Loader2, Info } from 'lucide-react';
import { generateEmailBody, type AiEmailGeneratorInput } from '@/ai/flows/ai-email-generator';

export default function AiEmailComposerPage() {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateEmail = async () => {
    if (!aiPrompt.trim()) {
      toast({ variant: 'destructive', title: 'Prompt Required', description: 'Please enter a prompt for the AI.' });
      return;
    }
    setIsLoading(true);
    setEmailBody(''); // Clear previous body
    try {
      const input: AiEmailGeneratorInput = { 
        prompt: aiPrompt,
        subject: subject || undefined, 
        // recipientContext could be added here if we had more structured recipient selection
      };
      const result = await generateEmailBody(input);
      setEmailBody(result.generatedEmailBody);
      if (result.suggestedSubject && !subject) {
        setSubject(result.suggestedSubject);
        toast({ title: 'AI Suggestion', description: 'AI also suggested a subject line for you!' });
      }
    } catch (error) {
      console.error('AI email generation error:', error);
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate email content. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = () => {
    if (!recipients.trim() || !subject.trim() || !emailBody.trim()) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill in recipients, subject, and ensure the email body is generated or written.' });
      return;
    }
    // Simulate sending email
    console.log('Simulating sending email:', { recipients, subject, emailBody });
    toast({ title: 'Email Sent (Simulated)', description: `Email to ${recipients} with subject "${subject}" has been "sent".` });
    // Optionally clear fields after sending
    // setRecipients(''); setSubject(''); setAiPrompt(''); setEmailBody('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <Mail className="mr-3 h-8 w-8" /> AI Email Composer
        </h1>
        <p className="text-muted-foreground">
          Draft professional emails quickly with AI assistance. Ideal for announcements, updates, or targeted communication.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Compose Email</CardTitle>
            <CardDescription>Enter recipient details, subject, and let AI help with the content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="recipients">Recipient Email(s)</Label>
              <Input 
                id="recipients" 
                placeholder="e.g., user1@example.com, group@example.com (comma-separated)" 
                value={recipients} 
                onChange={(e) => setRecipients(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="Email subject line" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
              />
            </div>
            <div className="border p-4 rounded-md bg-muted/20 space-y-3">
                <Label htmlFor="aiPrompt" className="text-base font-medium flex items-center">
                    <Wand2 className="mr-2 h-5 w-5 text-primary" />
                    AI Content Prompt
                </Label>
                <Textarea
                    id="aiPrompt"
                    placeholder="e.g., Draft a welcome email for new clinicians highlighting key features..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                />
                <Button onClick={handleGenerateEmail} disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Generating...' : 'Generate with AI'}
                </Button>
            </div>
            <div>
              <Label htmlFor="emailBody">Email Body</Label>
              <Textarea
                id="emailBody"
                placeholder="AI-generated content will appear here. You can edit it before sending."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={10}
                className="min-h-[200px]"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSendEmail} size="lg" className="w-full">
              <Send className="mr-2 h-4 w-4" /> Send Email (Simulated)
            </Button>
          </CardFooter>
        </Card>
        
        <div className="lg:col-span-1 space-y-4">
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-blue-700 flex items-center">
                        <Info className="mr-2 h-5 w-5"/> How to Use
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-600 space-y-1">
                    <p><strong>1. Prompt AI:</strong> Tell the AI what the email should be about (e.g., "announce new feature X").</p>
                    <p><strong>2. Generate:</strong> Click "Generate with AI". The AI will draft the email body.</p>
                    <p><strong>3. Review & Edit:</strong> Modify the generated text as needed.</p>
                    <p><strong>4. Add Details:</strong> Fill in recipients and subject (AI might suggest one!).</p>
                    <p><strong>5. Send:</strong> Click "Send Email" (simulated).</p>
                </CardContent>
            </Card>
             <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-amber-700 flex items-center">
                       <Wand2 className="mr-2 h-5 w-5"/> Example Prompts
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-amber-600 space-y-2">
                   <p>"Draft an email to clinicians about an upcoming maintenance window this Saturday from 2-4 AM."</p>
                   <p>"Write a short, encouraging email to patients who haven't logged in for a week."</p>
                   <p>"Compose an informational email about the benefits of the new AI Adherence Analytics feature."</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

