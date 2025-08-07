
import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Linkedin, Twitter } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const socialLinks = [
  { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { Icon: Github, href: 'https://github.com', label: 'GitHub' },
  { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="bg-muted/50 text-muted-foreground border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm">
              Transforming rehabilitation with AI-powered exercise prescriptions by PhysioPro.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-headline font-semibold text-foreground mb-3">Product</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/#testimonials" className="hover:text-primary transition-colors">Testimonials</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-headline font-semibold text-foreground mb-3">Legal</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-headline font-semibold text-foreground mb-3">Stay Updated</h5>
            <form className="space-y-2">
              <Input type="email" placeholder="Enter your email" className="bg-background" />
              <Button type="submit" className="w-full" variant="secondary">Subscribe</Button>
            </form>
            <p className="text-xs mt-2">Get the latest news and updates from PhysioPro.</p>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} PhysioPro. All rights reserved.</p>
          <div className="mt-4 sm:mt-0">
            <GDPRConsentModal />
          </div>
        </div>
      </div>
    </footer>
  );
}


function GDPRConsentModal() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="link" className="text-xs p-0 h-auto">Manage Cookie Preferences</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cookie Preferences</AlertDialogTitle>
          <AlertDialogDescription>
            We use cookies to enhance your experience, analyze site traffic, and personalize content. 
            You can manage your preferences below. For more information, please see our 
            <Link href="/privacy" className="underline hover:text-primary"> Privacy Policy</Link>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-2">
          <p className="text-sm text-muted-foreground">Currently, we only use essential cookies for site functionality.</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Decline (Essential Only)</AlertDialogCancel>
          <AlertDialogAction>Accept All</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

