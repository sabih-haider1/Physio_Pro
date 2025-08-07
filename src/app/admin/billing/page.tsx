
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, ListChecks, DollarSign, Settings2, FileText, ExternalLink, Edit3, Download, UserCog, PlusCircle, Eye, AlertTriangle, Ticket, Edit, Check, X, Hourglass } from "lucide-react";
import Link from "next/link";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PricingPlan, MockSubscription, MockInvoice, CouponCode, CouponType, PaymentVerificationRequest, AdminUser } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { addClinicianNotification } from '@/lib/data/mock-notifications';
import { initialMockUsers, updateMockUser } from '@/app/admin/users/page';

export let mockPlans: PricingPlan[] = [
  {
    id: 'plan_basic_monthly',
    name: 'Basic Monthly',
    price: '$29',
    frequency: '/month',
    features: ['AI Exercise Library (500 exercises)', 'Basic Program Builder', 'Up to 25 Patients', 'Standard Email Support'],
    description: 'Perfect for solo practitioners starting out.',
    isActive: true,
    ctaText: 'Get Started',
    isPopular: false,
  },
  {
    id: 'plan_pro_monthly',
    name: 'Pro Monthly',
    price: '$79',
    frequency: '/month',
    features: ['Full AI Exercise Library (2500+)', 'AI Program Builder with suggestions', 'Up to 100 Patients', 'Adherence Analytics', 'Priority Email & Chat Support'],
    description: 'Ideal for growing practices needing more power and AI features.',
    isActive: true,
    ctaText: 'Choose Pro',
    isPopular: true,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Solution',
    price: 'Custom',
    frequency: '',
    features: ['All Pro features', 'Unlimited Patients & Clinicians', 'White-Label Branding Options', 'Advanced Compliance (HIPAA/GDPR tools)', 'Dedicated Account Manager & API Access', 'Custom Integrations'],
    description: 'Tailored for large clinics, hospitals, and organizations with specific needs.',
    isActive: true,
    ctaText: 'Contact Us',
    isPopular: false,
  },
  {
    id: 'plan_legacy_basic',
    name: 'Legacy Basic',
    price: '$19',
    frequency: '/month',
    features: ['Limited Exercise Library', 'No AI Features', 'Max 10 Patients'],
    description: 'Older plan, no longer offered for new subscriptions. Existing users only.',
    isActive: false,
    ctaText: 'N/A',
    isPopular: false,
  },
];

const FREQUENCY_NONE_SENTINEL = "__NONE__";

let mockSubscriptionsData: MockSubscription[] = [
  { id: 'sub1', userName: 'Dr. Emily Carter', userAvatar: 'https://placehold.co/40x40.png?text=EC', planName: 'Pro Monthly', status: 'active', nextBillingDate: '2024-08-15', amount: '$79.00', userId: 'doc_current' },
  { id: 'sub2', userName: 'Clinic Excellence Group', userAvatar: 'https://placehold.co/40x40.png?text=CE', planName: 'Enterprise Solution', status: 'active', nextBillingDate: '2024-08-20', amount: '$299.00 (Custom)', userId: 'clinic2' },
  { id: 'sub3', userName: 'Dr. Alex Chen', userAvatar: 'https://placehold.co/40x40.png?text=AC', planName: 'Basic Monthly', status: 'past_due', nextBillingDate: '2024-07-25', amount: '$29.00', userId: 'user3' },
  { id: 'sub4', userName: 'Wellness Solutions LLC', userAvatar: 'https://placehold.co/40x40.png?text=WS', planName: 'Pro Monthly', status: 'trial', trialStartDate: '2024-07-10', nextBillingDate: 'N/A (Trial)', amount: '$0.00 (Trial)', userId: 'clinic4' },
];

let mockInvoicesData: MockInvoice[] = [
  { id: 'inv001', date: '2024-07-15', amount: '$79.00', status: 'paid', description: 'Pro Monthly - July 2024', userName: 'Dr. Emily Carter' },
  { id: 'inv002', date: '2024-07-20', amount: '$299.00', status: 'paid', description: 'Enterprise Solution - July 2024', userName: 'Clinic Excellence Group' },
  { id: 'inv003', date: '2024-06-25', amount: '$29.00', status: 'failed', description: 'Basic Monthly - June 2024', userName: 'Dr. Alex Chen' },
  { id: 'inv004', date: '2024-07-01', amount: '$0.00', status: 'paid', description: 'Pro Monthly - Trial Start', userName: 'Wellness Solutions LLC' },
];

let mockCouponsData: CouponCode[] = [
  { id: 'coupon1', code: 'WELCOME20', type: 'percentage', value: 20, isActive: true, expirationDate: '2024-12-31', usageLimit: 100, timesUsed: 25 },
  { id: 'coupon2', code: 'SAVE10NOW', type: 'fixed_amount', value: 10, isActive: true, expirationDate: '2024-09-30', usageLimit: 50, timesUsed: 10 },
  { id: 'coupon3', code: 'OLDPROMO', type: 'percentage', value: 15, isActive: false, usageLimit: 200, timesUsed: 198 },
];

export let mockPaymentVerifications: PaymentVerificationRequest[] = [];

export const addPaymentVerificationRequest = (request: PaymentVerificationRequest) => {
  mockPaymentVerifications = [request, ...mockPaymentVerifications];
};


export default function BillingManagementPage() {
  const { toast } = useToast();
  const [selectedSubscription, setSelectedSubscription] = useState<MockSubscription | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const [editablePlans, setEditablePlans] = useState<PricingPlan[]>(() => JSON.parse(JSON.stringify(mockPlans)));
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [currentEditingPlan, setCurrentEditingPlan] = useState<PricingPlan | null>(null);

  const [coupons, setCoupons] = useState<CouponCode[]>(() => JSON.parse(JSON.stringify(mockCouponsData)));
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [currentEditingCoupon, setCurrentEditingCoupon] = useState<Partial<CouponCode> | null>(null);

  const [pendingVerifications, setPendingVerifications] = useState<PaymentVerificationRequest[]>([]);

  useEffect(() => {
    setPendingVerifications([...mockPaymentVerifications].sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
  }, [mockPaymentVerifications.length]);


  const handleManageSubscription = (subscription: MockSubscription) => {
    setSelectedSubscription(subscription);
    setIsManageModalOpen(true);
  };

  const handleSimulatedPlanChange = (newPlanId: string) => {
    if(selectedSubscription) {
      const plan = editablePlans.find(p => p.id === newPlanId);
      toast({ title: "Plan Change (Simulated)", description: `${selectedSubscription.userName}'s plan changed to ${plan?.name || 'selected plan'}.` });
    }
    setIsManageModalOpen(false);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({ title: "Download Invoice (Simulated)", description: `Preparing download for invoice ${invoiceId}.` });
  };

  const handleEditPlan = (plan: PricingPlan) => {
    setCurrentEditingPlan(JSON.parse(JSON.stringify(plan)));
    setIsEditPlanModalOpen(true);
  };

  const handleAddNewPlan = () => {
    setCurrentEditingPlan({
      id: `new_plan_${Date.now()}`,
      name: '',
      price: '',
      frequency: '/month',
      features: [],
      description: '',
      isActive: true,
      ctaText: 'Get Started',
      isPopular: false,
    });
    setIsEditPlanModalOpen(true);
  };

  const handleSavePlanChanges = (planData: PricingPlan) => {
    const planToSave = {
      ...planData,
      frequency: planData.frequency === FREQUENCY_NONE_SENTINEL ? "" : planData.frequency,
    };
    
    mockPlans = mockPlans.map(p => p.id === planToSave.id ? planToSave : p);
    if (!mockPlans.find(p => p.id === planToSave.id)) {
        mockPlans.push(planToSave);
    }
    mockPlans = [...mockPlans]; 
    setEditablePlans([...mockPlans]); 

    toast({ title: "Plan Changes Saved", description: `Plan "${planToSave.name}" updated. This is now the source for the landing page.` });
    setIsEditPlanModalOpen(false);
    setCurrentEditingPlan(null);
  };

  const handleUpdateLandingPagePricing = () => {
    toast({
      title: "Source of Truth Confirmed",
      description: "The plan configurations are managed here and used by the landing page."
    });
  };

  const handleAddNewCoupon = () => {
    setCurrentEditingCoupon({ id: `coupon_${Date.now()}`, code: '', type: 'percentage', value: 10, isActive: true });
    setIsCouponModalOpen(true);
  };

  const handleEditCoupon = (coupon: CouponCode) => {
    setCurrentEditingCoupon(JSON.parse(JSON.stringify(coupon)));
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = (couponData: Partial<CouponCode>) => {
    if (!couponData.code || !couponData.type || couponData.value === undefined) {
        toast({ variant: 'destructive', title: "Missing Coupon Info", description: "Code, type, and value are required." });
        return;
    }
    const fullCouponData = couponData as CouponCode;

    const index = mockCouponsData.findIndex(c => c.id === fullCouponData.id);
    if (index > -1) {
        mockCouponsData[index] = fullCouponData;
    } else {
        mockCouponsData.push(fullCouponData);
    }
    mockCouponsData = [...mockCouponsData];
    setCoupons([...mockCouponsData]);

    toast({ title: `Coupon ${fullCouponData.id.startsWith('coupon_') && !coupons.find(c => c.id === fullCouponData.id) ? 'Added' : 'Updated'}`, description: `Coupon "${fullCouponData.code}" has been saved.` });
    setIsCouponModalOpen(false);
    setCurrentEditingCoupon(null);
  };


  const handleApprovePayment = (verificationId: string) => {
    const verification = pendingVerifications.find(v => v.id === verificationId);
    if (!verification) return;

    const clinician = initialMockUsers.find(u => u.id === verification.clinicianId);
    if (clinician) {
      updateMockUser({ ...clinician, currentPlanId: verification.requestedPlanId, subscriptionStatus: 'active', paymentReceiptUrl: verification.receiptUrl });
    }

    mockPaymentVerifications = mockPaymentVerifications.map(v => v.id === verificationId ? {...v, status: 'approved'} : v);
    setPendingVerifications([...mockPaymentVerifications].sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));


    addClinicianNotification(verification.clinicianId, {
      title: 'Subscription Activated!',
      description: `Your payment for the ${verification.requestedPlanName} plan has been approved.`,
      type: 'success',
      link: '/clinician/settings'
    });
    toast({ title: 'Payment Approved', description: `Subscription for ${verification.clinicianName} activated.` });
  };

  const handleRejectPayment = (verificationId: string) => {
    const verification = pendingVerifications.find(v => v.id === verificationId);
    if (!verification) return;

     const clinician = initialMockUsers.find(u => u.id === verification.clinicianId);
    if (clinician) {
      updateMockUser({ ...clinician, subscriptionStatus: 'payment_rejected', requestedPlanId: undefined });
    }

    mockPaymentVerifications = mockPaymentVerifications.map(v => v.id === verificationId ? {...v, status: 'rejected'} : v);
    setPendingVerifications([...mockPaymentVerifications].sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
    
    addClinicianNotification(verification.clinicianId, {
      title: 'Payment Verification Issue',
      description: `There was an issue with your payment for the ${verification.requestedPlanName} plan. Please contact support.`,
      type: 'error',
      link: '/clinician/settings'
    });
    toast({ variant: 'destructive', title: 'Payment Rejected', description: `Payment for ${verification.clinicianName} rejected.` });
  };

  const getStatusBadgeVariant = (status: MockSubscription['status'], isTrialExpired?: boolean) => {
    if (status === 'trial' && isTrialExpired) return 'outline';
    switch (status) {
      case 'active': return 'default';
      case 'cancelled': return 'outline';
      case 'past_due': return 'destructive';
      case 'trial': return 'secondary';
      default: return 'secondary';
    }
  };

  const getInvoiceStatusBadgeVariant = (status: MockInvoice['status']) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getCouponStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'outline';
  };


  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <CreditCard className="mr-3 h-8 w-8" /> Billing & Subscription Management
          </h1>
          <p className="text-muted-foreground">Manage subscriptions, view billing history, and configure plans & coupons.</p>
        </div>
      </div>
      
      <Card className="shadow-md border-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center"><Hourglass className="mr-2 h-5 w-5 text-yellow-600"/>Pending Payment Verifications ({pendingVerifications.filter(v => v.status === 'pending').length})</CardTitle>
          <CardDescription>Review submitted payment receipts and activate subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingVerifications.filter(v => v.status === 'pending').length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinician</TableHead>
                  <TableHead>Requested Plan</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingVerifications.filter(v => v.status === 'pending').map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      {verification.clinicianName}
                      <div className="text-xs text-muted-foreground">{verification.clinicianEmail}</div>
                    </TableCell>
                    <TableCell>
                      {verification.requestedPlanName}
                      <div className="text-xs text-muted-foreground">({verification.requestedPlanPrice})</div>
                    </TableCell>
                    <TableCell>{format(new Date(verification.submissionDate), 'PPp')}</TableCell>
                    <TableCell>
                      <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => alert(`Simulating view of receipt: ${verification.receiptUrl}`)}>
                        View Receipt
                      </Button>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="default" size="xs" onClick={() => handleApprovePayment(verification.id)}>
                        <Check className="mr-1 h-3 w-3"/>Approve
                      </Button>
                      <Button variant="destructive" size="xs" onClick={() => handleRejectPayment(verification.id)}>
                        <X className="mr-1 h-3 w-3"/>Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No pending payment verifications.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Active Subscriptions ({mockSubscriptionsData.length})</CardTitle>
          <CardDescription>View and manage all user/clinic subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Billing Info / Trial End</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSubscriptionsData.map((sub) => {
                let displayStatus = sub.status;
                let displayNextBillingDate = sub.nextBillingDate;
                let displayAmount = sub.amount;
                let isTrialExpired = false;

                if (sub.status === 'trial' && sub.trialStartDate) {
                  const trialStart = new Date(sub.trialStartDate);
                  const trialEndDate = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
                  isTrialExpired = new Date() > trialEndDate;

                  if (isTrialExpired) {
                    displayStatus = 'trial_ended' as any;
                    displayNextBillingDate = `Ended: ${formatDate(trialEndDate.toISOString().split('T')[0])}`;
                    displayAmount = "$0.00 (Expired)";
                  } else {
                    displayNextBillingDate = `Ends: ${formatDate(trialEndDate.toISOString().split('T')[0])}`;
                  }
                } else if (sub.nextBillingDate && sub.nextBillingDate !== 'N/A (Trial)') {
                    displayNextBillingDate = formatDate(sub.nextBillingDate);
                }

                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                       <img src={sub.userAvatar} alt={sub.userName} className="h-8 w-8 rounded-full" data-ai-hint="person avatar" />
                       {sub.userName}
                    </TableCell>
                    <TableCell>{sub.planName}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(sub.status, isTrialExpired)} className="capitalize">
                        {displayStatus === 'trial_ended' ? 'Trial Ended' : sub.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{displayNextBillingDate}</TableCell>
                    <TableCell>{displayAmount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleManageSubscription(sub)}>
                        <UserCog className="mr-1 h-4 w-4" /> Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Billing History & Invoices</CardTitle>
          <CardDescription>Access transaction records, payment history, and generate/view invoices.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoicesData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-xs">{invoice.id}</TableCell>
                  <TableCell>{invoice.userName}</TableCell>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell><Badge variant={getInvoiceStatusBadgeVariant(invoice.status)} className="capitalize">{invoice.status}</Badge></TableCell>
                  <TableCell className="text-xs truncate max-w-xs">{invoice.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice.id)}>
                      <Download className="mr-1 h-4 w-4" /> Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5 text-primary"/>Subscription Plan Configuration</CardTitle>
                <CardDescription>Define and manage subscription plans. Changes here become the source for the public landing page pricing after being saved.</CardDescription>
            </div>
             <Button onClick={handleAddNewPlan} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Plan
            </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editablePlans.map(plan => (
              <Card key={plan.id} className={cn(!plan.isActive && "opacity-60 bg-muted/30")}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {plan.name}
                    <Badge variant={plan.isActive ? 'default' : 'outline'}>{plan.isActive ? 'Active' : 'Inactive'}</Badge>
                  </CardTitle>
                  <CardDescription>{plan.price} {plan.frequency}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    {plan.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                   {plan.isPopular && <Badge variant="secondary" className="mt-2">Popular</Badge>}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleEditPlan(plan)}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
           <div className="text-center pt-4 border-t">
             <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                Saving plan changes here will update the source data used by the landing page.
             </p>
             <Button variant="default" onClick={handleUpdateLandingPagePricing}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Confirm: Plans Here Drive Landing Page
             </Button>
          </div>
        </CardContent>
      </Card>

       <Card className="shadow-md">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="flex items-center"><Ticket className="mr-2 h-5 w-5 text-primary"/>Coupon & Discount Management</CardTitle>
            <CardDescription>Create and manage promotional codes for subscription plans.</CardDescription>
          </div>
          <Button onClick={handleAddNewCoupon} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Coupon
          </Button>
        </CardHeader>
        <CardContent>
          {coupons.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                    <TableCell className="capitalize">{coupon.type.replace('_',' ')}</TableCell>
                    <TableCell>{coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}</TableCell>
                    <TableCell><Badge variant={getCouponStatusBadgeVariant(coupon.isActive)}>{coupon.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>{formatDate(coupon.expirationDate)}</TableCell>
                    <TableCell>{coupon.timesUsed ?? 0} / {coupon.usageLimit ? coupon.usageLimit : 'Unlimited'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCoupon(coupon)}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No coupons created yet.</p>
          )}
        </CardContent>
      </Card>

      {selectedSubscription && (
        <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Subscription: {selectedSubscription.userName}</DialogTitle>
              <DialogDescription>Current Plan: {selectedSubscription.planName} ({selectedSubscription.status})</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="changePlan">Change Plan To:</Label>
                <Select onValueChange={handleSimulatedPlanChange}>
                  <SelectTrigger id="changePlan">
                    <SelectValue placeholder="Select new plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {editablePlans.filter(p => p.isActive).map(plan => (
                      <SelectItem key={plan.id} value={plan.id} disabled={plan.name === selectedSubscription.planName}>
                        {plan.name} ({plan.price}{plan.frequency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="w-full" onClick={() => { toast({title: "Invoice History (Simulated)", description: `Showing invoice history for ${selectedSubscription.userName}`}); setIsManageModalOpen(false); }}>
                <FileText className="mr-2 h-4 w-4" /> View Full Invoice History
              </Button>
              <Button variant="destructive" className="w-full" onClick={() => { toast({title: "Subscription Cancelled (Simulated)", description: `Subscription for ${selectedSubscription.userName} has been cancelled.`}); setIsManageModalOpen(false); }}>
                Cancel Subscription
              </Button>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {currentEditingPlan && (
        <Dialog open={isEditPlanModalOpen} onOpenChange={(isOpen) => { setIsEditPlanModalOpen(isOpen); if (!isOpen) setCurrentEditingPlan(null); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{currentEditingPlan.name && currentEditingPlan.id.startsWith('plan_') ? `Edit Plan: ${currentEditingPlan.name}` : 'Add New Plan'}</DialogTitle>
              <DialogDescription>Modify details for this subscription plan. These changes will be reflected on the public landing page.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3 max-h-[60vh] overflow-y-auto pr-2">
               <Label htmlFor="planName">Plan Name</Label>
               <Input id="planName" value={currentEditingPlan.name} onChange={(e) => setCurrentEditingPlan({...currentEditingPlan, name: e.target.value})} />

               <Label htmlFor="planPrice">Price (e.g., $29 or Custom)</Label>
               <Input id="planPrice" value={currentEditingPlan.price} onChange={(e) => setCurrentEditingPlan({...currentEditingPlan, price: e.target.value})} />

               <Label htmlFor="planFreq">Frequency</Label>
               <Select
                  value={currentEditingPlan.frequency === '' ? FREQUENCY_NONE_SENTINEL : currentEditingPlan.frequency}
                  onValueChange={(val: string) => {
                    const actualFrequency: PricingPlan['frequency'] = val === FREQUENCY_NONE_SENTINEL ? "" : (val as PricingPlan['frequency']);
                    setCurrentEditingPlan({...currentEditingPlan, frequency: actualFrequency});
                  }}
                >
                  <SelectTrigger id="planFreq"><SelectValue placeholder="Select frequency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/month">/month</SelectItem>
                    <SelectItem value="/year">/year</SelectItem>
                    <SelectItem value="one-time">one-time</SelectItem>
                    <SelectItem value={FREQUENCY_NONE_SENTINEL}>(None for Custom Price)</SelectItem>
                  </SelectContent>
               </Select>

               <Label htmlFor="planDesc">Short Description</Label>
               <Input id="planDesc" value={currentEditingPlan.description} onChange={(e) => setCurrentEditingPlan({...currentEditingPlan, description: e.target.value})} />

               <Label>Features (one per line)</Label>
               <Textarea
                  value={currentEditingPlan.features.join('\n')}
                  onChange={(e) => setCurrentEditingPlan({...currentEditingPlan, features: e.target.value.split('\n').filter(f => f.trim() !== '')})}
                  className="w-full min-h-[80px]"
                  rows={4}
                />

                <Label htmlFor="planCtaText">CTA Button Text (Landing Page)</Label>
                <Input id="planCtaText" value={currentEditingPlan.ctaText} onChange={(e) => setCurrentEditingPlan({...currentEditingPlan, ctaText: e.target.value})} placeholder="e.g. Get Started, Choose Plan"/>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="planIsActive" checked={currentEditingPlan.isActive} onCheckedChange={(checked) => setCurrentEditingPlan({...currentEditingPlan, isActive: !!checked})} />
                  <Label htmlFor="planIsActive" className="text-sm font-medium leading-none cursor-pointer">
                    Plan is Active (visible on landing page)
                  </Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="planIsPopular" checked={currentEditingPlan.isPopular} onCheckedChange={(checked) => setCurrentEditingPlan({...currentEditingPlan, isPopular: !!checked})} />
                  <Label htmlFor="planIsPopular" className="text-sm font-medium leading-none cursor-pointer">
                    Mark as Popular (displays badge on landing page)
                  </Label>
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditPlanModalOpen(false); setCurrentEditingPlan(null); }}>Cancel</Button>
              <Button onClick={() => handleSavePlanChanges(currentEditingPlan)}>Save Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {currentEditingCoupon && (
        <Dialog open={isCouponModalOpen} onOpenChange={(isOpen) => { setIsCouponModalOpen(isOpen); if (!isOpen) setCurrentEditingCoupon(null);}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{currentEditingCoupon.id && !currentEditingCoupon.id.startsWith('coupon_') ? `Edit Coupon: ${currentEditingCoupon.code}` : 'Add New Coupon'}</DialogTitle>
              <DialogDescription>Configure coupon details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="couponCode">Coupon Code</Label>
                <Input id="couponCode" value={currentEditingCoupon.code || ''} onChange={(e) => setCurrentEditingCoupon(prev => ({...prev, code: e.target.value.toUpperCase()}))} placeholder="E.g., SUMMER25" />
              </div>
              <div>
                <Label htmlFor="couponType">Type</Label>
                <Select value={currentEditingCoupon.type || 'percentage'} onValueChange={(v) => setCurrentEditingCoupon(prev => ({...prev, type: v as CouponType}))}>
                  <SelectTrigger id="couponType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Discount</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="couponValue">Value</Label>
                <Input id="couponValue" type="number" value={currentEditingCoupon.value || ''} onChange={(e) => setCurrentEditingCoupon(prev => ({...prev, value: parseFloat(e.target.value) || 0 }))} placeholder={currentEditingCoupon.type === 'percentage' ? 'E.g., 20 for 20%' : 'E.g., 10 for $10 off'} />
              </div>
              <div>
                <Label htmlFor="couponExpiry">Expiration Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="couponExpiry"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !currentEditingCoupon.expirationDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentEditingCoupon.expirationDate ? format(new Date(currentEditingCoupon.expirationDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={currentEditingCoupon.expirationDate ? new Date(currentEditingCoupon.expirationDate) : undefined}
                      onSelect={(date) => setCurrentEditingCoupon(prev => ({...prev, expirationDate: date ? date.toISOString().split('T')[0] : undefined}))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="couponUsageLimit">Usage Limit (Optional)</Label>
                <Input id="couponUsageLimit" type="number" value={currentEditingCoupon.usageLimit || ''} onChange={(e) => setCurrentEditingCoupon(prev => ({...prev, usageLimit: parseInt(e.target.value) || undefined}))} placeholder="E.g., 100" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="couponIsActive" checked={currentEditingCoupon.isActive} onCheckedChange={(checked) => setCurrentEditingCoupon(prev => ({...prev, isActive: !!checked}))} />
                <Label htmlFor="couponIsActive" className="text-sm font-medium leading-none cursor-pointer">Coupon is Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCouponModalOpen(false); setCurrentEditingCoupon(null); }}>Cancel</Button>
              <Button onClick={() => handleSaveCoupon(currentEditingCoupon)}>Save Coupon</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

