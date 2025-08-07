
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Banknote, UploadCloud, CheckCircle, Info, Loader2 } from 'lucide-react';
import { addAdminNotification } from '@/lib/data/mock-notifications';
import { addPaymentVerificationRequest } from '@/app/admin/billing/page'; 
import { initialMockUsers, updateMockUser } from '@/app/admin/users/page'; 
import { initialSettings as platformSettings } from '@/app/admin/settings/page'; // Import shared settings

function ManualPaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [planId, setPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [planPrice, setPlanPrice] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentClinicianId = 'doc_current'; 

  useEffect(() => {
    setPlanId(searchParams.get('planId'));
    setPlanName(searchParams.get('planName'));
    setPlanPrice(searchParams.get('planPrice'));
  }, [searchParams]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setReceiptFile(event.target.files[0]);
    }
  };

  const handleSubmitReceipt = () => {
    if (!planId || !planName || !planPrice) {
      toast({ variant: 'destructive', title: 'Error', description: 'Plan details missing. Please try again.' });
      return;
    }
    if (!receiptFile) {
      toast({ variant: 'destructive', title: 'Receipt Required', description: 'Please upload your payment receipt.' });
      return;
    }
    setIsLoading(true);

    const clinician = initialMockUsers.find(u => u.id === currentClinicianId);
    if (!clinician) {
        toast({ variant: 'destructive', title: 'Error', description: 'Clinician details not found.' });
        setIsLoading(false);
        return;
    }

    const newVerificationRequest = {
      id: `ver_${Date.now()}`,
      clinicianId: currentClinicianId,
      clinicianName: clinician.name,
      clinicianEmail: clinician.email,
      requestedPlanId: planId,
      requestedPlanName: planName,
      requestedPlanPrice: planPrice,
      receiptUrl: `simulated_receipt_${receiptFile.name}`, 
      submissionDate: new Date().toISOString(),
      status: 'pending' as const,
    };
    addPaymentVerificationRequest(newVerificationRequest);
    updateMockUser({ ...clinician, subscriptionStatus: 'pending_payment', requestedPlanId: planId });

    addAdminNotification({
      title: 'New Payment Receipt Submitted',
      description: `${clinician.name} submitted a receipt for ${planName}.`,
      type: 'payment',
      link: '/admin/billing',
    });

    setTimeout(() => {
      toast({
        title: 'Receipt Submitted Successfully',
        description: 'Your payment receipt has been submitted for verification. An admin will review it shortly.',
        duration: 7000,
      });
      setIsLoading(false);
      router.push('/clinician/settings');
    }, 1500);
  };

  if (!planId || !planName || !planPrice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle>Loading Plan Details...</CardTitle></CardHeader>
          <CardContent><p>If this persists, please go back and select a plan again.</p></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-6 left-6">
        <Button variant="outline" onClick={() => router.push('/clinician/settings')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Settings
        </Button>
      </div>
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <Banknote className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-3xl font-headline text-primary">Manual Payment Instructions</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Complete your subscription for the <strong>{planName} ({planPrice})</strong> plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-blue-700 flex items-center">
                <Info className="mr-2 h-5 w-5" /> Please follow these steps:
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-600 space-y-1">
              <p>1. Transfer <strong>{planPrice}</strong> to the bank account below.</p>
              <p>2. Use {platformSettings.paymentReferenceInstructions} as the payment reference.</p>
              <p>3. Upload a screenshot or PDF of your payment confirmation.</p>
              <p>4. Our team will verify your payment and activate your plan within 24-48 hours.</p>
            </CardContent>
          </Card>

          <div className="space-y-3 p-4 border rounded-md bg-background">
            <h3 className="font-semibold text-lg text-primary">Bank Account Details:</h3>
            <p><strong className="text-muted-foreground">Account Name:</strong> {platformSettings.bankAccountName}</p>
            <p><strong className="text-muted-foreground">Bank:</strong> {platformSettings.bankName}</p>
            <p><strong className="text-muted-foreground">Account Number:</strong> {platformSettings.bankAccountNumber}</p>
            {platformSettings.bankSwiftBic && <p><strong className="text-muted-foreground">SWIFT/BIC:</strong> {platformSettings.bankSwiftBic}</p>}
            <p><strong className="text-muted-foreground">Reference:</strong> {platformSettings.paymentReferenceInstructions}</p>
          </div>

          <div>
            <Label htmlFor="receiptUpload" className="font-semibold text-lg">Upload Payment Receipt</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input
                id="receiptUpload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="flex-grow"
              />
              {receiptFile && <CheckCircle className="h-5 w-5 text-green-500" />}
            </div>
            {receiptFile && <p className="text-xs text-muted-foreground mt-1">Selected: {receiptFile.name}</p>}
            <p className="text-xs text-muted-foreground mt-1">Accepted formats: JPG, PNG, PDF. Max size: 5MB.</p>
          </div>

          <Button
            size="lg"
            className="w-full font-semibold text-lg py-6"
            onClick={handleSubmitReceipt}
            disabled={isLoading || !receiptFile}
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
            {isLoading ? 'Submitting...' : 'Submit Receipt for Verification'}
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            If you have any questions, please contact {platformSettings.supportEmail}.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ManualPaymentPage() {
  return (
    <Suspense fallback={<div>Loading page details...</div>}>
      <ManualPaymentPageContent />
    </Suspense>
  );
}
