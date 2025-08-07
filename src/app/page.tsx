
"use client"; 

import { useState } from 'react'; 
import { Navbar } from '@/components/global/Navbar';
import { Footer } from '@/components/global/Footer';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/Section';
import { FeatureCard } from '@/components/features/home/FeatureCard';
import { TestimonialSlider } from '@/components/features/home/TestimonialSlider';
import type { Testimonial } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, Activity, Brain, BarChart3, MessageSquare, CalendarDays, Search, Users, Settings, Briefcase, Bot } from 'lucide-react';
import { RoleSelectionModal } from '@/components/features/home/RoleSelectionModal'; 
import { useToast } from '@/hooks/use-toast';

import { mockPlans as plansFromAdmin } from '@/app/admin/billing/page';
import type { PricingPlan } from '@/lib/types';

const features = [
  {
    icon: Bot,
    title: 'AI Exercise Library',
    description: 'Access a 2,500+ exercise library with AI-powered natural language search. Find the perfect exercise in seconds.',
  },
  {
    icon: Brain,
    title: 'AI Program Builder',
    description: 'Clinicians can build AI-optimized exercise programs tailored to specific patient conditions and goals.',
  },
  {
    icon: BarChart3,
    title: 'Adherence Analytics',
    description: 'Track patient adherence with real-time, AI-driven analytics and predictive alerts for proactive interventions.',
  },
  {
    icon: CalendarDays,
    title: 'Appointment Scheduling',
    description: 'Seamlessly schedule appointments with AI-suggested optimal slots and manage your calendar efficiently.',
  },
  {
    icon: MessageSquare,
    title: 'Secure Messaging',
    description: 'Communicate securely with patients via encrypted messaging, ensuring privacy and compliance.',
  },
  {
    icon: Briefcase, 
    title: 'Admin & Clinician Tools',
    description: 'Comprehensive dashboards and tools for managing users, content, billing, and platform settings.',
  },
];

const testimonialsData: Testimonial[] = [
  { id: '1', text: "PhysioPro has revolutionized how I create and manage patient programs. The AI suggestions are spot on!", author: "Dr. Emily Carter", role: "Physical Therapist" },
  { id: '2', text: "Tracking my progress has never been easier or more motivating. The AI insights from PhysioPro keep me on track.", author: "John B.", role: "Patient" },
  { id: '3', text: "The AI-powered search for exercises in PhysioPro saves me so much time. It's an indispensable tool for my practice.", author: "Dr. Alex Chen", role: "Chiropractor" },
  { id: '4', text: "As an admin, managing our clinic's exercise library and users is now streamlined and efficient with PhysioPro.", author: "Sarah Miller", role: "Clinic Administrator" },
  { id: '5', text: "The ease of scheduling and managing appointments in PhysioPro is fantastic for my busy clinic.", author: "Dr. Priya Sharma", role: "Occupational Therapist" },
  { id: '6', text: "I love the personalized motivational prompts from PhysioPro. It feels like having a personal coach cheering me on!", author: "Michael P.", role: "Patient" },
];

// Use plans imported from admin/billing/page.tsx
const activePricingPlans = plansFromAdmin
  .filter(plan => plan.isActive)
  .map(plan => ({
    id: plan.id, 
    name: plan.name,
    price: plan.price,
    frequency: plan.frequency,
    features: plan.features,
    cta: plan.ctaText,
    // Ensure href directs to signup with planId for non-ContactUs plans
    href: plan.ctaText.toLowerCase() === 'contact us' ? '#' : `/signup?plan=${plan.id}`,
    popular: plan.isPopular || false,
  }));


export default function HomePage() {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const { toast } = useToast();

  const openRoleModal = () => setIsRoleModalOpen(true);
  const closeRoleModal = () => setIsRoleModalOpen(false);

  const handleContactUsClick = () => {
    toast({
      title: "Contact Sales for Enterprise Solutions",
      description: "Please email us at sales@physiopro.app or call (555) 123-4567 to discuss your enterprise needs. (Simulated Contact Info)",
      duration: 9000,
    });
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Section className="bg-gradient-to-br from-primary/10 via-background to-background pt-20 md:pt-32 pb-16 md:pb-24 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-extrabold text-primary mb-6">
              Transform Lives with AI-Driven Exercise Prescriptions
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-10">
              Empower clinicians, engage patients, and scale clinics with PhysioPro.
              Our platform combines intelligent automation with intuitive design to redefine rehabilitation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button
                onClick={openRoleModal} 
                size="lg"
                className="font-semibold text-lg px-8 py-6 shadow-lg hover:shadow-primary/30 transition-shadow duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                Get Started for Free
              </Button>
            </div>
          </div>
          <div className="mt-16 md:mt-24 relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Image
              src="https://placehold.co/1200x600.png"
              alt="PhysioPro Platform Showcase"
              width={1200}
              height={600}
              className="rounded-xl shadow-2xl mx-auto"
              priority
              data-ai-hint="software dashboard health"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>
        </Section>

        <Section id="features" title="Why PhysioPro?" subtitle="Discover the powerful AI-driven features designed to elevate your practice and patient outcomes.">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="animate-slide-up" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section id="how-it-works" title="Simple Steps to Better Outcomes" subtitle="Experience the ease and efficiency of PhysioPro in your daily workflow." className="bg-muted/30">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3 p-6 bg-background rounded-lg shadow-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-primary/10 text-primary inline-flex p-4 rounded-full mb-3"><Search size={32}/></div>
              <h3 className="text-xl font-headline font-semibold text-primary">1. Discover & Assign</h3>
              <p className="text-muted-foreground">Easily find exercises using AI search and build personalized programs in minutes.</p>
            </div>
            <div className="space-y-3 p-6 bg-background rounded-lg shadow-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-accent/10 text-accent inline-flex p-4 rounded-full mb-3"><Users size={32}/></div>
              <h3 className="text-xl font-headline font-semibold text-accent">2. Engage & Motivate</h3>
              <p className="text-muted-foreground">Patients access programs via a user-friendly portal with AI-powered motivational support.</p>
            </div>
            <div className="space-y-3 p-6 bg-background rounded-lg shadow-md animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-secondary/20 text-secondary-foreground inline-flex p-4 rounded-full mb-3"><BarChart3 size={32}/></div>
              <h3 className="text-xl font-headline font-semibold text-secondary-foreground">3. Track & Optimize</h3>
              <p className="text-muted-foreground">Monitor adherence with real-time analytics and AI predictions to refine treatment plans.</p>
            </div>
          </div>
        </Section>

        <Section id="pricing" title="Flexible Pricing Plans" subtitle="Choose the plan that's right for you and your clinic.">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {activePricingPlans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`flex flex-col animate-slide-up ${plan.popular ? 'border-primary border-2 shadow-xl relative' : 'shadow-md'}`}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full shadow-md">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl font-headline text-primary">{plan.name}</CardTitle>
                  <CardDescription className="text-4xl font-bold text-foreground mt-2">
                    {plan.price}
                    {plan.frequency && <span className="text-base font-normal text-muted-foreground">{plan.frequency}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                   {plan.cta.toLowerCase() === 'contact us' ? (
                     <Button
                        className="w-full font-semibold text-lg py-6"
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={handleContactUsClick}
                      >
                        {plan.cta}
                      </Button>
                   ) : (
                     <Button
                        asChild
                        className="w-full font-semibold text-lg py-6"
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        <Link href={plan.href}>{plan.cta}</Link>
                      </Button>
                   )}
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-10">
            Need a custom solution or have questions?{' '}
            <Button variant="link" onClick={handleContactUsClick} className="p-0 h-auto text-primary hover:underline">
                Contact our sales team
            </Button>.
          </p>
        </Section>

        <Section id="testimonials" title="Loved by Clinicians and Patients" subtitle="Hear what our users say about their PhysioPro experience." className="bg-muted/30">
          <TestimonialSlider testimonials={testimonialsData} />
        </Section>

        <Section className="bg-primary text-primary-foreground">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6">Ready to Revolutionize Your Practice?</h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
              Join PhysioPro today and harness the power of AI to deliver exceptional patient care and streamline your clinical operations.
            </p>
            <Button
              onClick={openRoleModal} 
              size="lg"
              variant="secondary"
              className="font-semibold text-lg px-8 py-6 shadow-lg hover:shadow-black/20 transition-shadow duration-300 transform hover:scale-105"
            >
              Get Started for Free
            </Button>
          </div>
        </Section>

      </main>
      <Footer />
      <RoleSelectionModal isOpen={isRoleModalOpen} onOpenChange={setIsRoleModalOpen} />
    </>
  );
}
