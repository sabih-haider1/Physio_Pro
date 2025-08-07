
# TheraGenius Platform: Comprehensive System Schema

## 1. Introduction

This document serves as the central schema definition for the TheraGenius platform. It details all data entities, their attributes, relationships, constraints, AI flow schemas, and conceptual data interactions between the frontend and a potential backend. Its purpose is to provide a single source of truth for developers, ensuring consistency and clarity in data handling and system architecture.

This schema is derived from the frontend implementation (`src/lib/types.ts`, component forms, AI flows) and the backend expectations outlined in `README.md`.

**Key Update Note**: The feature for patients to self-book appointments directly through the patient portal has been removed from the current frontend implementation. Appointments are primarily managed by clinicians. Schema sections related to direct patient self-booking should be considered vestigial or repurposed for clinician-driven scheduling.

---

## 2. Core Data Entities

This section describes the primary data models used throughout the TheraGenius application. Each entity's importance is highlighted by its role in core platform functionality.

### 2.1. User Management

#### 2.1.1. Base User (`User`)
*   **Description & Importance**: Core attributes common to all user types (Clinicians, Patients, Admin Team). Essential for basic identification, authentication, and role assignment. Forms the foundation for all user-specific data and interactions.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier for the user. (Required)
    *   `name`: `string` - Full name of the user. (Required)
    *   `email`: `string` (Unique) - Email address, used for login. (Required)
    *   `role`: `UserRole` (Enum: See Key Enums section) - Defines the user's primary role in the system (e.g., 'Physiotherapist', 'Patient', 'Admin'). (Required)
    *   `avatarUrl?`: `string` (Optional) - URL to the user's profile picture.
*   **Frontend Usage**: Base for all user profile displays (avatars, names). Determines layout and feature access based on `role`.

#### 2.1.2. Clinician (`AdminUser` - Extends `User`)
*   **Description & Importance**: Represents clinicians (Physiotherapists, Doctors, etc.) using the platform to manage patients, create exercise programs, and deliver care. This entity is central to the core clinical workflows of the platform.
*   **Inherits**: `User`
*   **Fields**:
    *   `status`: `UserStatus` (Enum: 'active', 'inactive', 'pending', 'suspended', 'pending_invitation') - Account status determining platform access. (Required)
    *   `whatsappNumber?`: `string` (Optional) - Clinician's WhatsApp contact number. (Format: E.164)
    *   `lastLogin?`: `string` (ISO Date string, Optional) - Timestamp of the last login.
    *   `joinedDate`: `string` (ISO Date string) - Date the clinician joined. (Required)
    *   `patientCount?`: `number` (Optional, Derived by backend) - Number of patients assigned to this clinician.
    *   `appointmentCount?`: `number` (Optional, Derived by backend) - Total appointments managed by this clinician.
    *   `specialization?`: `string` (Optional) - Clinician's area of specialization (e.g., "Sports Injury Rehab").
    *   `currentPlanId?`: `string` (Optional, FK to `PricingPlan.id`) - Identifier of the clinician's current subscription plan.
    *   `subscriptionStatus?`: `SubscriptionStatus` (Enum: 'active', 'trial', 'pending_payment', 'payment_rejected', 'cancelled', 'none', Optional) - Status of their subscription.
    *   `paymentReceiptUrl?`: `string` (Optional) - URL of the uploaded payment receipt for manual verification.
    *   `requestedPlanId?`: `string` (Optional, FK to `PricingPlan.id`) - ID of the plan requested during manual payment.
    *   `city?`: `string` (Optional) - City where the clinician operates, used for discovery and regional management.
*   **Relationships**:
    *   One-to-Many with `Patient` (via `Patient.assignedClinicianId`).
    *   One-to-Many with `Program` (via `Program.clinicianId`).
    *   One-to-Many with `Appointment` (via `Appointment.clinicianId`).
    *   Many-to-One with `PricingPlan` (via `currentPlanId` and `requestedPlanId`).
*   **Frontend Usage**:
    *   Admin Panel: User Management (CRUD operations on clinicians). Forms for adding/editing clinicians include all relevant fields.
    *   Clinician Panel: Profile settings, basis for accessing clinician-specific tools.
    *   Patient Portal: Used to display clinician information if a patient is assigned.

#### 2.1.3. Platform Team Member (`TeamMember` - Extends `User`)
*   **Description & Importance**: Represents internal administrative staff managing the TheraGenius platform (e.g., Admins, Content Reviewers). Essential for platform operations, content moderation, billing, and support.
*   **Inherits**: `User`
*   **Fields**:
    *   `role`: `SystemRole` (Enum: 'Admin', 'Content Reviewer', 'Moderator', 'Finance Admin') - Specific administrative role, overwriting `User.role`.
    *   `status`: `UserStatus` (Enum: 'active', 'inactive', 'pending_invitation', 'suspended') - Account status. (Required)
    *   `lastLogin?`: `string` (ISO Date string, Optional) - Timestamp of last login.
    *   `joinedDate`: `string` (ISO Date string) - Date the team member was added/joined. (Required)
    *   `invitedByAdminId?`: `string` (Optional, FK to `TeamMember.id`) - ID of the admin who invited this member.
    *   `invitedByAdminName?`: `string` (Optional) - Name of the inviting admin.
    *   `lastInvitationSentAt?`: `string` (ISO Date string, Optional) - Timestamp of the last invitation email sent.
*   **Frontend Usage**:
    *   Admin Panel: Team Management (invite, edit roles/status). Defines access levels within the admin panel.

#### 2.1.4. Patient (`Patient`)
*   **Description & Importance**: Represents patients receiving care and using the patient portal. This entity stores all patient-specific demographic, medical, and program-related information, forming the core of the patient-facing application.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `userId`: `string` (FK to a base `UserAccount` table or can be same as `id`) - User account identifier ensuring link to `User` entity.
    *   `name`: `string` - Full name. (Required)
    *   `email?`: `string` (Optional, Unique) - Email address.
    *   `dateOfBirth?`: `string` (ISO Date string, Optional) - Patient's date of birth.
    *   `gender?`: `string` (Enum: 'Male', 'Female', 'Other', 'Prefer not to say', Optional) - Patient's gender.
    *   `phone?`: `string` (Optional) - Contact phone number.
    *   `whatsappNumber?`: `string` (Optional) - Patient's WhatsApp contact. (Format: E.164)
    *   `address?`: `string` (Optional) - Physical address.
    *   `conditions`: `string[]` - List of medical conditions or primary complaints. Used by AI for program suggestions. (Required, can be empty array)
    *   `medicalNotes?`: `string` (Optional) - General medical notes entered by the clinician.
    *   `currentProgramId?`: `string` (Optional, FK to `Program.id`) - ID of the currently assigned active program.
    *   `avatarUrl?`: `string` (Optional) - URL to profile picture.
    *   `assignedClinicianId?`: `string` (Optional, FK to `AdminUser.id`) - ID of the clinician managing this patient.
    *   `assignedClinicianName?`: `string` (Optional, Denormalized) - Name of the assigned clinician.
    *   `lastActivity?`: `string` (ISO Date string, Optional) - Timestamp of the patient's last interaction.
    *   `overallAdherence?`: `number` (Optional, 0-100, Derived by backend) - Overall adherence percentage to their programs.
*   **Relationships**:
    *   Many-to-One with `AdminUser` (Clinician).
    *   One-to-Many with `Program` (via `Program.patientId`).
    *   One-to-Many with `Appointment` (via `Appointment.patientId`).
*   **Frontend Usage**:
    *   Clinician Panel: Patient Management (add, view, manage profile, assign programs).
    *   Patient Portal: Displays patient's profile, their assigned program, appointments, and facilitates interaction with their clinician.

### 2.2. Content Management

#### 2.2.1. Exercise (`Exercise`)
*   **Description & Importance**: Represents a single exercise in the platform's central library. This is a fundamental building block for all exercise programs. Rich exercise details enable effective program creation and patient understanding.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `name`: `string` (Unique within library) - Name of the exercise. (Required)
    *   `description`: `string` - Detailed instructions on how to perform the exercise. (Required)
    *   `videoUrl?`: `string` (URL, Optional) - Link to a video demonstration.
    *   `thumbnailUrl?`: `string` (URL, Optional) - Link to a thumbnail image for the exercise.
    *   `category`: `string` - Category of the exercise (e.g., "Strength", "Mobility"). (Required)
    *   `bodyParts`: `string[]` - List of primary body parts targeted. (Required, min 1)
    *   `equipment?`: `string` (Optional) - Equipment needed (e.g., "Dumbbells", "Resistance Band").
    *   `difficulty`: `'Beginner' | 'Intermediate' | 'Advanced'` - Difficulty level. (Required)
    *   `precautions?`: `string` (Optional) - Safety precautions or contraindications.
    *   `status`: `ExerciseStatus` (Enum: 'active', 'pending', 'rejected') - Approval status in the library. (Required)
    *   `isFeatured?`: `boolean` (Optional, default: `false`) - Whether the exercise is highlighted.
    *   `reps?`: `string` (Optional) - Default repetitions (e.g., "10-12", "AMRAP").
    *   `sets?`: `string` (Optional) - Default sets (e.g., "3", "2-3").
    *   `hold?`: `string` (Optional) - Default hold duration (e.g., "30s", "Hold 5s").
    *   `exerciseId?`: `string` (Optional, legacy or alternative ID if needed) - Primary ID is `id`.
*   **Relationships**:
    *   Many-to-Many with `Program` (through `ProgramExercise`).
*   **Frontend Usage**:
    *   Admin Panel: Exercise Management (CRUD), CSV import/export. Used to populate the central exercise library.
    *   Clinician Panel: Exercise Library (browse, AI search, manual search, preview), Program Builder (select exercises).
    *   Patient Portal: Displays exercise details (instructions, video) within their assigned program.

#### 2.2.2. Program Template (`Program` where `isTemplate: true`)
*   **Description & Importance**: Represents reusable exercise program structures created by admins or clinicians. Templates significantly speed up the program creation process for common conditions or goals.
*   **Shares structure with `Program`, but `isTemplate` is `true` and certain fields might be used differently (e.g., `patientId` is null for a pure template).**
*   **Fields (Highlights for Template context)**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `name`: `string` - Name of the template. (Required)
    *   `description?`: `string` (Optional) - Description of the template's purpose.
    *   `clinicianId`: `string` (FK to `AdminUser.id`) - ID of the admin/clinician who created the template. (Required)
    *   `exercises`: `ProgramExercise[]` - List of exercises in the template with default parameters. (Required, min 1)
    *   `createdAt`: `string` (ISO Date string) - Timestamp of creation. (Required)
    *   `status`: `'draft' | 'active' | 'archived' | 'template'` - Status of the template. (Required)
    *   `isTemplate`: `true` (Constant)
    *   `category?`: `string` (Optional) - Category for the template (e.g., "Post-Surgery", "Shoulder") for better organization.
*   **Frontend Usage**:
    *   Admin Panel: Program Template Management (CRUD). Allows admins to create and curate standard templates.
    *   Clinician Panel: Program Builder (allows clinicians to load a template as a starting point for a patient's program). List of available templates.

#### 2.2.3. Educational Resource (`EducationalResource`)
*   **Description & Importance**: Represents articles, videos, or other learning materials curated by admins for patient education. Enhances patient understanding and engagement with their health and recovery.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `title`: `string` - Title of the resource. (Required)
    *   `type`: `'article' | 'video'` - Type of content. (Required)
    *   `summary`: `string` - Brief summary of the resource. (Required)
    *   `content?`: `string` (Markdown, Optional) - Full content for articles.
    *   `contentUrl?`: `string` (URL, Optional) - Link for videos or external articles.
    *   `thumbnailUrl?`: `string` (URL, Optional) - Preview image URL.
    *   `tags?`: `string[]` (Optional) - Keywords for searching and categorization.
    *   `estimatedReadTime?`: `string` (Optional) - E.g., "5 min read", "10 min watch".
    *   `status`: `'draft' | 'published' | 'archived'` - Publication status, controlling visibility to patients. (Required)
    *   `createdAt`: `string` (ISO Date string) - Timestamp of creation. (Required)
    *   `updatedAt?`: `string` (ISO Date string, Optional) - Timestamp of last update.
*   **Frontend Usage**:
    *   Admin Panel: Educational Resource Management (CRUD operations).
    *   Patient Portal: Learning Hub (patients can browse, search, and view published resources).

### 2.3. Clinical Operations

#### 2.3.1. Program (`Program`)
*   **Description & Importance**: An exercise program assigned to a specific patient by a clinician. This is a central entity detailing the prescribed regimen for a patient's treatment or fitness goals.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `name`: `string` - Name of the program. (Required)
    *   `patientId?`: `string` (Optional, FK to `Patient.id`) - ID of the patient this program is assigned to. Null if it's a template not yet assigned.
    *   `clinicianId`: `string` (FK to `AdminUser.id`) - ID of the clinician who created/assigned it. (Required)
    *   `exercises`: `ProgramExercise[]` - List of exercises in the program, with specific parameters. (Required, min 1 for active programs)
    *   `createdAt`: `string` (ISO Date string) - Timestamp of creation. (Required)
    *   `status`: `'draft' | 'active' | 'archived' | 'template' | 'completed'` - Current status of the program. (Required)
    *   `description?`: `string` (Optional) - Description or goals for the program.
    *   `isTemplate?`: `boolean` (Optional, default: `false`) - True if this is a program template.
    *   `category?`: `string` (Optional) - Category, mainly for templates.
    *   `assignedDate?`: `string` (ISO Date string, Optional) - Date the program was assigned to a patient.
    *   `completionDate?`: `string` (ISO Date string, Optional) - Date the program was marked as completed.
    *   `adherenceRate?`: `number` (Optional, 0-100, Derived by backend) - Calculated adherence for patient-assigned programs.
*   **Relationships**:
    *   Many-to-One with `Patient`.
    *   Many-to-One with `AdminUser` (Clinician).
    *   Contains `ProgramExercise[]`.
*   **Frontend Usage**:
    *   Clinician Panel: Program Builder (create, edit, assign programs), "My Programs" list (lists programs assigned to patients by the clinician).
    *   Patient Portal: Displays the currently assigned program details to the patient.

#### 2.3.2. Program Exercise (`ProgramExercise`)
*   **Description & Importance**: Represents a specific instance of an exercise within a patient's `Program` or a `Program Template`, including prescribed parameters (sets, reps, etc.) and patient feedback. This entity links the general exercise from the library to its specific application.
*   **Fields**:
    *   `exerciseId`: `string` (FK to `Exercise.id`) - Identifier of the base exercise from the library. (Required)
    *   `sets?`: `number | string` (Optional) - Prescribed sets.
    *   `reps?`: `number | string` (Optional) - Prescribed repetitions.
    *   `duration?`: `string` (Optional) - Prescribed hold duration or time for the exercise.
    *   `rest?`: `string` (Optional) - Prescribed rest period between sets or exercises.
    *   `notes?`: `string` (Optional) - Clinician's notes specific to this exercise in this program (e.g., "Focus on form," "Use lighter weight if needed").
    *   `feedbackHistory?`: `ProgramExerciseFeedback[]` (Optional) - Array of feedback entries from the patient for this exercise instance.
*   **Relationships**:
    *   Many-to-One with `Exercise`.
    *   Part of `Program.exercises` array.
*   **Frontend Usage**:
    *   Clinician Panel: Program Builder (configuring exercise parameters when adding to a program). Viewing patient feedback within a program.
    *   Patient Portal: Displays prescribed parameters for each exercise. Collects patient feedback associated with this specific exercise instance.

#### 2.3.3. Program Exercise Feedback (`ProgramExerciseFeedback`)
*   **Description & Importance**: Feedback submitted by a patient for a specific exercise they performed as part of their program. Crucial for clinicians to monitor patient progress, pain levels, and make informed adjustments to the program. AI validation is applied to this feedback.
*   **Fields**:
    *   `timestamp`: `string` (ISO Date string) - When the feedback was submitted. (Required)
    *   `painLevel`: `number` (1-10) - Patient-reported pain level during/after the exercise. (Required)
    *   `comments`: `string` - Patient's textual comments about the exercise. (Required)
    *   `acknowledgedByClinician?`: `boolean` (Optional, default: `false`) - Whether the clinician has reviewed this specific feedback.
*   **Relationships**:
    *   Part of `ProgramExercise.feedbackHistory` array.
*   **Frontend Usage**:
    *   Patient Portal: Form for submitting feedback after completing an exercise. Displays past feedback.
    *   Clinician Panel: View patient feedback within the context of their assigned program, allows acknowledging feedback.

#### 2.3.4. Appointment (`Appointment`)
*   **Description & Importance**: Represents a scheduled appointment between a clinician and a patient. Essential for managing clinician schedules and patient consultations.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `patientId`: `string` (FK to `Patient.id`) - ID of the patient. (Required)
    *   `patientName?`: `string` (Optional, Denormalized) - Patient's name for display convenience.
    *   `clinicianId`: `string` (FK to `AdminUser.id`) - ID of the clinician. (Required)
    *   `clinicianName?`: `string` (Optional, Denormalized) - Clinician's name for display.
    *   `start`: `Date` (or ISO Date string) - Start date and time of the appointment. (Required)
    *   `end`: `Date` (or ISO Date string) - End date and time. (Required)
    *   `title?`: `string` (Optional) - Custom title for the appointment (e.g., "Knee Assessment").
    *   `status`: `AppointmentStatus` (Enum: 'scheduled', 'completed', 'cancelled', 'pending', 'rescheduled') - Status of the appointment. (Required)
    *   `type?`: `'Initial Consultation' | 'Follow-up' | 'Routine Visit' | 'Telehealth Check-in'` (Optional) - Type of appointment.
    *   `notes?`: `string` (Optional) - Clinician's notes for the appointment.
    *   `patientNotes?`: `string` (Optional) - Notes from the patient (historically, if patient self-booking was enabled, this field might have been used).
    *   `city?`: `string` (Optional) - City where the appointment takes place (if relevant, e.g., for in-person). Used by clinicians for organization.
*   **Relationships**:
    *   Many-to-One with `Patient`.
    *   Many-to-One with `AdminUser` (Clinician).
*   **Frontend Usage**:
    *   Clinician Panel: Appointment Scheduling Calendar (CRUD operations on appointments).
    *   Patient Portal: View upcoming and past appointments. (Patient self-booking feature is currently disabled).

#### 2.3.5. Message (`Message`)
*   **Description & Importance**: Represents a single message in the secure messaging system between a clinician and a patient. Facilitates direct communication, which is vital for ongoing care and support.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `senderId`: `string` (FK to `User.id` - could be Patient or Clinician) - ID of the message sender. (Required)
    *   `senderName?`: `string` (Optional, Denormalized) - Name of the sender for display.
    *   `senderAvatar?`: `string` (URL, Optional) - Avatar of the sender.
    *   `receiverId`: `string` (FK to `User.id`) - ID of the message receiver. (Required)
    *   `content`: `string` - Text content of the message. (Required)
    *   `timestamp`: `string` (ISO Date string) - When the message was sent. (Required)
    *   `attachmentUrl?`: `string` (URL, Optional) - Link to any attached file (currently simulated in frontend).
    *   `isRead?`: `boolean` (Optional, default: `false`) - Read status of the message.
*   **Frontend Usage**:
    *   Clinician Panel: Secure Messaging interface with their assigned patients.
    *   Patient Portal: Secure Messaging interface with their assigned clinician.

### 2.4. Platform Management

#### 2.4.1. Platform Announcement (`PlatformAnnouncement`)
*   **Description & Importance**: Announcements broadcast by admins to platform users (all, clinicians, or patients). Used for important updates, new features, or general communication.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `title`: `string` - Title of the announcement. (Required)
    *   `content`: `string` (Markdown) - Full content of the announcement. (Required)
    *   `targetAudience`: `AnnouncementTarget` (Enum: 'all', 'clinicians', 'patients') - Who should see this. (Required)
    *   `createdAt`: `string` (ISO Date string) - Timestamp of creation. (Required)
    *   `status`: `'draft' | 'published' | 'archived'` - Publication status. (Required)
*   **Frontend Usage**:
    *   Admin Panel: Communication > Platform Announcements (CRUD operations).
    *   Relevant User Panels: Display published announcements (conceptual, UI might not be fully implemented for display yet).

#### 2.4.2. Support Ticket (`SupportTicket`)
*   **Description & Importance**: A support request submitted by a user (clinician or patient) to platform administrators. Essential for addressing user issues, gathering feedback, and improving platform reliability.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `userId`: `string` (FK to `User.id`) - ID of the user who submitted the ticket. (Required)
    *   `userName`: `string` - Name of the submitting user. (Required)
    *   `userEmail`: `string` - Email of the submitting user. (Required)
    *   `subject`: `string` - Subject of the support request. (Required)
    *   `description`: `string` - Detailed description of the issue/request. (Required)
    *   `status`: `TicketStatus` (Enum: 'open', 'in_progress', 'resolved', 'closed') - Current status. (Required)
    *   `priority`: `'low' | 'medium' | 'high'` - Priority of the ticket. (Required)
    *   `createdAt`: `string` (ISO Date string) - Timestamp of submission. (Required)
    *   `updatedAt?`: `string` (ISO Date string, Optional) - Timestamp of last update.
    *   `assignedToAdminId?`: `string` (Optional, FK to `TeamMember.id`) - ID of the admin assigned to this ticket.
    *   `assignedToAdminName?`: `string` (Optional) - Name of the assigned admin.
    *   `internalNotes?`: `Array<{ adminId: string; adminName: string; note: string; timestamp: string; }>` (Optional) - Notes for internal admin team for collaboration and tracking.
*   **Frontend Usage**:
    *   Admin Panel: Support Ticket System (view list, manage individual tickets, assign, add internal notes).
    *   Clinician/Patient Panels: Forms to submit support tickets.

#### 2.4.3. Pricing Plan (`PricingPlan`)
*   **Description & Importance**: Defines subscription plans offered on the platform for clinicians. This entity directly drives the monetization strategy and feature availability for different clinician tiers.
*   **Fields**:
    *   `id`: `string` (Primary Key, e.g., "plan_pro_monthly") - Unique identifier for the plan. (Required)
    *   `name`: `string` - Display name of the plan (e.g., "Pro Monthly"). (Required)
    *   `price`: `string` - Price string (e.g., "$79", "Custom"). (Required)
    *   `frequency`: `'/month' | '/year' | 'one-time' | ''` - Billing frequency. (Required)
    *   `features`: `string[]` - List of features included in this plan. (Required)
    *   `description`: `string` - Short description of the plan. (Required)
    *   `isActive`: `boolean` - Whether this plan is currently offered to new users. (Required)
    *   `ctaText`: `string` - Call to action text for this plan (e.g., "Get Started", "Contact Us"). (Required)
    *   `isPopular?`: `boolean` (Optional, default: `false`) - If the plan should be highlighted as popular on the landing page.
*   **Frontend Usage**:
    *   Admin Panel: Billing Management > Plan Configuration (CRUD operations). Admins define and manage these plans.
    *   Public Homepage (`/`): Dynamically displays active pricing plans to prospective users.
    *   Clinician Panel: Subscription management (view current plan, change plan).

#### 2.4.4. Coupon Code (`CouponCode`)
*   **Description & Importance**: Represents promotional codes for discounts on subscriptions. Used for marketing campaigns and incentivizing sign-ups or upgrades.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `code`: `string` (Unique) - The actual coupon code string (e.g., "WELCOME20"). (Required)
    *   `type`: `CouponType` (Enum: 'percentage', 'fixed_amount') - Type of discount. (Required)
    *   `value`: `number` - Discount value (percentage or fixed amount). (Required)
    *   `isActive`: `boolean` - Whether the coupon is currently active. (Required)
    *   `expirationDate?`: `string` (ISO Date string, Optional) - When the coupon expires.
    *   `usageLimit?`: `number` (Optional) - Maximum number of times this coupon can be used overall.
    *   `timesUsed?`: `number` (Optional, default: 0, Derived by backend) - How many times this coupon has been used.
    *   `applicablePlans?`: `string[]` (Optional, FK to `PricingPlan.id[]`) - List of plan IDs this coupon applies to. If empty, applies to all.
*   **Frontend Usage**:
    *   Admin Panel: Billing Management > Coupon Management (CRUD operations).
    *   Signup/Subscription Change Flow: Conceptual input for applying coupon codes (UI for this application step is not fully built out but the data structure supports it).

#### 2.4.5. Payment Verification Request (`PaymentVerificationRequest`)
*   **Description & Importance**: Record of a manual payment submitted by a clinician (e.g., for markets without integrated payment gateways). Essential for the manual payment workflow, allowing admins to approve subscriptions.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `clinicianId`: `string` (FK to `AdminUser.id`) - ID of the clinician who submitted. (Required)
    *   `clinicianName`: `string` - Name of the clinician (Denormalized). (Required)
    *   `clinicianEmail`: `string` - Email of the clinician (Denormalized). (Required)
    *   `requestedPlanId`: `string` (FK to `PricingPlan.id`) - ID of the plan being paid for. (Required)
    *   `requestedPlanName`: `string` - Name of the requested plan (Denormalized). (Required)
    *   `requestedPlanPrice`: `string` - Price of the requested plan (Denormalized). (Required)
    *   `receiptUrl`: `string` (URL) - Link to the uploaded payment receipt. (Required)
    *   `submissionDate`: `string` (ISO Date string) - When the request was submitted. (Required)
    *   `status`: `'pending' | 'approved' | 'rejected'` - Verification status. (Required)
*   **Frontend Usage**:
    *   Admin Panel: Billing Management > Payment Verifications (admins view list, review details, approve/reject requests).
    *   Clinician Panel: Manual payment submission form (clinicians upload receipt and select plan).

#### 2.4.6. Audit Log Entry (`AuditLogEntry`)
*   **Description & Importance**: Records significant administrative actions performed across the platform. Crucial for security, accountability, and tracking changes within the system.
*   **Fields**:
    *   `id`: `string` (Primary Key, Auto-increment or UUID) - Unique identifier. (Required)
    *   `timestamp`: `string` (ISO Date string) - When the action occurred. (Required)
    *   `adminUserId`: `string` (FK to `TeamMember.id`) - ID of the admin who performed the action. (Required)
    *   `adminUserName`: `string` - Name of the admin (Denormalized). (Required)
    *   `action`: `string` - Description of the action (e.g., "Updated Exercise", "Suspended Clinician"). (Required)
    *   `targetEntityType?`: `string` (Optional) - Type of entity affected (e.g., "Exercise", "User").
    *   `targetEntityId?`: `string` (Optional) - ID of the affected entity.
    *   `details?`: `Record<string, any>` (JSON, Optional) - Additional details about the change (e.g., old/new values).
*   **Frontend Usage**:
    *   Admin Panel: Audit Log page (admins view, filter logs). Frontend simulates adding entries when certain admin actions occur.

#### 2.4.7. System Settings (`initialSettings` object in `src/app/admin/settings/page.tsx`)
*   **Description & Importance**: A key-value store (represented as a single object in the prototype) for global platform configurations. Controls various aspects of platform behavior, branding, and integrations.
*   **Fields (Examples from `initialSettings`)**:
    *   `platformName`: `string` - Display name of the platform.
    *   `supportEmail`: `string` - Contact email for support.
    *   `defaultTimezone`: `string` - Default timezone for date/time displays.
    *   `enableAiSuggestions`: `boolean` - Global toggle for AI features.
    *   `logoUrl`: `string` - URL for the platform logo.
    *   `bankAccountName`, `bankName`, `bankAccountNumber`, `bankSwiftBic`, `paymentReferenceInstructions`: Crucial for manual payment display.
    *   `smtpServer`, `smtpPort`, `smtpUsername`, `smtpPassword`: For sending platform emails (simulated).
    *   ... and other settings like `defaultVideoPrivacy`, `allowProgramModRequests`, `enablePatientMessaging`, `enablePatientSelfRegistration`, `newPatientWelcomeMessage`, `notifyClinicianOnFeedback`, `notifyPatientOnProgramAssignment`, `googleAiApiKey`.
*   **Frontend Usage**:
    *   Admin Panel: System Settings page (admins view and modify these settings).
    *   Various Parts of Application: Values from these settings are used throughout the app to configure behavior (e.g., display platform name, control feature availability, provide bank details to clinicians).

### 2.5. Utility Types

#### 2.5.1. Notification Item (`NotificationItem`)
*   **Description & Importance**: Represents a single notification for a user (admin, clinician, or patient). Essential for alerting users to important events, updates, or actions requiring their attention.
*   **Fields**:
    *   `id`: `string` (Primary Key, UUID) - Unique identifier. (Required)
    *   `userId`: `string` (FK to `User.id`) - ID of the user this notification is for. (Required)
    *   `title`: `string` - Notification title. (Required)
    *   `description`: `string` - Detailed message. (Required)
    *   `timestamp`: `string` (ISO Date string) - When the notification was created. (Required)
    *   `isRead`: `boolean` - Read status. (Required, default: `false`)
    *   `link?`: `string` (URL Path, Optional) - Path to navigate to when notification is clicked.
    *   `type`: `'info' | 'warning' | 'success' | 'error' | 'update' | 'payment'` - Type of notification for styling/icon. (Required)
*   **Frontend Usage**:
    *   Displayed in `NotificationBell` component in user layouts (Admin, Clinician, Patient).
    *   Generated by various system actions (e.g., new message received, program assigned, payment approved, support ticket update).

---

## 3. Genkit AI Flow Schemas

These schemas define the expected inputs and outputs for the AI flows managed by Genkit. They use Zod for validation and are critical for the AI-driven features of the platform.

### 3.1. AI Program Builder (`ai-program-builder.ts`)
*   **Importance**: Powers AI-assisted exercise program creation, progression/regression suggestions, and overall program modification advice for clinicians.
*   **Input (`BuildProgramInputSchema`)**:
    *   `patientConditions?`: `z.string()` - Patient's conditions (e.g., "post-ACL surgery") for initial program suggestion.
    *   `exerciseLibrary`: `z.string()` - Semi-colon separated list of available exercise names from the platform library. (Required)
    *   `exerciseToModify?`: `z.string()` - Name of a specific exercise for progression/regression suggestions.
    *   `modificationType?`: `z.enum(['progression', 'regression'])` - Type of modification if `exerciseToModify` is provided.
    *   `existingProgramExercises?`: `z.array(ProgramExerciseSchemaForInput)` (exerciseName, sets, reps, duration) - Current exercises in a program if requesting overall modification.
    *   `newGoalOrFeedback?`: `z.string()` - New goal or patient feedback (e.g., "patient reports knee pain") for program modification.
*   **Output (`BuildProgramOutputSchema`)**:
    *   `suggestedExercises?`: `z.array(z.string())` - List of exercise names for initial program.
    *   `suggestedParameters?`: `z.array(z.string())` - Parameters for initial suggested exercises.
    *   `modifiedExerciseSuggestion?`: Object containing `exerciseToReplace`, `newExerciseName`, `newParameters`, `reason` for single exercise changes.
    *   `overallProgramModificationAdvice?`: `z.string()` - General advice for program changes.
    *   `exerciseSpecificSuggestions?`: Array of objects detailing suggested actions (`keep`, `modify_params`, `replace`, `remove`, `add`) for individual exercises, including reasons and new parameters/names if applicable.

### 3.2. AI Exercise Search (`ai-exercise-search.ts`)
*   **Importance**: Enables clinicians to quickly find relevant exercises using natural language queries instead of manual filtering.
*   **Input (`AiExerciseSearchInputSchema`)**:
    *   `query`: `z.string()` - Natural language search query (e.g., "exercises for rotator cuff rehab"). (Required)
*   **Output (`AiExerciseSearchOutputSchema`)**:
    *   `results`: `z.array(z.string())` - List of matching exercise names from the library.

### 3.3. AI Driven Feedback Validation (`ai-driven-validation.ts`)
*   **Importance**: Helps ensure clinicians receive meaningful and actionable feedback from patients by prompting patients for more details if their initial feedback is vague but pain levels are high.
*   **Input (`ValidateFeedbackInputSchema`)**:
    *   `exerciseName`: `z.string()` - Name of the exercise. (Required)
    *   `painLevel`: `z.number().min(1).max(10)` - Pain level (1-10). (Required)
    *   `comments?`: `z.string()` - Patient's textual comments.
*   **Output (`ValidateFeedbackOutputSchema`)**:
    *   `isValid`: `z.boolean()` - Whether feedback is considered sufficiently detailed/meaningful.
    *   `suggestions?`: `z.string()` - Suggestions for the patient to improve their feedback if `isValid` is false.

### 3.4. AI Email Generator (`ai-email-generator.ts`)
*   **Importance**: Assists admins in drafting professional and engaging emails for platform communications, saving time and ensuring consistency.
*   **Input (`AiEmailGeneratorInputSchema`)**:
    *   `prompt`: `z.string()` - User's instruction/topic for the email (e.g., "Draft a welcome email for new clinicians"). (Required)
    *   `subject?`: `z.string()` - Optional subject line for context.
    *   `recipientContext?`: `z.string()` - Optional context about recipients.
*   **Output (`AiEmailGeneratorOutputSchema`)**:
    *   `generatedEmailBody`: `z.string()` - AI-generated email body.
    *   `suggestedSubject?`: `z.string()` - Optional AI-suggested subject line.

### 3.5. AI Patient Motivator (`ai-patient-motivator.ts`)
*   **Importance**: Aims to enhance patient engagement and adherence by providing personalized motivational messages on their dashboard.
*   **Input (`AiPatientMotivationInputSchema`)**:
    *   `patientName`: `z.string()` - Patient's first name. (Required)
    *   `currentProgramName?`: `z.string()` - Name of their current program.
    *   `currentProgramAdherence?`: `z.number().min(0).max(100)` - Current program adherence percentage.
    *   `workoutStreak?`: `z.number().min(0)` - Current workout streak in days.
    *   `completedExercisesToday?`: `z.boolean()` - Whether exercises for the day are done.
    *   `upcomingDifficultExercise?`: `z.string()` - Name of a challenging upcoming exercise.
    *   `recentFeedbackPainLevel?`: `z.number().min(1).max(10)` - Pain level from recent feedback.
*   **Output (`AiPatientMotivationOutputSchema`)**:
    *   `motivationalMessage`: `z.string()` - Personalized motivational message (1-2 sentences).

---

## 4. Frontend Data Interaction & State Management

*   **State Management**: Primarily uses React's built-in hooks (`useState`, `useEffect`) for local component state. Mock data arrays (e.g., `initialMockUsers`, `mockEducationalResources`, `mockTickets`) are directly imported and modified in page components to simulate backend data persistence. Changes to these arrays are often propagated by creating new array references (e.g., `array = [...array]`) before calling a `setState` function (or by relying on the array's `length` property changing in dependency arrays for `useEffect`).
*   **Data Fetching/Updating (Simulated)**: As this is a frontend prototype, "API calls" are simulated with `setTimeout` or direct manipulation of these global/page-level mock data arrays. Functions like `addMockUser`, `updateMockExercise` centralize these mock mutations.
*   **Forms**: React Hook Form (`useForm`) is extensively used for managing form state, validation, and submission across admin, clinician, and patient panels.
*   **Validation**: Zod (`zod`) is used to define schemas for form validation (via `zodResolver`) and also rigorously defines the input/output structures for all Genkit AI flows.
*   **Component Data Flow**: Data is passed down from page components to child components via props. Callbacks (e.g., `onSave`, `onDelete`) are used for child-to-parent communication to trigger data modifications in the mock stores.
*   **Dynamic Data Binding**: Input fields in forms are bound to React Hook Form state. Display components render data from state variables, which are initialized or updated from mock data sources or AI flow outputs.

---

## 5. Key Enums & Constants

(As defined in `src/lib/types.ts` and used throughout the application for consistency)

*   **`UserRole`**: Combination of `ProfessionalRole` and `SystemRole`. Defines a user's primary function.
*   **`ProfessionalRole`**: Specific roles for clinicians (e.g., `'Physiotherapist'`, `'Doctor'`).
*   **`SystemRole`**: Roles for platform administrators and patients (e.g., `'Admin'`, `'Patient'`, `'Content Reviewer'`).
*   **`UserStatus`**: Account status (e.g., `'active'`, `'pending_invitation'`, `'suspended'`).
*   **`SubscriptionStatus`**: Clinician subscription status (e.g., `'active'`, `'trial'`, `'pending_payment'`).
*   **`ExerciseStatus`**: Status of exercises in the library (e.g., `'active'`, `'pending'`, `'rejected'`).
*   **`ProgramStatus`**: Status of exercise programs (e.g., `'draft'`, `'active'`, `'template'`).
*   **`AppointmentStatus`**: Status of appointments (e.g., `'scheduled'`, `'completed'`, `'cancelled'`).
*   **`AnnouncementTarget`**: Audience for platform announcements (e.g., `'all'`, `'clinicians'`).
*   **`TicketStatus`**: Status of support tickets (e.g., `'open'`, `'in_progress'`).
*   **`CouponType`**: Type of discount for coupons (e.g., `'percentage'`, `'fixed_amount'`).
*   **`EducationalResourceType`**: Type of educational content (e.g., `'article'`, `'video'`).
*   **`NotificationType`**: Type of user notification for UI distinction (e.g., `'info'`, `'warning'`, `'success'`).
*   **`PaymentVerificationStatus`**: Status for manual payment verification requests (e.g., `'pending'`, `'approved'`).

---

## 6. Conceptual Database Design Notes (Relational Example - PostgreSQL)

This section provides high-level considerations for designing a backend database based on the entities defined.

*   **Users Table (`users`)**:
    *   A central `users` table for common fields: `id` (PK, UUID), `name` (VARCHAR), `email` (VARCHAR, UNIQUE), `hashed_password` (VARCHAR), `role` (VARCHAR, referencing `UserRole` enum values), `avatar_url` (VARCHAR, nullable), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
    *   Consider separate profile tables for role-specific attributes, linked by `user_id` (FK to `users.id`):
        *   `clinician_profiles`: `user_id` (PK, FK), `status` (VARCHAR), `whatsapp_number` (VARCHAR, nullable), `specialization` (VARCHAR, nullable), `current_plan_id` (VARCHAR, FK to `pricing_plans.id`, nullable), `subscription_status` (VARCHAR, nullable), `payment_receipt_url` (VARCHAR, nullable), `requested_plan_id` (VARCHAR, nullable), `city` (VARCHAR, nullable), `joined_date` (DATE), `last_login` (TIMESTAMPTZ, nullable).
        *   `patient_profiles`: `user_id` (PK, FK), `date_of_birth` (DATE, nullable), `gender` (VARCHAR, nullable), `phone` (VARCHAR, nullable), `whatsapp_number` (VARCHAR, nullable), `address` (TEXT, nullable), `conditions` (TEXT[], nullable), `medical_notes` (TEXT, nullable), `current_program_id` (UUID, FK to `programs.id`, nullable), `assigned_clinician_id` (UUID, FK to `users.id` where role is clinician, nullable), `last_activity` (TIMESTAMPTZ, nullable), `overall_adherence` (INTEGER, nullable).
        *   `team_member_profiles`: `user_id` (PK, FK), `status` (VARCHAR), `system_role` (VARCHAR, overriding `users.role`), `invited_by_admin_id` (UUID, FK to `users.id`, nullable), `last_invitation_sent_at` (TIMESTAMPTZ, nullable), `joined_date` (DATE), `last_login` (TIMESTAMPTZ, nullable).
    *   Index `email` (unique). Index `role`.
*   **Exercises Table (`exercises`)**:
    *   Fields as per `Exercise` entity. `id` (PK, UUID), `name` (VARCHAR, UNIQUE), `description` (TEXT), `video_url` (VARCHAR, nullable), `thumbnail_url` (VARCHAR, nullable), `category` (VARCHAR), `body_parts` (TEXT[]), `equipment` (VARCHAR, nullable), `difficulty` (VARCHAR), `precautions` (TEXT, nullable), `status` (VARCHAR), `is_featured` (BOOLEAN), `default_reps` (VARCHAR, nullable), `default_sets` (VARCHAR, nullable), `default_hold` (VARCHAR, nullable), `created_at`, `updated_at`.
    *   Index `name`, `category`, `status`, `difficulty`. Consider GIN index for `body_parts` if array operations are common.
*   **Programs Table (`programs`)**:
    *   Fields as per `Program` entity. `id` (PK, UUID), `name` (VARCHAR), `patient_id` (UUID, FK to `users.id` where role is patient, nullable), `clinician_id` (UUID, FK to `users.id` where role is clinician, nullable), `status` (VARCHAR), `description` (TEXT, nullable), `is_template` (BOOLEAN, default: false), `category` (VARCHAR, nullable, for templates), `assigned_date` (DATE, nullable), `completion_date` (DATE, nullable), `adherence_rate` (INTEGER, nullable), `created_at`, `updated_at`.
    *   Index `patient_id`, `clinician_id`, `status`, `is_template`.
*   **Program Exercises Table (`program_exercises`)**:
    *   To handle the many-to-many relationship between Programs and Exercises with specific parameters.
    *   `id` (PK, UUID or SERIAL), `program_id` (UUID, FK to `programs.id`), `exercise_id` (UUID, FK to `exercises.id`), `sets` (VARCHAR, nullable), `reps` (VARCHAR, nullable), `duration` (VARCHAR, nullable), `rest` (VARCHAR, nullable), `notes` (TEXT, nullable), `order_in_program` (INTEGER, nullable, for exercise sequence).
    *   Index `program_id`, `exercise_id`.
*   **Program Exercise Feedback Table (`program_exercise_feedback`)**:
    *   `id` (PK, UUID or SERIAL), `program_exercise_id` (UUID/INT, FK to `program_exercises.id`), `patient_id` (UUID, FK to `users.id`), `timestamp` (TIMESTAMPTZ), `pain_level` (INTEGER), `comments` (TEXT), `acknowledged_by_clinician` (BOOLEAN, default: false).
    *   Index `program_exercise_id`, `patient_id`.
*   **Appointments Table (`appointments`)**:
    *   Fields as per `Appointment` entity. `id` (PK, UUID), `patient_id` (UUID, FK to `users.id`), `clinician_id` (UUID, FK to `users.id`), `start_time` (TIMESTAMPTZ), `end_time` (TIMESTAMPTZ), `title` (VARCHAR, nullable), `status` (VARCHAR), `type` (VARCHAR, nullable), `notes` (TEXT, nullable), `city` (VARCHAR, nullable), `created_at`, `updated_at`.
    *   Index `patient_id`, `clinician_id`, `start_time`.
*   **Messages Table (`messages`)**:
    *   Fields as per `Message` entity. `id` (PK, UUID), `sender_id` (UUID, FK to `users.id`), `receiver_id` (UUID, FK to `users.id`), `content` (TEXT), `timestamp` (TIMESTAMPTZ), `attachment_url` (VARCHAR, nullable), `is_read` (BOOLEAN, default: false).
    *   Index on `(sender_id, receiver_id, timestamp)` and `(receiver_id, sender_id, timestamp)`.
*   **Other Entities**: Most other entities (`PricingPlans`, `CouponCodes`, `PlatformAnnouncements`, `SupportTickets`, `EducationalResources`, `PaymentVerificationRequests`, `AuditLogEntries`, `NotificationItems`) can be mapped directly to tables with their respective fields. `SystemSettings` might be a key-value table or a table with a single row holding JSONB data.
*   **Indexing**: Apply indexes on foreign keys, status fields, timestamps used for sorting/filtering, and any fields frequently used in `WHERE` clauses.

---

## 7. Conceptual Firestore Security Rules (Example - Refined)

If Firestore were used, a model with a primary `users` collection and separate top-level profile collections is common for managing distinct role-specific data while maintaining clear security rules.

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to get user's role from their main user document
    function getUserRole(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data.role;
    }

    // Helper function to check if the authenticated user has a specific role listed in an array
    function hasAnyRole(allowedRoles) {
      return isAuthenticated() && getUserRole(request.auth.uid) in allowedRoles;
    }

    // Specific role checks
    function isPatient() { return isAuthenticated() && getUserRole(request.auth.uid) == 'Patient'; }
    function isProfessional() {
      return isAuthenticated() && 
             ['Physiotherapist', 'Doctor', 'Chiropractor', 'Exercise Rehabilitation Instructor', 'Nurse', 'Nutritionist', 'Osteopath', 'Personal Trainer', 'Pilates Instructor', 'Podiatrist', 'Researcher', 'S&C Coach', 'Sport Massage Therapist', 'Sports Scientist', 'Sports Therapist', 'Surgeon'].includes(getUserRole(request.auth.uid));
    }
    function isAdminTeamMember() { // Broader check for any admin panel access
      return isAuthenticated() &&
             ['Admin', 'Content Reviewer', 'Moderator', 'Finance Admin'].includes(getUserRole(request.auth.uid));
    }
    function isPlatformAdmin() { // Top-level admin
      return isAuthenticated() && getUserRole(request.auth.uid) == 'Admin';
    }
    function isContentReviewer() {
        return isAuthenticated() && getUserRole(request.auth.uid) == 'Content Reviewer';
    }
    function isFinanceAdmin() {
        return isAuthenticated() && getUserRole(request.auth.uid) == 'Finance Admin';
    }


    // User Collection (Core user data)
    match /users/{userId} {
      allow read: if isAuthenticated(); // Any authenticated user can read basic profiles (e.g., for display names)
      allow create: if true; // Allows public signup for all roles initially, backend validates role assignment.
      allow update: if request.auth.uid == userId || isPlatformAdmin(); // User can update own, Admin can update any.
      allow delete: if isPlatformAdmin(); // Only Platform Admin can delete user records.
    }

    // Clinician Profiles (Linked to users collection by userId)
    match /clinicianProfiles/{userId} {
      allow read: if isAuthenticated(); // Similar to users, for profile display
      allow create: if isPlatformAdmin(); // Admins create clinician profiles after user creation.
      allow update: if request.auth.uid == userId || isPlatformAdmin(); // Clinician updates own profile, or Admin updates.
      allow delete: if isPlatformAdmin();
    }

    // Patient Profiles (Linked to users collection by userId)
    match /patientProfiles/{userId} {
      allow read: if request.auth.uid == userId || 
                     (isProfessional() && resource.data.assignedClinicianId == request.auth.uid) || // Assigned clinician
                     isAdminTeamMember(); // Admin team can view
      allow create: if isProfessional() || isPlatformAdmin(); // Clinicians or Admins create patients.
      allow update: if request.auth.uid == userId ||
                     (isProfessional() && resource.data.assignedClinicianId == request.auth.uid) ||
                     isPlatformAdmin(); // Own, assigned clinician, or Admin.
      allow delete: if isPlatformAdmin() || (isProfessional() && resource.data.assignedClinicianId == request.auth.uid); // Admin or assigned clinician (archive usually)
    }

    // Team Member Profiles (Linked to users collection by userId)
    match /teamMemberProfiles/{userId} {
      allow read, update: if isPlatformAdmin(); // Only Platform Admins manage team member profiles
      allow create: if isPlatformAdmin(); // Invitations handled by Platform Admins
      allow delete: if isPlatformAdmin();
    }

    // Exercises Collection
    match /exercises/{exerciseId} {
      allow read: if isAuthenticated(); // All authenticated users (clinicians, patients viewing programs) can read active exercises.
      // Create, Update, Delete restricted to Admins or Content Reviewers
      allow create, update, delete: if isPlatformAdmin() || isContentReviewer();
    }

    // Programs Collection (includes Templates and Patient-Assigned Programs)
    match /programs/{programId} {
      allow read: if isAuthenticated() && 
                     (resource.data.isTemplate == true || // All authenticated users can read active templates
                      resource.data.patientId == request.auth.uid ||  // Assigned patient
                      resource.data.clinicianId == request.auth.uid || // Assigned clinician
                      isAdminTeamMember()); // Admin team can read all
      allow create: if isProfessional() || isPlatformAdmin() || isContentReviewer(); // Clinicians create for patients, Admins/ContentReviewers for templates.
      allow update, delete: if (isProfessional() && resource.data.clinicianId == request.auth.uid) || // Clinician manages own programs/templates
                            isPlatformAdmin() || isContentReviewer(); // Admins/ContentReviewers manage templates.
    }
    
    // ProgramExerciseFeedback (sub-collection or related structure needed)
    // Assuming a path like /programs/{programId}/programExercises/{programExerciseId}/feedback/{feedbackId}
    // This would require more granular rules based on program assignment.

    // Appointments Collection
    match /appointments/{appointmentId} {
        allow read: if isAuthenticated() && 
                       (resource.data.patientId == request.auth.uid ||
                        resource.data.clinicianId == request.auth.uid ||
                        isAdminTeamMember());
        allow create: if isProfessional(); // Clinicians create appointments.
        // Patient cancellation is disabled in UI. Updates by clinician or admin.
        allow update: if (isProfessional() && resource.data.clinicianId == request.auth.uid) || isPlatformAdmin(); 
        allow delete: if (isProfessional() && resource.data.clinicianId == request.auth.uid) || isPlatformAdmin();
    }
    
    // Messages (Often implemented with more complex rules, e.g., per-conversation document)
    // Example for a direct message structure: /conversations/{conversationId}/messages/{messageId}
    match /messages/{messageId} { // Simplified for direct messages collection
        allow read: if isAuthenticated() && (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid);
        allow create: if isAuthenticated() && request.resource.data.senderId == request.auth.uid; // Can only send as self
        allow update, delete: if isAuthenticated() && resource.data.senderId == request.auth.uid; // Can only modify own messages
    }

    // Platform-wide data (e.g., Public Pricing Plans, Published Educational Resources)
    match /pricingPlans/{planId} {
        allow read: if true; // Publicly readable for landing page
        allow write: if isPlatformAdmin() || isFinanceAdmin();
    }
    match /educationalResources/{resourceId} {
        // Published resources are public; drafts/archived only by admins/content reviewers
        allow read: if resource.data.status == 'published' || isPlatformAdmin() || isContentReviewer(); 
        allow write: if isPlatformAdmin() || isContentReviewer();
    }

    // Admin-only sections
    match /systemSettings/{settingId} { allow read, write: if isPlatformAdmin(); }
    match /auditLog/{logId} { allow read: if isPlatformAdmin(); allow create: if isAdminTeamMember(); /* Backend service would create entries */ }
    match /supportTickets/{ticketId} { 
        allow read: if isAdminTeamMember() || (isAuthenticated() && resource.data.userId == request.auth.uid); // Admin or own ticket
        allow create: if isAuthenticated(); // Any user can create
        allow update: if isAdminTeamMember(); // Only admins update (status, assignment)
    }
    match /couponCodes/{couponId} { allow read, write: if isPlatformAdmin() || isFinanceAdmin(); }
    match /paymentVerificationRequests/{reqId} { allow read, write: if isPlatformAdmin() || isFinanceAdmin(); }
    match /platformAnnouncements/{annId} { allow read, write: if isPlatformAdmin(); }
    // ... other admin collections
  }
}
```

This conceptual Firestore ruleset is more aligned with a user-centric data model where roles dictate access to linked profile information and other collections. It needs careful validation and testing in a real Firestore setup.

---

This schema document should provide a robust and comprehensive foundation for understanding the TheraGenius platform's data architecture and interactions. It should be treated as a living document and updated as the platform evolves.

    