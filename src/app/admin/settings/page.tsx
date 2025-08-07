
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, Globe, Palette, Bell, ListChecks, Users, Briefcase, KeyRound, Languages, UploadCloud, DatabaseZap, ServerCog, Banknote } from "lucide-react";
import Image from 'next/image';

// Mock initial settings - in a real app, these would be fetched
// ADDED BANK DETAILS HERE
export const initialSettings = {
  platformName: "PhysioPro Platform",
  supportEmail: "support@physiopro.app",
  defaultTimezone: "America/New_York",
  enableAiSuggestions: true,
  defaultVideoPrivacy: "unlisted",
  allowProgramModRequests: false,
  enablePatientMessaging: true,
  enablePatientSelfScheduling: true,
  newPatientWelcomeMessage: "Welcome to your personalized recovery journey! Your clinician will assign your program soon.",
  notifyClinicianOnFeedback: true,
  notifyPatientOnProgramAssignment: true,
  googleAiApiKey: "**********", // Placeholder for Google AI API Key
  logoUrl: "https://placehold.co/150x50.png?text=YourLogo", // Placeholder logo
  defaultLanguage: "en",
  enablePatientSelfRegistration: false,
  smtpServer: "smtp.example.com",
  smtpPort: "587",
  smtpUsername: "user@example.com",
  smtpPassword: "••••••••••••••", // Masked,
  // New bank details for manual payments
  bankAccountName: "PhysioPro Inc.",
  bankName: "Global Secure Bank",
  bankAccountNumber: "123-456-7890",
  bankSwiftBic: "GSBKUS33",
  paymentReferenceInstructions: "Your Email or Clinic Name",
};

const timezones = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Berlin", "Asia/Tokyo", "Australia/Sydney"
];

const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español (Spanish)" },
    { code: "fr", name: "Français (French)" },
    { code: "de", name: "Deutsch (German)" },
];

export default function SystemSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);

  const handleInputChange = (key: keyof typeof initialSettings, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUploadSimulated = () => {
    const simulatedNewUrl = `https://placehold.co/150x50.png?text=NewLogo&random=${Math.random()}`;
    setLogoPreview(simulatedNewUrl);
    handleInputChange('logoUrl', simulatedNewUrl); 
    toast({ title: "Logo Updated (Simulated)", description: "New logo previewed. Save settings to apply." });
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    // In a real app, this would merge with initialSettings or send to backend
    // For prototype, we can update initialSettings directly if needed for other pages to reflect,
    // but that's tricky without proper state management.
    // For now, this just simulates a save.
    Object.assign(initialSettings, settings); // Update the exported mock for other pages
    console.log("Saving settings (simulated):", settings);
    setTimeout(() => {
      toast({
        title: "Settings Saved (Simulated)",
        description: "Your platform settings have been updated.",
      });
      setIsLoading(false);
    }, 1000);
  };
  
  const handleBackup = () => {
    toast({ title: "Backup Started (Simulated)", description: "Platform data backup is in progress." });
  };
  
  const handleRestore = () => {
    toast({ title: "Restore Process (Simulated)", description: "Restore options would be presented here. No actual restore performed." });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <SettingsIcon className="mr-3 h-8 w-8" /> System Settings
          </h1>
          <p className="text-muted-foreground">Configure global settings for the PhysioPro platform.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save All Settings
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary"/>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platformName">Platform Name</Label>
              <Input id="platformName" value={settings.platformName} onChange={(e) => handleInputChange('platformName', e.target.value)} />
            </div>
            <div>
              <Label>Platform Logo</Label>
              <div className="mt-1 p-3 border rounded-md bg-muted/30 flex flex-col items-center gap-3">
                {logoPreview ? (
                  <Image src={logoPreview} alt="Platform Logo Preview" width={150} height={50} className="max-h-12 object-contain" data-ai-hint="logo brand"/>
                ) : (
                  <div className="h-12 w-full flex items-center justify-center text-muted-foreground text-sm">No logo uploaded</div>
                )}
                <Button variant="outline" size="sm" onClick={handleLogoUploadSimulated} className="w-full">
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload New Logo (Simulated)
                </Button>
              </div>
               <p className="text-xs text-muted-foreground mt-1">Favicon settings are managed separately by system administrators.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><Languages className="mr-2 h-5 w-5 text-primary"/>Localization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <Select value={settings.defaultLanguage} onValueChange={(value) => handleInputChange('defaultLanguage', value)}>
                <SelectTrigger id="defaultLanguage"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {languages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="defaultTimezone">Default Timezone</Label>
              <Select value={settings.defaultTimezone} onValueChange={(value) => handleInputChange('defaultTimezone', value)}>
                <SelectTrigger id="defaultTimezone"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Feature Toggles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="enablePatientSelfRegistration" className="flex-grow cursor-pointer">Enable Patient Self-Registration</Label>
              <Switch id="enablePatientSelfRegistration" checked={settings.enablePatientSelfRegistration} onCheckedChange={(checked) => handleInputChange('enablePatientSelfRegistration', checked)} />
            </div>
             <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="enablePatientMessaging" className="flex-grow cursor-pointer">Enable Patient Messaging</Label>
              <Switch id="enablePatientMessaging" checked={settings.enablePatientMessaging} onCheckedChange={(checked) => handleInputChange('enablePatientMessaging', checked)} />
            </div>
            <p className="text-xs text-muted-foreground pt-2">Plan-specific feature controls are managed in the Billing & Plan Configuration section.</p>
          </CardContent>
        </Card>

        {/* NEW: Payment Receiving Details Card */}
        <Card className="shadow-sm md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center"><Banknote className="mr-2 h-5 w-5 text-primary"/>Payment Receiving Details</CardTitle>
            <CardDescription>Configure bank account details for manual subscription payments.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor="bankAccountName">Bank Account Name</Label>
              <Input id="bankAccountName" value={settings.bankAccountName} onChange={(e) => handleInputChange('bankAccountName', e.target.value)} placeholder="e.g., Your Clinic Name Inc."/>
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" value={settings.bankName} onChange={(e) => handleInputChange('bankName', e.target.value)} placeholder="e.g., My Local Bank"/>
            </div>
            <div>
              <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
              <Input id="bankAccountNumber" value={settings.bankAccountNumber} onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)} placeholder="e.g., 1234567890"/>
            </div>
            <div>
              <Label htmlFor="bankSwiftBic">SWIFT/BIC (Optional)</Label>
              <Input id="bankSwiftBic" value={settings.bankSwiftBic} onChange={(e) => handleInputChange('bankSwiftBic', e.target.value)} placeholder="e.g., BANKUS33"/>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="paymentReferenceInstructions">Payment Reference Instructions</Label>
              <Input id="paymentReferenceInstructions" value={settings.paymentReferenceInstructions} onChange={(e) => handleInputChange('paymentReferenceInstructions', e.target.value)} placeholder="e.g., Use your email or invoice number as reference"/>
            </div>
          </CardContent>
        </Card>


        <Card className="shadow-sm md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center"><ServerCog className="mr-2 h-5 w-5 text-primary"/>Email (SMTP) Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor="smtpServer">SMTP Server</Label>
              <Input id="smtpServer" value={settings.smtpServer} onChange={(e) => handleInputChange('smtpServer', e.target.value)} placeholder="e.g., smtp.mailprovider.com"/>
            </div>
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input id="smtpPort" type="number" value={settings.smtpPort} onChange={(e) => handleInputChange('smtpPort', e.target.value)} placeholder="e.g., 587 or 465"/>
            </div>
            <div>
              <Label htmlFor="smtpUsername">SMTP Username</Label>
              <Input id="smtpUsername" value={settings.smtpUsername} onChange={(e) => handleInputChange('smtpUsername', e.target.value)} placeholder="Your SMTP username"/>
            </div>
            <div>
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input id="smtpPassword" type="password" value={settings.smtpPassword} onChange={(e) => handleInputChange('smtpPassword', e.target.value)} placeholder="Your SMTP password"/>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="supportEmail">Platform Support Email</Label>
              <Input id="supportEmail" type="email" value={settings.supportEmail} onChange={(e) => handleInputChange('supportEmail', e.target.value)} placeholder="e.g., support@yourdomain.com"/>
              <p className="text-xs text-muted-foreground mt-1">This email address will be used as the 'from' address for system emails.</p>
            </div>
          </CardContent>
        </Card>

         <Card className="shadow-sm md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center"><DatabaseZap className="mr-2 h-5 w-5 text-primary"/>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleBackup} className="flex-1">
              Trigger Full Platform Backup (Simulated)
            </Button>
            <Button variant="destructive" onClick={handleRestore} className="flex-1">
              Initiate Restore Process (Simulated)
            </Button>
          </CardContent>
        </Card>
        
         <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary"/>Exercise & Program Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="enableAiSuggestions" className="flex-grow cursor-pointer">Enable AI Exercise Suggestions</Label>
              <Switch id="enableAiSuggestions" checked={settings.enableAiSuggestions} onCheckedChange={(checked) => handleInputChange('enableAiSuggestions', checked)} />
            </div>
             <div>
              <Label htmlFor="defaultVideoPrivacy">Default Exercise Video Privacy</Label>
              <Select value={settings.defaultVideoPrivacy} onValueChange={(value) => handleInputChange('defaultVideoPrivacy', value)}>
                <SelectTrigger id="defaultVideoPrivacy"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="private">Private (Platform Users Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="allowProgramModRequests" className="flex-grow cursor-pointer">Allow Patients to Request Program Modifications</Label>
              <Switch id="allowProgramModRequests" checked={settings.allowProgramModRequests} onCheckedChange={(checked) => handleInputChange('allowProgramModRequests', checked)} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Patient Portal Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="enablePatientSelfScheduling" className="flex-grow cursor-pointer">Enable Patient Self-Scheduling for Appointments</Label>
              <Switch id="enablePatientSelfScheduling" checked={settings.enablePatientSelfScheduling} onCheckedChange={(checked) => handleInputChange('enablePatientSelfScheduling', checked)} />
            </div>
            <div>
              <Label htmlFor="newPatientWelcomeMessage">New Patient Welcome Message</Label>
              <Textarea id="newPatientWelcomeMessage" value={settings.newPatientWelcomeMessage} onChange={(e) => handleInputChange('newPatientWelcomeMessage', e.target.value)} rows={3} />
              <p className="text-xs text-muted-foreground mt-1">This message appears on the patient's dashboard after they sign up.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="notifyClinicianOnFeedback" className="flex-grow cursor-pointer">Email Clinician on New Patient Feedback</Label>
              <Switch id="notifyClinicianOnFeedback" checked={settings.notifyClinicianOnFeedback} onCheckedChange={(checked) => handleInputChange('notifyClinicianOnFeedback', checked)} />
            </div>
             <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="notifyPatientOnProgramAssignment" className="flex-grow cursor-pointer">Email Patient on New Program Assignment/Update</Label>
              <Switch id="notifyPatientOnProgramAssignment" checked={settings.notifyPatientOnProgramAssignment} onCheckedChange={(checked) => handleInputChange('notifyPatientOnProgramAssignment', checked)} />
            </div>
             <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                <p>More granular notification controls can be added here.</p>
             </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5 text-primary"/>Integration Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="googleAiApiKey">Google AI API Key</Label>
              <Input 
                id="googleAiApiKey" 
                value={settings.googleAiApiKey} 
                onChange={(e) => handleInputChange('googleAiApiKey', e.target.value)} 
                placeholder="Enter Google AI API Key" 
                type="password" 
              />
              <p className="text-xs text-muted-foreground mt-1">Used for AI suggestions and other generative AI features.</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
