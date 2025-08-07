
export interface Testimonial {
  id: string;
  text: string;
  author: string;
  role: string;
}

const professionalRolesList = [
  'Chiropractor', 'Doctor', 'Exercise Rehabilitation Instructor', 'Nurse',
  'Nutritionist', 'Osteopath', 'Personal Trainer', 'Physiotherapist',
  'Pilates Instructor', 'Podiatrist', 'Researcher', 'S&C Coach',
  'Sport Massage Therapist', 'Sports Scientist', 'Sports Therapist', 'Surgeon'
] as const;

const systemRolesList = [
  'Patient',
  'Admin',
  'Content Reviewer',
  'Moderator',
  'Finance Admin',
  'Clinic Owner'
] as const;

export type ProfessionalRole = typeof professionalRolesList[number];
export type SystemRole = typeof systemRolesList[number];
export type UserRole = ProfessionalRole | SystemRole;

export const allUserRoles: UserRole[] = [
    ...professionalRolesList,
    ...systemRolesList
].filter((value, index, self) => self.indexOf(value) === index);

export const professionalRoles: ReadonlyArray<ProfessionalRole> = professionalRolesList;
export const internalAdminRoles: ReadonlyArray<SystemRole> = ['Admin', 'Content Reviewer', 'Moderator', 'Finance Admin'] as const;


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'pending_invitation';
export type SubscriptionStatus = 'active' | 'trial' | 'pending_payment' | 'payment_rejected' | 'cancelled' | 'none';


export interface AdminUser extends User {
  status: UserStatus;
  whatsappNumber?: string;
  lastLogin?: string;
  joinedDate: string;
  patientCount?: number;
  appointmentCount?: number;
  churnRisk?: number;
  totalAppointments?: number;
  totalPatients?: number;
  specialization?: string;
  currentPlanId?: string;
  subscriptionStatus?: SubscriptionStatus;
  paymentReceiptUrl?: string; 
  requestedPlanId?: string; 
  city?: string; 
}

export type ExerciseStatus = 'active' | 'pending' | 'rejected';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  category: string;
  bodyParts: string[];
  equipment?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  precautions?: string;
  status: ExerciseStatus;
  isFeatured?: boolean;
  reps?: string;
  sets?: string;
  hold?: string;
  exerciseId?: string;
}

export interface ProgramExerciseFeedback {
  timestamp: string;
  painLevel: number;
  comments: string;
  acknowledgedByClinician?: boolean; 
}

export interface ProgramExercise {
  exerciseId: string;
  sets?: number | string;
  reps?: number | string;
  duration?: string;
  rest?: string;
  notes?: string;
  feedbackHistory?: ProgramExerciseFeedback[]; 
}

export interface Program {
  id: string;
  name: string;
  patientId?: string;
  clinicianId: string;
  exercises: ProgramExercise[];
  createdAt: string;
  status: 'draft' | 'active' | 'archived' | 'template' | 'completed';
  description?: string;
  isTemplate?: boolean;
  category?: string;
  assignedDate?: string;
  completionDate?: string;
  adherenceRate?: number;
}


export interface PatientTask {
  id: string;
  exerciseName: string;
  thumbnailUrl?: string;
  completed: boolean;
  programId: string;
  exerciseDetails: {
    exerciseId: string;
    sets?: number | string;
    reps?: number | string;
    duration?: string;
  };
}

export interface PatientProgress {
  streak: number;
  badges: string[];
  completionRate: number;
  totalWorkoutsCompleted?: number;
  totalExercisesCompleted?: number;
}


export interface Patient {
  id: string;
  userId: string;
  name: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phone?: string;
  address?: string;
  conditions: string[];
  medicalNotes?: string;
  currentProgramId?: string;
  avatarUrl?: string;
  assignedClinicianId?: string;
  assignedClinicianName?: string;
  lastActivity?: string;
  overallAdherence?: number;
  whatsappNumber?: string; 
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'pending' | 'rescheduled';
export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string; 
  clinicianId: string;
  clinicianName?: string; 
  start: Date;
  end: Date;
  title?: string;
  status: AppointmentStatus;
  type?: 'Initial Consultation' | 'Follow-up' | 'Routine Visit' | 'Telehealth Check-in'; 
  notes?: string; 
  patientNotes?: string; 
  city?: string; 
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  receiverId: string;
  content: string;
  timestamp: string;
  attachmentUrl?: string;
  isRead?: boolean;
}


export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  frequency: '/month' | '/year' | 'one-time' | '';
  features: string[];
  description: string;
  isActive: boolean;
  ctaText: string;
  isPopular?: boolean;
}

export interface MockSubscription {
  id: string;
  userName: string;
  userAvatar: string;
  planName: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trial';
  nextBillingDate: string;
  amount: string;
  userId: string;
  trialStartDate?: string;
}

export interface MockInvoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  userName: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminUserId: string;
  adminUserName: string;
  action: string;
  targetEntityType?: string;
  targetEntityId?: string;
  details?: Record<string, any>;
}

export interface TeamMember extends User {
    status: UserStatus;
    role: SystemRole;
    lastLogin?: string;
    joinedDate: string;
    invitedByAdminId?: string;
    invitedByAdminName?: string;
    lastInvitationSentAt?: string;
}

export type AnnouncementTarget = 'all' | 'clinicians' | 'patients';
export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  targetAudience: AnnouncementTarget;
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt?: string;
  assignedToAdminId?: string;
  assignedToAdminName?: string;
  internalNotes?: Array<{
    adminId: string;
    adminName: string;
    note: string;
    timestamp: string;
  }>;
}

export type CouponType = 'percentage' | 'fixed_amount';
export interface CouponCode {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  isActive: boolean;
  expirationDate?: string;
  usageLimit?: number;
  timesUsed?: number;
  applicablePlans?: string[];
}

export interface EducationalResource {
  id: string;
  title: string;
  type: 'article' | 'video';
  summary: string;
  content?: string; 
  contentUrl?: string; 
  thumbnailUrl?: string;
  tags?: string[];
  estimatedReadTime?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string; 
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'update' | 'payment';
}

export interface PaymentVerificationRequest {
  id: string;
  clinicianId: string;
  clinicianName: string;
  clinicianEmail: string;
  requestedPlanId: string;
  requestedPlanName: string;
  requestedPlanPrice: string;
  receiptUrl: string; 
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Removed PendingAppointmentDetails interface as the feature is removed

