
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/global/Logo";

export default function PrivacyPolicyPage() {
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
            <CardTitle className="text-4xl font-headline text-primary">Privacy Policy</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] p-6 border rounded-md bg-background">
              <div className="space-y-6 text-foreground/90">
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">1. Introduction</h2>
                  <p>
                    Welcome to PhysioPro. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at privacy@physiopro.app (placeholder email). This is a placeholder document for a prototype application.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">2. Information We Collect (Placeholder)</h2>
                  <p>
                    As a prototype, PhysioPro currently uses mock data and does not collect or store real personal user data beyond simulated login credentials for demonstration purposes. In a production environment, we would collect information such as:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                    <li>Personal identification information (Name, email address, phone number, etc.)</li>
                    <li>Health and medical information provided by clinicians or patients for the purpose of exercise prescription.</li>
                    <li>Usage data related to interaction with the platform.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">3. How We Use Your Information (Placeholder)</h2>
                  <p>
                    In a production application, information would be used to:
                  </p>
                   <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                    <li>Provide, operate, and maintain our Service.</li>
                    <li>Improve, personalize, and expand our Service.</li>
                    <li>Understand and analyze how you use our Service.</li>
                    <li>Develop new products, services, features, and functionality.</li>
                    <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service, and for marketing and promotional purposes (with consent).</li>
                    <li>Process your transactions.</li>
                    <li>Comply with legal obligations, including HIPAA where applicable.</li>
                  </ul>
                </section>
                 <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">4. Data Security (Placeholder)</h2>
                  <p>
                    We would implement a variety of security measures to maintain the safety of your personal information. However, no electronic storage or transmission over the Internet is 100% secure. While we would strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">5. Cookies and Tracking Technologies (Placeholder)</h2>
                  <p>
                    We may use cookies and similar tracking technologies to track the activity on our Service and hold certain information. This section would detail types of cookies used and how to manage them.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">6. Your Data Protection Rights (Placeholder)</h2>
                  <p>
                    Depending on your location, you may have rights under data protection laws such as GDPR or CCPA, including the right to access, correct, update, or request deletion of your personal information. This prototype does not store actual personal data.
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">7. Changes to This Privacy Policy</h2>
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
                  </p>
                </section>
                 <section>
                  <h2 className="text-2xl font-semibold text-primary mb-3">8. Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at privacy@physiopro.app (this is a placeholder email).
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
  title: 'Privacy Policy - PhysioPro',
  description: 'Read the Privacy Policy for the PhysioPro platform.',
};

