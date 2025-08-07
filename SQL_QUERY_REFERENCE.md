
# SQL Query Reference Guide - TheraGenius

## Introduction

This document provides a reference for SQL queries that are inferred based on the frontend functionality, data requirements, and API specifications of the TheraGenius platform. It is intended to assist backend developers in understanding the data operations needed to support the frontend.

**Note:**
- Queries are written in a generic SQL style, often resembling PostgreSQL syntax.
- Table and column names are derived from `PROJECT_SCHEMA.md`, generally using PluralizedCamelCase for tables (e.g., "Users", "Exercises") and snake_case for columns (e.g., `user_id`, `full_name`). Adjust these to match your chosen database naming conventions.
- Parameter placeholders (e.g., `$1`, `$2`) are used to indicate values that would be supplied by the application.
- This guide is not exhaustive for every minor data interaction but covers the primary CRUD operations and data retrieval scenarios for major features.
- Actual backend implementation might vary depending on the chosen database, ORM, and specific optimization strategies.

---

## 1. Authentication & User Account Management

### 1.1. User Signup (Clinician)
- **SQL Query (Conceptual - typically handled by auth service, then profile creation):**
  ```sql
  -- Step 1: Create base user account (often handled by auth system like Firebase Auth, or custom user table)
  -- Assuming a "Users" table stores common auth details + role, and "ClinicianProfiles" stores specifics.
  INSERT INTO "Users" (id, email, hashed_password, name, role, created_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
  RETURNING id;

  -- Step 2: Create clinician profile linked to the user account
  INSERT INTO "ClinicianProfiles" (user_id, specialization, whatsapp_number, city, current_plan_id, subscription_status, joined_date)
  VALUES ($6, $7, $8, $9, $10, $11, $12);
  ```
- **Used In:**
    - Feature: Clinician Signup
    - Page: `/signup`
    - Trigger: User submits clinician signup form.
    - API: `POST /auth/clinician/signup` (Conceptual)
- **Purpose:** To register a new clinician user and their professional profile.
- **Data Flow:** User-provided data from the form is inserted. `userId` from the first insert links to the second.

### 1.2. User Signup (Patient - Email/Password)
- **SQL Query (Conceptual):**
  ```sql
  -- Step 1: Create base user account
  INSERT INTO "Users" (id, email, hashed_password, name, role, created_at, updated_at)
  VALUES ($1, $2, $3, $4, 'Patient', NOW(), NOW())
  RETURNING id;

  -- Step 2: Create patient profile
  INSERT INTO "PatientProfiles" (user_id, whatsapp_number, date_of_birth, gender, phone, address, created_at, updated_at)
  VALUES ($5, $6, $7, $8, $9, $10, NOW(), NOW());
  -- Medical conditions might be handled in a separate related table or as an array/JSON if DB supports.
  ```
- **Used In:**
    - Feature: Patient Signup
    - Page: `/patient/signup`
    - Trigger: User submits patient signup form.
    - API: `POST /auth/patient/signup`
- **Purpose:** To register a new patient user.
- **Data Flow:** User-provided data from the form is inserted.

### 1.3. User Signup (Google - Profile Completion)
- **SQL Query (Conceptual - after Google Auth provides email/name):**
  ```sql
  -- Step 1: Create base user account (if not already existing from Google sign-in)
  INSERT INTO "Users" (id, email, name, role, google_auth_id, created_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) -- $4 is 'Patient' or Clinician Role
  ON CONFLICT (email) DO UPDATE SET google_auth_id = $5, updated_at = NOW()
  RETURNING id;

  -- Step 2a: If Clinician, create/update ClinicianProfile
  INSERT INTO "ClinicianProfiles" (user_id, specialization, whatsapp_number, city, current_plan_id, subscription_status, joined_date)
  VALUES ($6, $7, $8, $9, $10, $11, $12)
  ON CONFLICT (user_id) DO UPDATE SET specialization = $7, ...;

  -- Step 2b: If Patient, create/update PatientProfile
  INSERT INTO "PatientProfiles" (user_id, whatsapp_number, ...)
  VALUES ($6, $13, ...)
  ON CONFLICT (user_id) DO UPDATE SET whatsapp_number = $13, ...;
  ```
- **Used In:**
    - Feature: Google Signup - Profile Completion
    - Page: `/auth/complete-profile`
    - Trigger: User submits profile completion form after Google sign-in.
    - API: Backend logic after Google OAuth callback.
- **Purpose:** To complete user profile registration after Google authentication.
- **Data Flow:** Data from Google + form input is used.

### 1.4. User Login
- **SQL Query (Conceptual - if not using a dedicated auth service):**
  ```sql
  SELECT id, email, hashed_password, role, name, avatar_url
  FROM "Users"
  WHERE email = $1;
  ```
- **Used In:**
    - Feature: User Login (Admin, Clinician, Patient)
    - Page: `/login`
    - Trigger: User submits login form.
    - API: `POST /auth/login` (or role-specific login endpoints)
- **Purpose:** To authenticate a user and retrieve basic profile information.
- **Data Flow:** Returned user data is used to establish a session and populate user context in the frontend.

### 1.5. Forgot Password (Initiate Reset)
- **SQL Query (Conceptual):**
  ```sql
  -- Step 1: Find user by email
  SELECT id, email FROM "Users" WHERE email = $1;
  -- Step 2: If user exists, generate a reset token and store it with an expiry
  INSERT INTO "PasswordResetTokens" (user_id, token, expires_at)
  VALUES ($2, $3, NOW() + INTERVAL '1 hour');
  ```
- **Used In:**
    - Feature: Forgot Password
    - Page: `/auth/forgot-password`
    - Trigger: User submits email for password reset.
    - API: `POST /auth/forgot-password` (Conceptual)
- **Purpose:** To initiate the password reset process by generating and storing a secure token.
- **Data Flow:** Email is sent to user with a link containing the token.

---

## 2. Admin Panel

### 2.1. Clinician Management (`/admin/users`)

#### Query 1: List Clinicians
- **SQL Query:**
  ```sql
  SELECT
      u.id,
      u.name,
      u.email,
      cp.role AS professional_role, -- Assuming role specific to clinician is in ClinicianProfiles
      cp.specialization,
      u.status, -- User status from Users table
      cp.whatsapp_number,
      cp.city,
      cp.joined_date,
      cp.current_plan_id,
      pp.name AS current_plan_name,
      cp.subscription_status,
      u.avatar_url,
      (SELECT COUNT(*) FROM "PatientProfiles" pat WHERE pat.assigned_clinician_id = u.id) AS patient_count,
      (SELECT COUNT(*) FROM "Appointments" appt WHERE appt.clinician_id = u.id) AS appointment_count
  FROM
      "Users" u
  JOIN
      "ClinicianProfiles" cp ON u.id = cp.user_id
  LEFT JOIN
      "PricingPlans" pp ON cp.current_plan_id = pp.id
  WHERE
      u.role_type = 'clinician' -- Assuming a general role_type column in Users
      AND ($1::TEXT IS NULL OR u.name ILIKE '%' || $1 || '%')
      AND ($2::TEXT IS NULL OR u.status = $2)
      AND ($3::TEXT IS NULL OR cp.city ILIKE '%' || $3 || '%')
      AND ($4::TEXT IS NULL OR cp.subscription_status = $4)
  ORDER BY
      CASE WHEN $5 = 'nameAsc' THEN u.name END ASC,
      CASE WHEN $5 = 'nameDesc' THEN u.name END DESC,
      CASE WHEN $5 = 'joinedDateAsc' THEN cp.joined_date END ASC,
      CASE WHEN $5 = 'joinedDateDesc' THEN cp.joined_date END DESC,
      cp.joined_date DESC
  LIMIT $6 OFFSET $7;

  -- Count total for pagination
  SELECT COUNT(*)
  FROM "Users" u
  JOIN "ClinicianProfiles" cp ON u.id = cp.user_id
  WHERE
      u.role_type = 'clinician'
      AND ($1::TEXT IS NULL OR u.name ILIKE '%' || $1 || '%')
      AND ($2::TEXT IS NULL OR u.status = $2)
      AND ($3::TEXT IS NULL OR cp.city ILIKE '%' || $3 || '%')
      AND ($4::TEXT IS NULL OR cp.subscription_status = $4);
  ```
- **Used In:**
    - Feature: Admin Clinician Management
    - Page: `/admin/users`
    - Trigger: Page load, filter/sort/search change.
    - API: `GET /api/v1/admin/users/clinicians`
- **Purpose:** Fetch a paginated and filterable list of clinicians for display and management.
- **Data Flow:** Populates the clinician list/cards on the page.

#### Query 2: Add New Clinician
- **SQL Query:**
  ```sql
  -- Assuming a transaction:
  -- 1. Create User
  INSERT INTO "Users" (id, name, email, role_type, status, avatar_url, created_at, updated_at)
  VALUES (gen_random_uuid(), $1, $2, 'clinician', $3, $4, NOW(), NOW())
  RETURNING id;
  -- 2. Create ClinicianProfile with returned user_id
  INSERT INTO "ClinicianProfiles" (user_id, role, specialization, whatsapp_number, city, joined_date, subscription_status)
  VALUES ($5, $6, $7, $8, $9, NOW(), 'trial'); -- $5 is the id from previous insert
  ```
- **Used In:**
    - Feature: Admin Clinician Management
    - Page: `/admin/users/new`
    - Trigger: Submission of "Add New Clinician" form.
    - API: `POST /api/v1/admin/users/clinicians`
- **Purpose:** Create a new clinician user and their associated profile.
- **Data Flow:** Data from the form is inserted. A welcome email simulation would follow.

#### Query 3: Fetch Clinician Details (for Edit Page)
- **SQL Query:**
  ```sql
  SELECT
      u.id,
      u.name,
      u.email,
      cp.role AS professional_role,
      cp.specialization,
      u.status,
      cp.whatsapp_number,
      cp.city,
      cp.joined_date,
      cp.current_plan_id,
      cp.subscription_status,
      u.avatar_url
  FROM
      "Users" u
  JOIN
      "ClinicianProfiles" cp ON u.id = cp.user_id
  WHERE
      u.id = $1 AND u.role_type = 'clinician';
  ```
- **Used In:**
    - Feature: Admin Clinician Management
    - Page: `/admin/users/[userId]/edit`
    - Trigger: Page load.
    - API: `GET /api/v1/admin/users/clinicians/:id`
- **Purpose:** Retrieve details of a specific clinician to populate the edit form.
- **Data Flow:** Form fields are pre-filled with the fetched data.

#### Query 4: Update Clinician Details
- **SQL Query:**
  ```sql
  -- Assuming a transaction:
  -- 1. Update Users table
  UPDATE "Users"
  SET name = $1, email = $2, status = $3, updated_at = NOW()
  WHERE id = $4 AND role_type = 'clinician';
  -- 2. Update ClinicianProfiles table
  UPDATE "ClinicianProfiles"
  SET role = $5, specialization = $6, whatsapp_number = $7, city = $8
  WHERE user_id = $4;
  ```
- **Used In:**
    - Feature: Admin Clinician Management
    - Page: `/admin/users/[userId]/edit`
    - Trigger: Submission of "Edit Clinician" form.
    - API: `PUT /api/v1/admin/users/clinicians/:id`
- **Purpose:** Update a clinician's information.
- **Data Flow:** Form data updates corresponding records.

### 2.2. Team Management (`/admin/team`)
*(Similar CRUD queries as Clinician Management but for "TeamMembers" table/profile, filtering by admin system roles)*

#### Query 1: List Team Members
- **SQL Query:**
  ```sql
  SELECT id, name, email, role, status, joined_date, last_login, avatar_url, invited_by_admin_name, last_invitation_sent_at
  FROM "TeamMembers" -- Or "Users" table filtered by admin system roles
  WHERE
    ($1::TEXT IS NULL OR name ILIKE '%' || $1 || '%')
    AND ($2::TEXT IS NULL OR role = $2)
    AND ($3::TEXT IS NULL OR status = $3)
  ORDER BY name ASC
  LIMIT $4 OFFSET $5;

  SELECT COUNT(*) FROM "TeamMembers" WHERE ...; -- For pagination
  ```
- **Used In:**
    - Feature: Admin Team Management
    - Page: `/admin/team`
    - API: `GET /api/v1/admin/team-members`
- **Purpose:** List internal administrative staff.
- **Data Flow:** Populates team member table.

#### Query 2: Invite Team Member
- **SQL Query:**
  ```sql
  INSERT INTO "TeamMembers" (id, name, email, role, status, joined_date, invited_by_admin_id, invited_by_admin_name, last_invitation_sent_at)
  VALUES (gen_random_uuid(), $1, $2, $3, 'pending_invitation', NOW(), $4, $5, NOW());
  ```
- **Used In:**
    - Page: `/admin/team/new`
    - API: `POST /api/v1/admin/team-members/invite`
- **Purpose:** Create a record for a new team member and simulate sending an invitation.
- **Data Flow:** Form data is inserted.

#### Query 3: Update Team Member (Role/Status)
- **SQL Query:**
  ```sql
  UPDATE "TeamMembers"
  SET role = $1, status = $2
  WHERE id = $3;
  ```
- **Used In:**
    - Page: `/admin/team/[memberId]/edit`
    - API: `PUT /api/v1/admin/team-members/:id`
- **Purpose:** Update an existing team member's role or status.
- **Data Flow:** Form data updates the record.

#### Query 4: Resend Invitation
- **SQL Query:**
  ```sql
  UPDATE "TeamMembers"
  SET last_invitation_sent_at = NOW()
  WHERE id = $1 AND status = 'pending_invitation';
  ```
- **Used In:**
    - Page: `/admin/team` (via dropdown action)
    - API: `POST /api/v1/admin/team-members/:id/resend-invite`
- **Purpose:** Update the timestamp for the last invitation sent.
- **Data Flow:** Updates record, simulation of email being resent.

### 2.3. Exercise Management (`/admin/exercises`)
*(Full CRUD for "Exercises" table)*

#### Query 1: List Exercises
- **SQL Query:**
  ```sql
  SELECT id, name, description, video_url, thumbnail_url, category, body_parts, equipment, difficulty, precautions, status, is_featured, reps, sets, hold
  FROM "Exercises"
  WHERE
    ($1::TEXT IS NULL OR name ILIKE '%' || $1 || '%')
    AND ($2::TEXT IS NULL OR category = $2)
    AND ($3::TEXT IS NULL OR difficulty = $3)
    AND ($4::TEXT IS NULL OR status = $4)
  ORDER BY name ASC
  LIMIT $5 OFFSET $6;

  SELECT COUNT(*) FROM "Exercises" WHERE ...; -- For pagination
  ```
- **Used In:**
    - Feature: Admin Exercise Management
    - Page: `/admin/exercises`
    - API: `GET /api/v1/admin/exercises`
- **Purpose:** List all exercises in the library with filtering.
- **Data Flow:** Populates the exercise table.

#### Query 2: Create Exercise
- **SQL Query:**
  ```sql
  INSERT INTO "Exercises" (name, description, category, difficulty, body_parts, equipment, video_url, thumbnail_url, precautions, status, is_featured, reps, sets, hold, created_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW());
  ```
- **Used In:**
    - Page: `/admin/exercises/new`
    - API: `POST /api/v1/admin/exercises`
- **Purpose:** Add a new exercise to the library.
- **Data Flow:** Form data is inserted.

#### Query 3: Update Exercise
- **SQL Query:**
  ```sql
  UPDATE "Exercises"
  SET name = $1, description = $2, ..., updated_at = NOW()
  WHERE id = $N; -- $N is the exercise ID
  ```
- **Used In:**
    - Page: `/admin/exercises/[exerciseId]/edit`
    - API: `PUT /api/v1/admin/exercises/:id`
- **Purpose:** Modify an existing exercise.
- **Data Flow:** Form data updates the record.

### 2.4. Program Template Management (`/admin/program-templates`)
*(Full CRUD for "Programs" table where `is_template = true`)*

#### Query 1: List Program Templates
- **SQL Query:**
  ```sql
  SELECT id, name, description, category, status, created_at,
         (SELECT COUNT(*) FROM "ProgramExercises" pe WHERE pe.program_id = p.id) AS exercise_count
  FROM "Programs" p
  WHERE is_template = TRUE
    AND ($1::TEXT IS NULL OR name ILIKE '%' || $1 || '%')
  ORDER BY name ASC
  LIMIT $2 OFFSET $3;

  SELECT COUNT(*) FROM "Programs" WHERE is_template = TRUE AND ...; -- For pagination
  ```
- **Used In:**
    - Feature: Admin Program Template Management
    - Page: `/admin/program-templates`
    - API: `GET /api/v1/admin/program-templates`
- **Purpose:** List all reusable program templates.
- **Data Flow:** Populates the template table.

#### Query 2: Create Program Template
- **SQL Query (Conceptual - involves multiple inserts):**
  ```sql
  -- Start Transaction
  -- 1. Insert into "Programs"
  INSERT INTO "Programs" (name, description, category, status, is_template, clinician_id, created_at)
  VALUES ($1, $2, $3, $4, TRUE, $5, NOW()) -- $5 is admin_user_id
  RETURNING id;
  -- 2. For each exercise in template, insert into "ProgramExercises"
  -- Example for one exercise:
  INSERT INTO "ProgramExercises" (program_id, exercise_id, sets, reps, duration, rest, notes, order_in_program)
  VALUES ($6, $7, $8, $9, $10, $11, $12, $13); -- $6 is the program_id from previous insert
  -- Commit Transaction
  ```
- **Used In:**
    - Page: `/admin/program-templates/new`
    - API: `POST /api/v1/admin/program-templates`
- **Purpose:** Create a new reusable program template.
- **Data Flow:** Form data (template details and exercises) is inserted.

### 2.5. Billing Management (`/admin/billing`)

#### Query 1: List Pricing Plans
- **SQL Query:** `SELECT id, name, price, frequency, features, description, is_active, cta_text, is_popular FROM "PricingPlans";`
- **Used In:**
    - Feature: Admin Billing Management
    - Page: `/admin/billing` (Plan Configuration section)
    - API: `GET /api/v1/admin/billing/plans`
- **Purpose:** Fetch all pricing plans for display and management.
- **Data Flow:** Populates the pricing plan display cards/list.

#### Query 2: Create/Update Pricing Plan
- **SQL Query (Update example):**
  ```sql
  UPDATE "PricingPlans"
  SET name = $1, price = $2, frequency = $3, features = $4, description = $5, is_active = $6, cta_text = $7, is_popular = $8
  WHERE id = $9;
  -- INSERT query would be similar.
  ```
- **Used In:**
    - Page: `/admin/billing` (Plan Configuration Modal)
    - API: `POST /api/v1/admin/billing/plans`, `PUT /api/v1/admin/billing/plans/:id`
- **Purpose:** Manage subscription plan details.
- **Data Flow:** Form data updates or creates a plan record.

#### Query 3: List Coupon Codes
- **SQL Query:** `SELECT id, code, type, value, is_active, expiration_date, usage_limit, times_used FROM "CouponCodes";`
- **Used In:**
    - Feature: Admin Billing Management
    - Page: `/admin/billing` (Coupon Management section)
    - API: `GET /api/v1/admin/billing/coupons`
- **Purpose:** Fetch all coupon codes.
- **Data Flow:** Populates the coupon table.

#### Query 4: Create/Update Coupon Code
- **SQL Query (Update example):**
  ```sql
  UPDATE "CouponCodes"
  SET code = $1, type = $2, value = $3, is_active = $4, expiration_date = $5, usage_limit = $6
  WHERE id = $7;
  ```
- **Used In:**
    - Page: `/admin/billing` (Coupon Modal)
    - API: `POST /api/v1/admin/billing/coupons`, `PUT /api/v1/admin/billing/coupons/:id`
- **Purpose:** Manage promotional coupon codes.
- **Data Flow:** Form data updates or creates a coupon record.

#### Query 5: List Pending Payment Verifications
- **SQL Query:**
  ```sql
  SELECT id, clinician_id, clinician_name, clinician_email, requested_plan_id, requested_plan_name, requested_plan_price, receipt_url, submission_date, status
  FROM "PaymentVerificationRequests"
  WHERE status = 'pending'
  ORDER BY submission_date ASC;
  ```
- **Used In:**
    - Page: `/admin/billing`
    - API: `GET /api/v1/admin/billing/payment-verifications?status=pending`
- **Purpose:** Fetch payment verification requests awaiting admin review.
- **Data Flow:** Populates the pending verifications table.

#### Query 6: Approve/Reject Payment Verification
- **SQL Query (Approve example - part of a transaction):**
  ```sql
  -- Start Transaction
  -- 1. Update verification status
  UPDATE "PaymentVerificationRequests"
  SET status = 'approved', reviewed_by_admin_id = $1, review_date = NOW()
  WHERE id = $2;
  -- 2. Update ClinicianProfile
  UPDATE "ClinicianProfiles"
  SET current_plan_id = (SELECT requested_plan_id FROM "PaymentVerificationRequests" WHERE id = $2),
      subscription_status = 'active',
      payment_receipt_url = (SELECT receipt_url FROM "PaymentVerificationRequests" WHERE id = $2),
      requested_plan_id = NULL -- Clear the requested plan
  WHERE user_id = (SELECT clinician_id FROM "PaymentVerificationRequests" WHERE id = $2);
  -- Commit Transaction
  ```
- **Used In:**
    - Page: `/admin/billing`
    - API: `PUT /api/v1/admin/billing/payment-verifications/:verificationId`
- **Purpose:** Process a manual payment verification.
- **Data Flow:** Updates verification record and clinician's subscription status/plan.

### 2.6. Educational Resource Management (`/admin/content/education`)
*(Full CRUD for "EducationalResources" table)*

#### Query 1: List Educational Resources
- **SQL Query:**
  ```sql
  SELECT id, title, type, summary, status, created_at, updated_at, tags, estimated_read_time, thumbnail_url
  FROM "EducationalResources"
  WHERE
    ($1::TEXT IS NULL OR title ILIKE '%' || $1 || '%' OR summary ILIKE '%' || $1 || '%')
    AND ($2::TEXT IS NULL OR type = $2)
    AND ($3::TEXT IS NULL OR status = $3)
  ORDER BY created_at DESC
  LIMIT $4 OFFSET $5;

  SELECT COUNT(*) FROM "EducationalResources" WHERE ...; -- For pagination
  ```
- **Used In:**
    - Page: `/admin/content/education`
    - API: `GET /api/v1/admin/education/resources`
- **Purpose:** List educational content for management.
- **Data Flow:** Populates the resources table.

### 2.7. Audit Log (`/admin/audit-log`)

#### Query 1: Fetch Audit Logs
- **SQL Query:**
  ```sql
  SELECT id, timestamp, admin_user_id, admin_user_name, action, target_entity_type, target_entity_id, details
  FROM "AuditLogEntries"
  WHERE
    ($1::TEXT IS NULL OR admin_user_name ILIKE '%' || $1 || '%' OR action ILIKE '%' || $1 || '%')
    AND ($2::TEXT IS NULL OR admin_user_id = $2)
    AND ($3::TEXT IS NULL OR action = $3)
    AND ($4::TIMESTAMP IS NULL OR timestamp >= $4) -- dateRangeStart
    AND ($5::TIMESTAMP IS NULL OR timestamp <= $5) -- dateRangeEnd
  ORDER BY timestamp DESC
  LIMIT $6 OFFSET $7;

  SELECT COUNT(*) FROM "AuditLogEntries" WHERE ...; -- For pagination
  ```
- **Used In:**
    - Page: `/admin/audit-log`
    - API: `GET /api/v1/admin/audit-logs`
- **Purpose:** Retrieve logs of administrative actions for review.
- **Data Flow:** Populates the audit log table.

#### Query 2: Insert Audit Log Entry (Internal Backend Action)
- **SQL Query:**
  ```sql
  INSERT INTO "AuditLogEntries" (timestamp, admin_user_id, admin_user_name, action, target_entity_type, target_entity_id, details)
  VALUES (NOW(), $1, $2, $3, $4, $5, $6);
  ```
- **Used In:**
    - Triggered by various backend actions (e.g., user update, team invite).
- **Purpose:** Record significant administrative actions.
- **Data Flow:** Data about the action is inserted into the log.

### 2.8. System Settings (`/admin/settings`)

#### Query 1: Retrieve System Settings
- **SQL Query:**
  ```sql
  SELECT settings_key, settings_value FROM "SystemSettings";
  -- Or if settings are in a single JSONB column in a 'PlatformConfig' table:
  -- SELECT config_data FROM "PlatformConfig" WHERE id = 'singleton_config_id';
  ```
- **Used In:**
    - Page: `/admin/settings` (on load)
    - API: `GET /api/v1/admin/settings`
- **Purpose:** Fetch all current platform settings.
- **Data Flow:** Populates the settings form fields.

#### Query 2: Update System Settings
- **SQL Query (example for key-value store):**
  ```sql
  -- Repeat for each setting key/value pair
  INSERT INTO "SystemSettings" (settings_key, settings_value)
  VALUES ($1, $2)
  ON CONFLICT (settings_key) DO UPDATE SET settings_value = $2;
  ```
- **Used In:**
    - Page: `/admin/settings` (on save)
    - API: `PUT /api/v1/admin/settings`
- **Purpose:** Update global platform settings.
- **Data Flow:** Form data updates the settings records.

---

## 3. Clinician Panel

### 3.1. Patient Management (`/clinician/patients`)

#### Query 1: List Clinician's Patients
- **SQL Query:**
  ```sql
  SELECT
      p.id,
      u.name,
      u.email,
      p.date_of_birth,
      p.gender,
      p.phone,
      p.whatsapp_number,
      p.conditions, -- Assuming array or JSONB
      p.current_program_id,
      prog.name AS current_program_name,
      u.avatar_url,
      p.last_activity,
      p.overall_adherence
  FROM
      "PatientProfiles" p
  JOIN
      "Users" u ON p.user_id = u.id
  LEFT JOIN
      "Programs" prog ON p.current_program_id = prog.id
  WHERE
      p.assigned_clinician_id = $1 -- Logged-in clinician's ID
      AND ($2::TEXT IS NULL OR u.name ILIKE '%' || $2 || '%')
  ORDER BY
      u.name ASC
  LIMIT $3 OFFSET $4;

  SELECT COUNT(*) FROM "PatientProfiles" p JOIN "Users" u ON p.user_id = u.id
  WHERE p.assigned_clinician_id = $1 AND ...; -- For pagination
  ```
- **Used In:**
    - Page: `/clinician/patients`
    - API: `GET /api/v1/clinician/patients`
- **Purpose:** Fetch patients assigned to the logged-in clinician.
- **Data Flow:** Populates the patient list/cards.

#### Query 2: Add New Patient
- **SQL Query (Conceptual - Transaction):**
  ```sql
  -- Start Transaction
  -- 1. Create User account for patient
  INSERT INTO "Users" (id, name, email, role_type, status, avatar_url, created_at, updated_at)
  VALUES (gen_random_uuid(), $1, $2, 'patient', 'active', $3, NOW(), NOW())
  RETURNING id;
  -- 2. Create PatientProfile
  INSERT INTO "PatientProfiles" (user_id, date_of_birth, gender, phone, whatsapp_number, address, conditions, assigned_clinician_id, current_program_id, last_activity, overall_adherence)
  VALUES ($4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), 0); -- $4 is user_id, $11 is clinician_id
  -- Commit Transaction
  ```
- **Used In:**
    - Page: `/clinician/patients/new`
    - API: `POST /api/v1/clinician/patients`
- **Purpose:** Onboard a new patient and assign to the current clinician.
- **Data Flow:** Form data creates new user and patient profile records.

#### Query 3: Fetch Patient Details (for Detail Page)
- **SQL Query:**
  ```sql
  SELECT
      p.id, u.name, u.email, p.date_of_birth, p.gender, p.phone, p.whatsapp_number, p.address, p.conditions, p.medical_notes,
      p.current_program_id, prog.name AS current_program_name, p.overall_adherence, u.avatar_url, p.last_activity
  FROM "PatientProfiles" p
  JOIN "Users" u ON p.user_id = u.id
  LEFT JOIN "Programs" prog ON p.current_program_id = prog.id
  WHERE p.id = $1 AND p.assigned_clinician_id = $2; -- $1 is patientId, $2 is clinicianId
  ```
- **Used In:**
    - Page: `/clinician/patients/[patientId]`
    - API: `GET /api/v1/clinician/patients/:id`
- **Purpose:** Get comprehensive details for a specific patient.
- **Data Flow:** Populates the patient detail page.

### 3.2. Exercise Program Management (`/clinician/programs`, ProgramBuilder)

#### Query 1: Create New Program & Assign to Patient
- **SQL Query (Conceptual - Transaction):**
  ```sql
  -- Start Transaction
  -- 1. Insert Program
  INSERT INTO "Programs" (name, description, patient_id, clinician_id, status, created_at, assigned_date, is_template)
  VALUES ($1, $2, $3, $4, 'active', NOW(), NOW(), FALSE) -- $3=patientId, $4=clinicianId
  RETURNING id;
  -- 2. Insert ProgramExercises
  -- For each exercise:
  INSERT INTO "ProgramExercises" (program_id, exercise_id, sets, reps, duration, rest, notes, order_in_program)
  VALUES ($5, $6, $7, $8, $9, $10, $11, $12); -- $5=program_id from above
  -- 3. Update PatientProfile's current_program_id
  UPDATE "PatientProfiles" SET current_program_id = $5 WHERE id = $3;
  -- Commit Transaction
  ```
- **Used In:**
    - Component: `ProgramBuilder.tsx`
    - API: `POST /api/v1/clinician/programs`
- **Purpose:** Create a new exercise program and assign it to a patient.
- **Data Flow:** Program details and exercises from builder are saved. Patient record is updated.

#### Query 2: Fetch Clinician's Assigned Programs (for `/clinician/programs`)
- **SQL Query:**
  ```sql
  SELECT
    p.id, p.name, p.description, p.status, p.assigned_date, p.adherence_rate,
    pat_u.name AS patient_name, p.patient_id,
    (SELECT COUNT(*) FROM "ProgramExercises" pe WHERE pe.program_id = p.id) AS exercise_count
  FROM "Programs" p
  JOIN "PatientProfiles" pat_p ON p.patient_id = pat_p.id
  JOIN "Users" pat_u ON pat_p.user_id = pat_u.id
  WHERE p.clinician_id = $1 AND p.is_template = FALSE -- Logged-in clinician_id
    AND ($2::TEXT IS NULL OR p.name ILIKE '%' || $2 || '%' OR pat_u.name ILIKE '%' || $2 || '%')
  ORDER BY p.assigned_date DESC, p.created_at DESC
  LIMIT $3 OFFSET $4;
  ```
- **Used In:**
    - Page: `/clinician/programs`
    - API: (Conceptual) `GET /api/v1/clinician/programs/assigned`
- **Purpose:** List programs created and assigned by the clinician.
- **Data Flow:** Populates the list of assigned programs.

#### Query 3: Fetch Active Program Templates (for ProgramBuilder and `/clinician/program-templates`)
- **SQL Query:**
  ```sql
  SELECT id, name, description, category,
         (SELECT COUNT(*) FROM "ProgramExercises" pe WHERE pe.program_id = p.id) AS exercise_count
  FROM "Programs" p
  WHERE p.is_template = TRUE AND p.status IN ('active', 'template')
  ORDER BY p.name ASC;
  ```
- **Used In:**
    - Component: `ProgramBuilder.tsx` (Load from template dropdown)
    - Page: `/clinician/program-templates`
    - API: `GET /api/v1/clinician/program-templates`
- **Purpose:** Provide clinicians with a list of usable program templates.
- **Data Flow:** Populates template selection dropdown or list.

### 3.3. Appointment Management (`/clinician/appointments`)

#### Query 1: Fetch Clinician's Appointments for a Date Range
- **SQL Query:**
  ```sql
  SELECT
    a.id, a.patient_id, u.name AS patient_name, a.clinician_id,
    a.start_time, a.end_time, a.title, a.status, a.type, a.notes
  FROM "Appointments" a
  JOIN "PatientProfiles" pp ON a.patient_id = pp.id
  JOIN "Users" u ON pp.user_id = u.id
  WHERE a.clinician_id = $1 -- Logged-in clinician's ID
    AND a.start_time >= $2 -- startDate
    AND a.start_time < $3   -- endDate (exclusive, e.g., start of next day)
  ORDER BY a.start_time ASC;
  ```
- **Used In:**
    - Page: `/clinician/appointments` (Calendar view)
    - API: `GET /api/v1/clinician/appointments`
- **Purpose:** Retrieve appointments for display in the clinician's calendar.
- **Data Flow:** Populates the calendar component.

#### Query 2: Create New Appointment
- **SQL Query:**
  ```sql
  INSERT INTO "Appointments" (patient_id, clinician_id, start_time, end_time, title, type, notes, status, city, created_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled', $8, NOW(), NOW());
  ```
- **Used In:**
    - Component: `AppointmentFormModal.tsx`
    - API: `POST /api/v1/clinician/appointments`
- **Purpose:** Schedule a new appointment for a patient.
- **Data Flow:** Form data from modal is inserted.

### 3.4. Secure Messaging (`/clinician/messaging`)

#### Query 1: Fetch Recent Conversations (Clinician)
- **SQL Query (Conceptual - more complex for "last message"):**
  ```sql
  -- This is a simplified version. Real query might use window functions or subqueries.
  SELECT DISTINCT ON (CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
      u.id AS patient_user_id,
      u.name AS patient_name,
      u.avatar_url AS patient_avatar_url,
      m.content AS last_message_content,
      m.timestamp AS last_message_timestamp,
      (SELECT COUNT(*) FROM "Messages" unread
       WHERE unread.receiver_id = $1 -- clinician_id
         AND unread.sender_id = u.id
         AND unread.is_read = FALSE) AS unread_count
  FROM "Messages" m
  JOIN "Users" u ON (m.sender_id = u.id AND m.receiver_id = $1) OR (m.receiver_id = u.id AND m.sender_id = $1)
  WHERE (m.sender_id = $1 OR m.receiver_id = $1) AND u.id != $1 AND u.role_type = 'patient'
  ORDER BY CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END, m.timestamp DESC;
  ```
- **Used In:**
    - Page: `/clinician/messaging`
    - API: `GET /api/v1/clinician/messages/recents`
- **Purpose:** List recent conversations with patients, showing last message and unread counts.
- **Data Flow:** Populates the user list sidebar in the messaging interface.

#### Query 2: Fetch Message History with a Patient (Clinician)
- **SQL Query:**
  ```sql
  SELECT id, sender_id, receiver_id, content, timestamp, attachment_url, is_read
  FROM "Messages"
  WHERE (sender_id = $1 AND receiver_id = $2) -- Clinician sending to Patient
     OR (sender_id = $2 AND receiver_id = $1) -- Patient sending to Clinician
  ORDER BY timestamp ASC
  LIMIT $3 OFFSET $4; -- For pagination
  ```
- **Used In:**
    - Page: `/clinician/messaging` (when a conversation is selected)
    - API: `GET /api/v1/clinician/messages/:patientId`
- **Purpose:** Retrieve the full message history for a specific clinician-patient chat.
- **Data Flow:** Populates the chat window.

#### Query 3: Send Message (Clinician to Patient)
- **SQL Query:**
  ```sql
  INSERT INTO "Messages" (sender_id, receiver_id, content, timestamp, attachment_url, is_read)
  VALUES ($1, $2, $3, NOW(), $4, FALSE); -- $1=clinicianId, $2=patientId
  ```
- **Used In:**
    - Page: `/clinician/messaging`
    - API: `POST /api/v1/clinician/messages`
- **Purpose:** Save a new message sent by the clinician.
- **Data Flow:** Message content is inserted. Real-time update via WebSockets would typically follow.

---

## 4. Patient Portal

### 4.1. Patient Dashboard (`/patient/dashboard`)

#### Query 1: Fetch Current Active Program Summary for Patient
- **SQL Query:**
  ```sql
  SELECT
      prog.id, prog.name, prog.description,
      pp.overall_adherence -- Patient's adherence from their profile
  FROM "PatientProfiles" pp
  JOIN "Programs" prog ON pp.current_program_id = prog.id
  WHERE pp.user_id = $1 AND prog.status = 'active'; -- Logged-in patient's user_id
  ```
- **Used In:**
    - Page: `/patient/dashboard`
    - API: Backend logic on dashboard load.
- **Purpose:** Display a summary of the patient's currently active exercise program.
- **Data Flow:** Populates the "Current Program" card.

#### Query 2: Fetch Upcoming Appointments for Patient
- **SQL Query:**
  ```sql
  SELECT id, title, start_time, end_time, type, clinician_name
  FROM "Appointments"
  WHERE patient_id = $1 -- (PatientProfile ID, not User ID)
    AND status = 'scheduled' AND start_time >= NOW()
  ORDER BY start_time ASC
  LIMIT 3;
  ```
- **Used In:**
    - Page: `/patient/dashboard`
    - API: Backend logic on dashboard load.
- **Purpose:** Show a few upcoming appointments on the dashboard.
- **Data Flow:** Populates the "Upcoming Appointments" section.

### 4.2. My Program (`/patient/program`)

#### Query 1: Fetch Detailed Active Program for Patient
- **SQL Query:**
  ```sql
  SELECT
      prog.id AS program_id, prog.name AS program_name, prog.description AS program_description,
      pe.sets, pe.reps, pe.duration, pe.notes AS exercise_specific_notes,
      ex.id AS exercise_id, ex.name AS exercise_name, ex.description AS exercise_description,
      ex.video_url, ex.thumbnail_url, ex.category AS exercise_category, ex.difficulty AS exercise_difficulty,
      ex.precautions,
      pf.timestamp AS feedback_timestamp, pf.pain_level, pf.comments AS feedback_comments, pf.acknowledged_by_clinician
  FROM "PatientProfiles" pp
  JOIN "Programs" prog ON pp.current_program_id = prog.id
  JOIN "ProgramExercises" pe ON prog.id = pe.program_id
  JOIN "Exercises" ex ON pe.exercise_id = ex.id
  LEFT JOIN "ProgramExerciseFeedback" pf ON pe.id = pf.program_exercise_id -- Assuming ProgramExercises has its own PK `id`
  WHERE pp.user_id = $1 AND prog.status = 'active' -- Logged-in patient's user_id
  ORDER BY pe.order_in_program ASC, pf.timestamp ASC; -- Assuming an order column for exercises
  ```
- **Used In:**
    - Page: `/patient/program`
    - API: `GET /api/v1/patient/program/current`
- **Purpose:** Retrieve the full details of the patient's active program, including all exercises and their feedback history.
- **Data Flow:** Populates the exercise list and the detailed view for each exercise.

#### Query 2: Submit Exercise Feedback
- **SQL Query:**
  ```sql
  INSERT INTO "ProgramExerciseFeedback" (program_exercise_id, patient_id, timestamp, pain_level, comments)
  VALUES ($1, $2, NOW(), $3, $4); -- $1=program_exercise_instance_id, $2=patient_profile_id
  -- Potentially update Program's or PatientProfile's adherence/last_activity here or via a trigger.
  ```
- **Used In:**
    - Component: `PatientExerciseView.tsx`
    - API: `POST /api/v1/patient/program/exercise/:programExerciseId/complete`
- **Purpose:** Save patient's feedback for a completed exercise.
- **Data Flow:** Feedback form data is inserted.

### 4.3. Messaging (Patient to Clinician)
*(Queries similar to Clinician Messaging, but roles are reversed)*

#### Query 1: Fetch Message History with Assigned Clinician (Patient)
- **SQL Query:**
  ```sql
  SELECT id, sender_id, receiver_id, content, timestamp, attachment_url, is_read,
         sender_u.name AS sender_name, sender_u.avatar_url AS sender_avatar_url
  FROM "Messages" m
  JOIN "Users" sender_u ON m.sender_id = sender_u.id
  WHERE (m.sender_id = $1 AND m.receiver_id = $2) -- Patient sending to Clinician
     OR (m.sender_id = $2 AND m.receiver_id = $1) -- Clinician sending to Patient
    -- $1 = patient_user_id, $2 = assigned_clinician_user_id
  ORDER BY m.timestamp ASC;
  ```
- **Used In:**
    - Page: `/patient/messaging`
    - API: `GET /api/v1/patient/messages/clinician`
- **Purpose:** Retrieve message history with the assigned clinician.
- **Data Flow:** Populates chat window.

---

## 5. General/Shared

### 5.1. Fetching User Details (Generic for Layouts/Profile)
- **SQL Query:**
  ```sql
  SELECT u.id, u.name, u.email, u.role_type, u.avatar_url,
    -- Clinician specific (NULL if not clinician)
    cp.role AS professional_role, cp.specialization, cp.whatsapp_number, cp.city, cp.current_plan_id, cp.subscription_status,
    -- Patient specific (NULL if not patient)
    pp.date_of_birth, pp.gender, pp.phone AS patient_phone, pp.conditions, pp.assigned_clinician_id
  FROM "Users" u
  LEFT JOIN "ClinicianProfiles" cp ON u.id = cp.user_id AND u.role_type = 'clinician'
  LEFT JOIN "PatientProfiles" pp ON u.id = pp.user_id AND u.role_type = 'patient'
  WHERE u.id = $1; -- Logged-in user's ID
  ```
- **Used In:**
    - Layouts (Admin, Clinician, Patient) for user display.
    - Profile pages.
    - API: `GET /auth/me` (role-specific)
- **Purpose:** Get details for the currently authenticated user.
- **Data Flow:** Populates user avatar, name, and role-specific details in sidebars/headers.

### 5.2. Fetching Notifications
- **SQL Query:**
  ```sql
  SELECT id, user_id, title, description, timestamp, is_read, link_path, type
  FROM "NotificationItems"
  WHERE user_id = $1 -- Logged-in user's ID
    AND ($2::BOOLEAN IS NULL OR is_read = NOT $2) -- Optional unreadOnly filter
  ORDER BY timestamp DESC
  LIMIT $3; -- Optional limit
  ```
- **Used In:**
    - Component: `NotificationBell.tsx`
    - API: `GET /api/v1/notifications`
- **Purpose:** Retrieve notifications for the logged-in user.
- **Data Flow:** Populates the notification bell dropdown.

### 5.3. Mark Notification as Read
- **SQL Query:**
  ```sql
  UPDATE "NotificationItems" SET is_read = TRUE WHERE id = $1 AND user_id = $2;
  -- OR for Mark All As Read:
  -- UPDATE "NotificationItems" SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE;
  ```
- **Used In:**
    - Component: `NotificationBell.tsx`
    - API: `POST /api/v1/notifications/:id/read`, `POST /api/v1/notifications/read-all`
- **Purpose:** Update the read status of notifications.
- **Data Flow:** UI reflects the change in read status.

---

This guide should provide a strong starting point for backend SQL development. Remember to adapt table and column names, and query logic, to your specific database schema and backend framework conventions.

    