
# Firebase Studio - PhysioPro (AI Exercise Prescription Software)

This is a NextJS starter for an AI-Driven Exercise Prescription Software called PhysioPro, built in Firebase Studio.

To get started, explore the application structure, particularly within the `src/app` directory for different user roles (admin, clinician, patient) and the `src/ai/flows` for Genkit AI integrations.

## Frontend Prototype Review (Summary)

The current frontend admin and clinician panels serve as strong prototypes. Most UI components, forms, and data structures defined in `src/lib/types.ts` are well-suited for integration with a backend. Client-side mock data and simulated actions (like saving or deleting) generally map logically to standard backend API operations. The main tasks for backend development involve creating the necessary APIs, database schemas, business logic for each feature, and robust security measures (auth, RBAC).

## Backend Creation Guide for PhysioPro

This guide outlines the necessary steps and considerations for creating a backend compatible with the PhysioPro frontend application. It is intended to be used by an AI or a development team.

### 1. General Backend Principles

*   **Technology Stack**:
    *   **Recommended**: Node.js with Express.js or NestJS. These are commonly used with Next.js frontends.
    *   **Database**: PostgreSQL (for relational data integrity) or MongoDB (for flexibility). Firebase Firestore could also be an option if leaning into the Firebase ecosystem.
    *   **API Design**: RESTful API design is recommended for clarity and standard practices.
*   **Authentication & Authorization**:
    *   **Authentication**: Implement JWT (JSON Web Tokens) for stateless authentication for all user roles (Admin, Clinician, Patient).
    *   **Authorization**: Robust Role-Based Access Control (RBAC) is critical. User roles are defined in `src/lib/types.ts`. The backend must validate roles for every sensitive operation.
*   **Business Logic**:
    *   Complex business rules should reside in the backend to ensure consistency and security. Examples include:
        *   Ensuring a patient can only be assigned to one active exercise program at a time.
        *   Validating coupon codes against applicable plans and usage limits.
        *   Calculating adherence rates based on patient activity.
        *   Enforcing rules around appointment scheduling (e.g., preventing double-booking, minimum notice for cancellations).
        *   Logic for escalating support tickets or triggering notifications based on specific events.
*   **Error Handling**: Consistent error response format (e.g., `{ "status": "error", "message": "...", "details": {} }`).
*   **Logging**: Comprehensive logging for debugging and auditing (especially admin actions).
*   **Environment Variables**: Use `.env` files for configuration (database URIs, API keys, JWT secrets, etc.). **Never commit `.env` files to version control.**
*   **Security**:
    *   Input validation for all API requests.
    *   Protection against common web vulnerabilities (OWASP Top 10).
    *   HTTPS for all communication.
    *   Data encryption at rest and in transit where appropriate (e.g., patient health information).

### 2. Core Data Models & Database Schema

Define database schemas based on the interfaces in `src/lib/types.ts`. Key entities include:

*   **Users**: Store `AdminUser` (for clinicians), `TeamMember` (for internal admins), and `Patient` users. Include fields for:
    *   `id` (Primary Key, UUID)
    *   `name`, `email` (unique), `password` (hashed), `role` (`UserRole`), `status` (`UserStatus`)
    *   `avatarUrl`, `whatsappNumber` (optional for clinicians)
    *   `dateOfBirth`, `gender`, `phone`, `address` (for patients)
    *   `joinedDate`, `lastLogin`
    *   For clinicians (`AdminUser`): `patientCount`, `appointmentCount`, `specialization`, `currentPlanId`. (Counts might be derived).
    *   For `TeamMember`: role should be `SystemRole`, `invitedByAdminId`, `invitedByAdminName`, `lastInvitationSentAt`.
    *   For `Patient`: `conditions` (array of strings), `medicalNotes`, `assignedClinicianId` (FK to Users), `currentProgramId`, `lastActivity`, `overallAdherence`.
*   **Exercises**:
    *   `id` (PK, UUID)
    *   `name`, `description`, `videoUrl`, `thumbnailUrl`, `category`, `bodyParts` (array of strings), `equipment`, `difficulty`, `precautions`, `status` (`ExerciseStatus`), `isFeatured`, `defaultSets`, `defaultReps`, `defaultHold`.
    *   Timestamps: `createdAt`, `updatedAt`.
*   **Programs (including Templates)**:
    *   `id` (PK, UUID)
    *   `name`, `description`, `patientId` (FK to Users, optional), `clinicianId` (FK to Users)
    *   `exercises`: Array of objects (see `ProgramExercise` in `types.ts` - store `exerciseId` (FK), `sets`, `reps`, `duration`, `rest`, `notes`, `feedbackHistory` (array of feedback objects with timestamp, painLevel, comments, `acknowledgedByClinician`)).
    *   `isTemplate` (boolean), `category` (for templates), `status` (`ProgramStatus` - draft, active, archived, template, completed)
    *   `assignedDate`, `completionDate`, `adherenceRate` (for patient-assigned programs).
    *   Timestamps: `createdAt`, `updatedAt`.
*   **Appointments**:
    *   `id` (PK, UUID)
    *   `patientId` (FK to Users), `clinicianId` (FK to Users), `clinicianName`
    *   `start` (datetime), `end` (datetime), `title`, `status` (`AppointmentStatus`), `type` (e.g., 'Initial Consultation'), `notes` (clinician notes), `patientNotes`.
    *   Timestamps: `createdAt`, `updatedAt`.
*   **Messages**: (For clinician-patient messaging)
    *   `id` (PK, UUID)
    *   `senderId` (FK to Users), `receiverId` (FK to Users)
    *   `content` (text), `timestamp` (datetime), `attachmentUrl` (optional)
    *   `isRead` (boolean)
*   **PlatformAnnouncements**:
    *   `id` (PK, UUID)
    *   `title`, `content`, `targetAudience` (`AnnouncementTarget`), `status`
    *   Timestamps: `createdAt`, `publishedAt`.
*   **SupportTickets**:
    *   `id` (PK, UUID)
    *   `userId` (FK to Users), `userName`, `userEmail`, `subject`, `description`, `status` (`TicketStatus`), `priority`, `assignedToAdminId` (FK to TeamMember, optional), `assignedToAdminName` (string, optional)
    *   `internalNotes`: Array of objects (each with `adminId`, `adminName`, `note`, `timestamp`)
    *   Timestamps: `createdAt`, `updatedAt`.
*   **PricingPlans**: (Based on `PricingPlan` in `types.ts`)
    *   `id` (PK, string - e.g., `plan_pro_monthly`), `name`, `price` (string), `frequency`, `features` (array of strings), `description`, `isActive`, `ctaText`, `isPopular`.
*   **CouponCodes**:
    *   `id` (PK, UUID), `code` (unique), `type` (`CouponType`), `value` (numeric), `isActive`, `expirationDate`, `usageLimit`, `timesUsed`, `applicablePlans` (array of plan IDs).
*   **AuditLogEntries**:
    *   `id` (PK, Auto-increment or UUID)
    *   `timestamp` (datetime), `adminUserId` (FK to TeamMember), `adminUserName` (string), `action`, `targetEntityType`, `targetEntityId`, `details` (JSON or text).
*   **SystemSettings**:
    *   A key-value store or a single document/row for all platform settings (platformName, supportEmail, SMTP details, feature toggles, API keys etc.). **Sensitive keys (like SMTP passwords, Google AI API Key) MUST be stored securely and only accessed by the backend.**
*   **EducationalResources**:
    *   `id` (PK, UUID), `title`, `type` ('article' | 'video'), `summary`, `content` (text, for articles), `contentUrl` (for videos/external), `thumbnailUrl` (optional), `tags` (array of strings), `estimatedReadTime` (string), `status` ('draft' | 'published' | 'archived'), `createdAt` (datetime), `updatedAt` (datetime).
*   **NotificationItems**:
    *   `id` (PK, UUID), `userId` (FK to Users), `title`, `description`, `timestamp`, `isRead`, `link` (optional), `type`.

### 3. API Endpoint Specifications - Admin Panel (`/api/v1/admin/...`)

All endpoints should be prefixed, e.g., `/api/v1/admin/...`. Implement robust input validation for all request bodies and parameters. Ensure RBAC is applied to each endpoint (only users with appropriate `SystemRole` like 'Admin', 'Finance Admin', etc., can access).

**3.1. Admin Authentication & Account Management**
*   `POST /auth/admin/login`: { email, password } -> { token, userDetails (TeamMember) }
*   `POST /auth/admin/logout`: (Invalidate token if using server-side session, or client handles token removal)
*   `GET /auth/admin/me`: (Requires token) -> { userDetails (TeamMember) }
*   `PUT /auth/admin/profile`: (Requires token) Update authenticated admin's profile.
    *   Body: `{ name: string, email: string }`
    *   Response: Updated `TeamMember` object.
*   `POST /auth/admin/password`: (Requires token) Change authenticated admin's password.
    *   Body: `{ currentPassword: string, newPassword: string }`
    *   Response: Success/failure message.

**3.2. Clinician Management (`/admin/users`)**
*   `GET /users/clinicians`: List clinicians.
    *   Query Params: `page`, `limit`, `searchTerm`, `statusFilter`, `sortBy` (`nameAsc`, `nameDesc`, `joinedDateAsc`, `joinedDateDesc`).
    *   Response: `{ clinicians: AdminUser[], total: number }`.
*   `POST /users/clinicians`: Add a new clinician.
    *   Body: `{ name: string, email: string, role: ProfessionalRole, specialization?: string, status: UserStatus, whatsappNumber?: string }`. (Based on `NewClinicianFormValues` from `src/app/admin/users/new/page.tsx`)
    *   Response: Created `AdminUser` object. (Simulate sending welcome email with initial password/setup link).
*   `GET /users/clinicians/:id`: Get clinician details.
    *   Response: `AdminUser` object.
*   `PUT /users/clinicians/:id`: Update clinician details.
    *   Body: `{ name: string, email: string, role: ProfessionalRole, specialization?: string, status: UserStatus, whatsappNumber?: string }`. (Based on `EditUserFormValues` from `src/app/admin/users/[userId]/edit/page.tsx`)
    *   Response: Updated `AdminUser` object.
*   `DELETE /users/clinicians/:id`: Delete a clinician.
*   `POST /users/clinicians/bulk-action`:
    *   Body: `{ action: 'suspend' | 'delete' | 'export', ids: string[] }`.
    *   Response: Success/failure message. For 'export', initiate CSV generation (data like: ID, Name, Email, Role, Specialization, Status, Joined Date, Patient Count, Appointment Count, WhatsApp Number, Current Plan ID).
*   `GET /users/clinicians/export-csv`: (Alternative to bulk action) Generate and download CSV of all (or filtered) clinicians.

**3.3. Team Management (`/admin/team`)** (Requires 'Admin' SystemRole)
*   `GET /team-members`: List internal admin team members.
    *   Query Params: `page`, `limit`, `searchTerm`, `roleFilter`, `statusFilter`.
    *   Response: `{ teamMembers: TeamMember[], total: number }`.
*   `POST /team-members/invite`: Invite a new team member.
    *   Body: `{ name: string, email: string, role: SystemRole }`. (Based on `NewTeamMemberFormValues` from `src/app/admin/team/new/page.tsx`)
    *   Response: Success message. (Simulate sending invitation email, set status to `pending_invitation`, log `invitedByAdminId`, `invitedByAdminName`, `lastInvitationSentAt`).
*   `GET /team-members/:id`: Get team member details.
    *   Response: `TeamMember` object.
*   `PUT /team-members/:id`: Update team member (role, status). Name and email are typically not editable by other admins through this route after creation.
    *   Body: `{ role: SystemRole, status: UserStatus }`. (Based on editable fields in `EditTeamMemberFormValues` from `src/app/admin/team/[memberId]/edit/page.tsx`).
    *   Response: Updated `TeamMember` object. (Log this action).
*   `DELETE /team-members/:id`: Delete a team member. (Log this action).
*   `POST /team-members/:id/resend-invite`: Resend invitation email. (Update `lastInvitationSentAt`, log this action).

**3.4. Exercise Management (`/admin/exercises`)** (Requires 'Admin' or 'Content Reviewer' SystemRole)
*   `GET /exercises`: List exercises (also used by clinicians, but admin has full CRUD).
    *   Query Params: `page`, `limit`, `searchTerm`, `categoryFilter`, `difficultyFilter`, `statusFilter`.
    *   Response: `{ exercises: Exercise[], total: number }`.
*   `POST /exercises`: Create a new exercise.
    *   Body: `{ name: string, description: string, category: string, difficulty: 'Beginner' | 'Intermediate' | 'Advanced', bodyParts: string[], equipment?: string, videoUrl?: string, thumbnailUrl?: string, precautions?: string, status: ExerciseStatus, isFeatured?: boolean, defaultSets?: string, defaultReps?: string, defaultHold?: string }`. (Based on `NewExerciseFormValues` from `src/app/admin/exercises/new/page.tsx`)
    *   Response: Created `Exercise` object.
*   `GET /exercises/:id`: Get exercise details.
*   `PUT /exercises/:id`: Update exercise details.
    *   Body: (Same as POST body). (Based on `EditExerciseFormValues` from `src/app/admin/exercises/[exerciseId]/edit/page.tsx`)
*   `DELETE /exercises/:id`: Delete an exercise.
*   `PATCH /exercises/:id/status`: Update exercise status (active, pending, rejected).
    *   Body: `{ status: ExerciseStatus }`.
*   `PATCH /exercises/:id/feature`: Toggle `isFeatured` status.
    *   Body: `{ isFeatured: boolean }`.
*   `POST /exercises/import-csv`: Upload and process CSV for bulk exercise import.
    *   Requires multipart/form-data.
*   `GET /exercises/export-csv`: Generate and download CSV of exercises (all or filtered).

**3.5. Program Template Management (`/admin/program-templates`)** (Requires 'Admin' or 'Content Reviewer' SystemRole)
*   `GET /program-templates`: List templates.
    *   Query Params: `page`, `limit`, `searchTerm`.
    *   Response: `{ templates: Program[], total: number }`.
*   `POST /program-templates`: Create a new template.
    *   Body: `{ name: string, description?: string, category?: string, status: 'draft' | 'active' | 'archived' | 'template', exercises: Array<{ exerciseId: string, sets?: string | number, reps?: string | number, duration?: string, rest?: string, notes?: string }> }`. (Based on `NewTemplateFormValues` from `src/app/admin/program-templates/new/page.tsx`)
    *   Response: Created `Program` object (with `isTemplate: true`).
*   `GET /program-templates/:id`: Get template details.
*   `PUT /program-templates/:id`: Update template details.
    *   Body: (Same as POST body). (Based on `EditTemplateFormValues` from `src/app/admin/program-templates/[templateId]/edit/page.tsx`)
*   `DELETE /program-templates/:id`: Delete a template.

**3.6. Platform Analytics (`/admin/analytics`)** (Requires 'Admin' or 'Finance Admin' SystemRole for financial data)
*   `GET /analytics/summary`: Key metrics (total users, active clinicians, programs created, exercises).
*   `GET /analytics/mrr`: Data for Monthly Recurring Revenue chart.
*   `GET /analytics/platform-usage`: Data for active users & programs created chart.
*   `GET /analytics/exercise-popularity`: Data for exercise popularity chart.
*   `GET /analytics/active-clinicians`: Data for most active clinicians table.
*   `GET /analytics/program-creation-trends`: Data for program creation line chart.
*   `GET /analytics/patient-engagement`: Data for patient engagement overview.
*   `GET /analytics/ai-insights`: (Optional) Endpoint to fetch pre-generated AI insights or trigger on-demand analysis.
*   `GET /analytics/export/patient-adherence`: (Placeholder) CSV export of patient adherence data across platform (admin view).
*   `GET /analytics/export/platform-usage`: (Placeholder) CSV export of key platform usage metrics.

**3.7. Billing Management (`/admin/billing`)** (Requires 'Finance Admin' or 'Admin' SystemRole)
*   **Pricing Plans**:
    *   `GET /billing/plans`: List all pricing plans.
    *   `POST /billing/plans`: Create a new plan.
    *   `PUT /billing/plans/:id`: Update a plan.
    *   `DELETE /billing/plans/:id`: Delete a plan (consider soft delete or archiving if subscriptions exist).
*   **Coupons**:
    *   `GET /billing/coupons`: List coupons.
    *   `POST /billing/coupons`: Create a coupon.
    *   `PUT /billing/coupons/:id`: Update a coupon.
    *   `DELETE /billing/coupons/:id`: Delete a coupon.
*   **Subscriptions & Invoices**:
    *   These will heavily rely on the chosen payment provider (e.g., Stripe).
    *   `GET /billing/subscriptions`: List active subscriptions (data likely fetched/synced from payment provider).
    *   `GET /billing/invoices`: List invoices.
    *   Endpoints for admin actions like cancelling a subscription or refunding an invoice (these would call the payment provider's API).

**3.8. Communication (`/admin/communication`)** (Requires 'Admin' SystemRole)
*   **AI Email Composer**:
    *   The `generateEmailBody` Genkit flow is server-side. An API endpoint `POST /communication/generate-email` could wrap this.
    *   Body: `{ prompt: string, subject?: string, recipientContext?: string }`
    *   Response: `{ generatedEmailBody: string, suggestedSubject?: string }`
*   `POST /communication/send-email`:
    *   Body: `{ recipients: string[], subject: string, body: string }`.
    *   Backend uses configured SMTP settings or an email service API to send.
*   **Platform Announcements**:
    *   `GET /announcements`: List announcements.
    *   `POST /announcements`: Create an announcement.
    *   `PUT /announcements/:id`: Update an announcement.
    *   `DELETE /announcements/:id`: Delete an announcement.

**3.9. Educational Resource Management (`/admin/content/education`)** (Requires 'Admin' or 'Content Reviewer' SystemRole)
*   `GET /education/resources`: List all educational resources.
    *   Query Params: `page`, `limit`, `searchTerm`, `typeFilter`, `statusFilter`.
    *   Response: `{ resources: EducationalResource[], total: number }`.
*   `POST /education/resources`: Create a new educational resource.
    *   Body: `{ title: string, type: 'article' | 'video', summary: string, content?: string, contentUrl?: string, thumbnailUrl?: string, tags?: string[], estimatedReadTime?: string, status: 'draft' | 'published' | 'archived' }`.
    *   Response: Created `EducationalResource` object.
*   `GET /education/resources/:id`: Get details of a specific resource.
    *   Response: `EducationalResource` object.
*   `PUT /education/resources/:id`: Update an existing resource.
    *   Body: (Same as POST body).
    *   Response: Updated `EducationalResource` object.
*   `DELETE /education/resources/:id`: Delete a resource.

**3.10. Support Tickets (`/admin/support/tickets`)** (Requires 'Admin' or 'Moderator' SystemRole)
*   `GET /support/tickets`: List tickets.
    *   Query Params: `page`, `limit`, `searchTerm`, `statusFilter`, `priorityFilter`.
*   `GET /support/tickets/:id`: Get ticket details.
*   `PUT /support/tickets/:id`: Update ticket (status, priority, assignedToAdminId, add internal note).
    *   Body: `{ status?: TicketStatus, priority?: string, assignedToAdminId?: string, internalNote?: string }`.

**3.11. Audit Log (`/admin/audit-log`)** (Requires 'Admin' SystemRole)
*   `GET /audit-logs`: Fetch audit logs.
    *   Query Params: `page`, `limit`, `searchTerm`, `userFilter` (adminUserId), `actionFilter`, `dateRangeStart`, `dateRangeEnd`.
*   **Internal Logging**: Other backend services should have a mechanism (e.g., a shared library function or message queue) to reliably write entries to the audit log database after performing significant actions. Example actions to log: team member invitation, role change, status change, resending invitation.

**3.12. System Settings (`/admin/settings`)** (Requires 'Admin' SystemRole)
*   `GET /settings`: Retrieve all current system settings.
*   `PUT /settings`: Update system settings.
    *   Body: Contains all settings fields (e.g., platformName, supportEmail, defaultTimezone, enableAiSuggestions, defaultVideoPrivacy, smtpServer, etc.). Handle sensitive keys (API keys, SMTP password) with care – they might be write-only or require special permissions.
*   `POST /settings/upload-logo`: Handle logo file upload (e.g., to cloud storage) and return the URL.
*   `POST /settings/backup`: Trigger a platform data backup process.
*   `POST /settings/restore`: Initiate data restoration (highly sensitive, requires careful implementation).

**3.13. Patient Data Utilities (`/admin/users/data-tools`)** (Requires 'Admin' SystemRole with strong safeguards)
*   `POST /users/:userId/send-reset-link`: Trigger a password reset email for a specific user (patient or clinician).
*   `GET /users/:userId/export-data`: Initiate a job to export a user's data (for compliance). This should be an asynchronous process that notifies the admin/user when the export is ready.

### 4. API Endpoint Specifications - Clinician Panel (`/api/v1/clinician/...`)

These endpoints are specifically for the logged-in clinician user. RBAC must ensure only users with a `ProfessionalRole` can access these.

**4.1. Clinician Authentication & Profile**
*   `POST /auth/clinician/login`: { email, password } -> { token, userDetails (AdminUser with ProfessionalRole) }
*   `GET /auth/clinician/me`: (Requires token) -> { userDetails (AdminUser) }
*   `PUT /clinician/profile`: (Requires token) Update clinician's own profile.
    *   Body: `{ name?: string, specialization?: string, whatsappNumber?: string }` (fields editable by clinician).
    *   Response: Updated `AdminUser` object.
*   `POST /clinician/password`: (Requires token) Change clinician's own password.
    *   Body: `{ currentPassword: string, newPassword: string }`.
    *   Response: Success/failure message.

**4.2. Patient Management (`/clinician/patients`)**
*   `GET /clinician/patients`: List patients assigned to the logged-in clinician.
    *   Query Params: `searchTerm`, `sortBy`.
    *   Response: `{ patients: Patient[], total: number }`.
*   `POST /clinician/patients`: Add a new patient and assign to the current clinician.
    *   Body: `{ name: string, email: string, dateOfBirth?: string, gender?: string, phone?: string, address?: string, medicalConditions?: string, initialProgramId?: string }` (Based on `src/app/clinician/patients/new/page.tsx`, `medicalConditions` is comma-separated string).
    *   Response: Created `Patient` object.
*   `GET /clinician/patients/:id`: Get details of a specific patient assigned to the clinician.
    *   Response: `Patient` object, potentially with their current program summary (including exercise feedback from `feedbackHistory`).
*   `PUT /clinician/patients/:id`: Update patient details.
    *   Body: (Subset of fields editable by clinician, e.g., medicalNotes, conditions).
    *   Response: Updated `Patient` object.
*   `GET /clinician/patients/:id/programs`: Get list of programs (active and past) for a patient, ensuring each `ProgramExercise` includes its `feedbackHistory` (including `acknowledgedByClinician`).
*   `GET /clinician/patients/:id/appointments`: Get list of appointments for a patient.
*   `POST /clinician/patients/:id/notes`: Add/Update clinician notes for a patient.
    *   Body: `{ notes: string }`.
    *   Response: Updated patient object or success message.

**4.3. Exercise Program Management (`/clinician/programs`)**
*   `POST /clinician/programs`: Create a new exercise program and assign it to a patient.
    *   Body: `{ name: string, description?: string, patientId: string, exercises: Array<{ exerciseId: string, sets?: string, reps?: string, duration?: string, rest?: string, notes?: string }> }`. (Based on `src/components/features/programs/ProgramBuilder.tsx`).
    *   Response: Created `Program` object.
*   `GET /clinician/programs/:programId`: Get details of a specific program created by the clinician.
    *   Response: `Program` object with exercise details (including `feedbackHistory`).
*   `PUT /clinician/programs/:programId`: Update an existing program.
    *   Body: `{ name: string, description?: string, patientId: string, exercises: Array<{ exerciseId: string, sets?: string, reps?: string, duration?: string, rest?: string, notes?: string }> }`.
    *   Response: Updated `Program` object.
*   `DELETE /clinician/programs/:programId`: Delete or archive a program.
    *   Response: Success/failure message.
*   `POST /clinician/programs/:programId/exercise/:programExerciseId/feedback/:feedbackId/acknowledge`: Clinician acknowledges specific patient feedback. (This corresponds to a specific feedback entry, not just the programExercise).
    *   Response: Success message or updated feedback entry (with `acknowledgedByClinician: true`).

**4.4. Exercise Library Access**
*   Clinicians will use the general `GET /exercises` endpoint (see Admin section 3.4), filtered by `status: 'active'`. RBAC should ensure they have read-only access to `active` exercises. The `aiExerciseSearch` flow will also be used (invoked via backend).
*   `GET /clinician/program-templates`: List active program templates (those with status 'active' or 'template').

**4.5. Appointment Management (`/clinician/appointments`)**
*   `GET /clinician/appointments`: List appointments for the logged-in clinician.
    *   Query Params: `startDate`, `endDate`, `patientId` (optional).
    *   Response: `{ appointments: Appointment[] }`.
*   `POST /clinician/appointments`: Create a new appointment.
    *   Body: `{ patientId: string, start: datetime, end: datetime, title?: string, type?: string, notes?: string }`.
    *   Response: Created `Appointment` object.
*   `PUT /clinician/appointments/:id`: Update an appointment.
    *   Body: (Same as POST body, or subset of editable fields).
    *   Response: Updated `Appointment` object.
*   `DELETE /clinician/appointments/:id`: Cancel/delete an appointment.
    *   Response: Success/failure message.

**4.6. Messaging (`/clinician/messages`)**
*   `GET /clinician/messages/recents`: List recent patient conversations with last message snippet.
*   `GET /clinician/messages/:patientId`: Get message history with a specific patient.
    *   Query Params: `before` (timestamp for pagination).
    *   Response: `{ messages: Message[] }`.
*   `POST /clinician/messages`: Send a message to a patient.
    *   Body: `{ patientId: string, content: string, attachmentUrl?: string }`.
    *   Response: Sent `Message` object.
    *   (Consider WebSocket for real-time delivery).

**4.7. Clinician-Specific Analytics (`/clinician/analytics`)**
*   `GET /clinician/analytics/summary`: Overall adherence, active patients count for the clinician.
*   `GET /clinician/analytics/adherence-trends`: Data for patient adherence charts.
*   `GET /clinician/analytics/at-risk-patients`: List of clinician's patients with low adherence. (Table format, link to patient profiles).
*   `GET /clinician/analytics/exercise-compliance`: Data on most/least completed exercises by their patients.
*   `GET /clinician/analytics/export/adherence-report`: CSV export of the clinician's patient adherence data (Patient ID, Name, Program, Adherence %, Last Activity).

**4.8. Clinician Subscription Management (`/clinician/subscription`)**
*   `GET /clinician/subscription`: Get current clinician's subscription details.
    *   Response: `{ plan: PricingPlan, status: string, nextBillingDate: string }`
*   `POST /clinician/subscription/change`: Request to change subscription plan.
    *   Body: `{ newPlanId: string }`
    *   Response: Success/pending status (may involve redirect to payment provider).

**4.9. Clinician Support Tickets (`/clinician/support/tickets`)**
*   `POST /clinician/support/tickets`: Clinician submits a new support ticket.
    * Body: `{ subject: string, description: string }` (Backend associates with authenticated clinician).
    * Response: Created `SupportTicket` object or success message.

### 5. API Endpoint Specifications - Patient Panel (`/api/v1/patient/...`)

These endpoints are for the logged-in patient. RBAC must ensure only the authenticated patient can access their own data.

**5.1. Patient Authentication & Profile**
*   `POST /auth/patient/login`: { email, password } -> { token, userDetails (Patient) }
*   `POST /auth/patient/signup`: (As per `src/app/patient/signup/page.tsx`) -> { token, userDetails (Patient) }
*   `GET /auth/patient/me`: (Requires token) -> { userDetails (Patient) }
*   `PUT /auth/patient/profile`: Update patient's own profile (e.g., contact info, avatar).
    *   Body: `{ name?: string }` (Other fields like avatar or contact info can be added).
*   `POST /auth/patient/password`: Change patient's password.
    *   Body: `{ currentPassword: string, newPassword: string }`.

**5.2. Program & Exercises (`/patient/program`)**
*   `GET /patient/program/current`: Get the patient's currently active exercise program.
    *   Response: `Program` object with full exercise details (including `ProgramExercise` parameters, full `Exercise` info, and `feedbackHistory` including `acknowledgedByClinician`).
*   `POST /patient/program/exercise/:programExerciseId/complete`: Mark an exercise instance in a program as complete and submit feedback.
    *   Body: `{ painLevel: number, comments: string }` (Validated by `ai-driven-validation` flow).
    *   Response: Success message, updated progress. The submitted feedback is added to the `feedbackHistory` of the `ProgramExercise`.
*   `GET /patient/program/history`: List of past programs.

**5.3. Progress & Analytics (`/patient/progress`)**
*   `GET /patient/progress/summary`: Streak, badges, overall completion rate for their current program.
*   `GET /patient/progress/charts`: Data for exercise completion charts, consistency heatmap for their data.

**5.4. Appointments (`/patient/appointments`)**
*   `GET /patient/appointments`: List patient's upcoming and past appointments.
*   `POST /patient/appointments/book`: Request to book a new appointment.
    *   Body: `{ clinicianId: string, serviceType: string, date: date, timeSlot: string }`.
    *   Response: Confirmation or pending status.
*   `POST /patient/appointments/:id/cancel`: Request to cancel an appointment.

**5.5. Messaging (`/patient/messages`)**
*   `GET /patient/messages/clinician`: Get message history with their assigned clinician.
*   `POST /patient/messages/clinician`: Send a message to their assigned clinician.
    *   Body: `{ content: string, attachmentUrl?: string }`.

**5.6. Educational Resources (`/patient/education`)**
*   `GET /education/resources`: List available educational resources (only 'published' status).
    *   Query Params: `searchTerm`, `tags`.
*   `GET /education/resources/:id`: Get specific resource details.

**5.7. Patient Support Tickets (`/patient/support/tickets`)**
*   `POST /patient/support/tickets`: Patient submits a new support ticket.
    *   Body: `{ subject: string, description: string }` (Backend associates with authenticated patient).
    *   Response: Created `SupportTicket` object or success message.

### 6. Notifications (`/api/v1/notifications`)

*   `GET /notifications`: Get notifications for the authenticated user (admin, clinician, or patient).
    * Query Params: `unreadOnly` (boolean, optional), `limit` (number, optional).
    * Response: `{ notifications: NotificationItem[] }`
*   `POST /notifications/:id/read`: Mark a specific notification as read.
    * Response: Success message.
*   `POST /notifications/read-all`: Mark all notifications for the user as read.
    * Response: Success message.
*   **Backend Logic**: The backend will need to generate notifications based on various events (e.g., new program assigned, appointment reminder, new message, low adherence alert from AI, new support ticket for admin, ticket status update for clinician/patient, exercise feedback submitted, feedback acknowledged by clinician).

### 7. Genkit AI Flow Integration

*   **Server-Side Execution**: All Genkit flows (`ai-program-builder`, `ai-exercise-search`, `ai-driven-validation`, `ai-email-generator`, `ai-patient-motivator`) are designed to run server-side.
*   **Invocation**:
    *   They can be called directly from Next.js Server Actions if the backend is tightly coupled with Next.js.
    *   Alternatively, create specific API endpoints that act as wrappers around these Genkit flow calls. This is cleaner if the backend is a separate service.
        *   Example for Admin: `POST /admin/communication/generate-email` (already listed).
        *   Example for Clinician:
            *   `POST /clinician/ai/build-program` (Body: `BuildProgramInput` - for initial suggestion, progression/regression, or full program modification).
            *   `POST /clinician/ai/search-exercises` (Body: `AiExerciseSearchInput`).
        *   Example for Patient (via program completion): The `ai-driven-validation` flow would be called internally by the backend when a patient submits exercise feedback (e.g., as part of the `POST /patient/program/exercise/:programExerciseId/complete` endpoint logic).
        *   Example for Patient Dashboard: `POST /patient/ai/get-motivation` (Body: `AiPatientMotivationInput`).
*   **API Keys**: The Google AI API Key (and any other AI service keys) must be configured server-side via environment variables and accessed by the Genkit initialization logic (`src/ai/genkit.ts` or its backend equivalent). **Do not expose these keys to the frontend.**
*   **Input/Output**: The Zod schemas defined in each flow file (`...InputSchema`, `...OutputSchema`) should be used for validating data passed to and from these flows via API calls.

### 8. Authentication & Authorization Implementation Details

*   **User Roles**: Use the `UserRole` type from `src/lib/types.ts`.
*   **Login**: Implement separate login endpoints for Admin, Clinician, and Patient if their authentication logic or user tables differ significantly, or a single login endpoint that determines role from the user record.
    *   Verify credentials against hashed passwords.
    *   On success, generate a JWT containing user ID, role, and other relevant claims. Set an appropriate expiration.
*   **Token Handling**:
    *   Client stores JWT securely (e.g., HttpOnly cookie or localStorage).
    *   Include JWT in `Authorization` header (e.g., `Bearer <token>`) for all API requests.
*   **Middleware for Authorization**:
    *   Implement backend middleware to:
        1.  Verify JWT on incoming requests.
        2.  Extract user ID and role.
        3.  Check if the user's role has permission for the requested endpoint/resource. (Requires a mapping of roles to permissions for each API route).
        4.  Reject unauthorized requests (401/403).
*   **RBAC Logic**:
    *   **Admin Panel**: 
        *   Full access for 'Admin' SystemRole (can manage team, users, all content, billing, settings).
        *   'Content Reviewer': Access to Exercise Management, Program Templates, Educational Resources. Read-only for most other sections.
        *   'Moderator': Access to Support Tickets, User Management (limited actions like suspend, view details, but not delete or full edit), Communication (view announcements).
        *   'Finance Admin': Access to Billing Management, Platform Analytics (especially financial).
    *   **Clinician Panel**: Access restricted to `AdminUser` users with `ProfessionalRole`. Clinicians should only access data related to *their* assigned patients.
    *   **Patient Panel**: Access restricted to `Patient` users, who can only access *their own* data.

### 9. Security & Compliance Checklist

*   [ ] Use HTTPS for all communication.
*   [ ] Hash passwords using a strong algorithm (e.g., bcrypt, Argon2).
*   [ ] Implement CSRF protection if using cookie-based sessions.
*   [ ] Validate and sanitize all user inputs on the backend.
*   [ ] Use parameterized queries or ORM features to prevent SQL injection.
*   [ ] Store sensitive data (API keys, secrets) in environment variables, not in code.
*   [ ] Implement rate limiting for API endpoints to prevent abuse.
*   [ ] Regularly update dependencies.
*   [ ] For HIPAA/GDPR compliance (if applicable):
    *   Ensure data encryption at rest for PHI.
    *   Implement strict access controls and audit trails for PHI.
    *   Provide mechanisms for data export and deletion as per user rights.
    *   Conduct regular security audits and penetration testing.

This guide provides a detailed starting point. The specific implementation details will depend on the chosen backend technology stack and database.

