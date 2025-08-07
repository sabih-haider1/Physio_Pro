import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

export const metadata: Metadata = {
  title: 'PhysioPro - AI-Driven Exercise Prescriptions',
  description: 'Empower clinicians, engage patients, and scale clinics with PhysioPro, the AI-driven exercise prescription software. Featuring AI exercise library, program builder, adherence analytics, and telehealth.',
  keywords: ['PhysioPro', 'AI', 'exercise prescription', 'physical therapy', 'rehabilitation', 'telehealth', 'clinician software', 'patient portal'],
  openGraph: {
    title: 'PhysioPro - AI-Driven Exercise Prescriptions',
    description: 'Transform lives with PhysioPro. Empower clinicians, engage patients, scale clinics.',
    type: 'website',
    // url: 'YOUR_APP_URL', // Replace with actual URL
    // images: [{ url: 'YOUR_OG_IMAGE_URL' }], // Replace with actual OG image URL
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
