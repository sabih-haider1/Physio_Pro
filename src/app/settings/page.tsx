
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIconLucide } from "lucide-react"; // Renamed to avoid conflict with page name

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and details.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIconLucide className="mr-2 h-5 w-5 text-primary" />
            Preferences
          </CardTitle>
          <CardDescription>General account settings will be available here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>Settings features are currently under development.</p>
            <p>Check back soon for more options!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

