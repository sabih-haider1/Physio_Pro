
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/global/Logo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <div className="absolute top-6 right-6">
        <Button variant="outline" asChild>
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Home</Link>
        </Button>
      </div>
      <div className="max-w-3xl mx-auto mt-20">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-headline text-primary">Terms of Service</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] p-6 border rounded-md bg-background">
              <div className="space-y-6 text-foreground/90">
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">1. Acceptance of Terms</h2>
                  <p>
                    By accessing or using PhysioPro (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use the Service. This is a placeholder document for a prototype application.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">2. Description of Service</h2>
                  <p>
                    PhysioPro is an AI-driven exercise prescription software designed to assist clinicians in creating and managing exercise programs for their patients, and for patients to follow these programs. Features include an AI exercise library, program builder, adherence analytics, telehealth integration (simulated), and secure messaging (simulated).
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">3. User Accounts</h2>
                  <p>
                    You may need to register for an account to access certain features of the Service. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                  </p>
                </section>
                 <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">4. Medical Disclaimer</h2>
                  <p>
                    PhysioPro provides information and tools for exercise prescription but is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or utilized on the Service.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">5. Intellectual Property</h2>
                  <p>
                    All content and software associated with the Service are the property of PhysioPro or its licensors and are protected by copyright and other intellectual property laws. This is placeholder text.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">6. Limitation of Liability</h2>
                  <p>
                    In no event shall PhysioPro be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service. This is placeholder text for a prototype.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">7. Changes to Terms</h2>
                  <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">8. Contact Us</h2>
                  <p>
                    If you have any questions about these Terms, please contact us at support@physiopro.app (this is a placeholder email).
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <footer className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PhysioPro. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Terms of Service - PhysioPro',
  description: 'Read the Terms of Service for using the PhysioPro platform.',
};

