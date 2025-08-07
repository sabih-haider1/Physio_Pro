
# TheraGenius: AI-Powered Physical Therapy & Exercise Prescription Platform

## System Overview

TheraGenius is an innovative, AI-driven platform meticulously designed to revolutionize physical therapy and exercise prescription. It empowers clinicians with intelligent tools to create, manage, and monitor personalized rehabilitation programs, while providing patients with an engaging, supportive, and accessible portal for their recovery journey.

The core mission of TheraGenius is to enhance treatment efficacy, significantly improve patient adherence through personalized interactions, and streamline clinic operations. By leveraging cutting-edge AI capabilities through Google Gemini models via Firebase Genkit, TheraGenius offers a suite of intelligent features including semantic exercise search, AI-assisted program building with progression/regression logic, AI-driven validation of patient feedback, and personalized patient motivation.

The platform is also tailored for specific operational contexts, such as the Pakistani healthcare market, by incorporating features like city-based clinician discovery for appointment booking and a manual payment verification system for subscriptions, ensuring broader accessibility and practicality. This comprehensive approach positions TheraGenius as a forward-thinking solution in digital health.

## Key Stakeholders & Features

The TheraGenius platform serves three primary stakeholders, each with a dedicated panel and tailored features:

---

### 1. Administrative Panel

The Administrative Panel is the central command center for managing the entire TheraGenius platform, its users, content, and critical operational settings. It ensures the smooth functioning and growth of the platform.

**Core Administrative Features:**

*   **Clinician Management:**
    *   **List & Filter Clinicians:** View a comprehensive list of all clinicians, with advanced filtering by status (active, pending, suspended), subscription status, and city. Includes search functionality and sorting options.
    *   **Add New Clinicians:** Onboard new clinicians by providing their name, email, professional role, specialization, initial status, city, and optional WhatsApp number.
    *   **Edit Clinician Details:** Modify existing clinician profiles, including their role, specialization, status, city, and contact information.
*   **Team Management:**
    *   **List & Filter Team Members:** Manage internal administrative staff, view their roles (Admin, Content Reviewer, Moderator, Finance Admin), and status.
    *   **Invite New Team Members:** Send email invitations to new team members, assigning them specific system roles.
    *   **Edit Team Member Roles/Status:** Update roles and account statuses of existing team members.
    *   **Resend Invitations:** Option to resend invitation emails to members with a 'pending_invitation' status.
*   **Exercise Library Management:**
    *   **Full CRUD Capabilities:** Create, read, update, and delete exercises in the central library. This includes defining exercise names, detailed descriptions, video URLs, thumbnail URLs, categories (e.g., Strength, Mobility), targeted body parts, required equipment, difficulty levels (Beginner, Intermediate, Advanced), precautions, default parameters (sets, reps, hold duration), and status (active, pending, rejected).
    *   **Feature Exercises:** Highlight specific exercises by marking them as 'featured'.
    *   **CSV Import/Export:** Efficiently manage the exercise library through bulk import and export of exercise data via CSV files.
*   **Program Template Management:**
    *   **Create & Manage Templates:** Develop reusable exercise program templates, assign names, descriptions, categories (e.g., Post-Surgery, Spine), and add/configure exercises with default parameters.
    *   **Edit Templates:** Modify existing templates, including their exercises and details.
    *   **Status Management:** Control template visibility and usability through draft, active, and archived statuses.
*   **Platform Analytics (Simulated Data):**
    *   **Dashboard Overview:** Access a dashboard displaying key platform metrics like (simulated) Monthly Recurring Revenue (MRR), new user registrations, active clinicians, programs created, exercise popularity, and more via interactive charts and tables.
    *   **AI-Driven Insights:** A dedicated section (conceptually) presents AI-generated insights about platform usage, such as identifying trends in exercise searches or program templates with low adherence, enabling proactive administrative decisions.
    *   **Detailed Reports:** View charts and tables for MRR, platform usage (active users, programs created), exercise popularity, most active clinicians, program creation trends, and patient engagement overview.
*   **Billing Management:**
    *   **Pricing Plan Configuration:** Define and manage various subscription plans (e.g., Basic, Pro, Enterprise), including their name, price, frequency, features, description, and active status. These plans dynamically drive the options available on the public landing page.
    *   **Coupon Code Management:** Create, edit, and manage promotional coupon codes, specifying type (percentage/fixed), value, active status, expiration, and usage limits.
    *   **Manual Payment Verification:** A crucial feature for markets without integrated payment gateways. Admins can view a list of pending payment verifications submitted by clinicians, review uploaded (simulated) receipts, and then "Approve" or "Reject" the payment. Approving activates the clinician's selected subscription plan.
*   **Communication Tools:**
    *   **AI Email Composer:** Leverage AI to draft professional and engaging email bodies for various communications (e.g., announcements, updates to user groups).
    *   **Platform Announcements:** Create, edit, publish, and manage platform-wide announcements. Target specific user roles (all, clinicians, patients) and set announcement status (draft, published, archived).
*   **Educational Content Management:**
    *   **Develop & Manage Resources:** Create, edit, and publish educational materials (articles, videos) for patients. Manage titles, summaries, content (Markdown for articles, URL for videos), thumbnail URLs, tags, estimated read/watch time, and status (draft, published, archived).
*   **Support Ticket System:**
    *   **View & Manage Tickets:** Access a list of all support tickets submitted by clinicians and patients.
    *   **Ticket Details & Actions:** View detailed information for each ticket, including user details, subject, description, status (open, in_progress, resolved, closed), and priority (low, medium, high).
    *   **Assign & Add Notes:** Assign tickets to specific admin team members and add internal notes for collaboration and tracking.
*   **Audit Log:**
    *   **Track Admin Actions:** A detailed log records significant administrative actions performed across the platform, such as user updates, team member invitations, and content changes, enhancing security and accountability. Includes filtering by user, action, and date range.
*   **System Settings:**
    *   **General Configuration:** Set platform name, support email, default timezone, and default language.
    *   **Feature Toggles:** Enable or disable global features like patient self-registration, AI suggestions, and patient messaging.
    *   **Branding:** Upload and manage the platform logo.
    *   **Payment Receiving Details:** Configure bank account information (account name, bank name, account number, SWIFT/BIC, reference instructions) that will be displayed to clinicians for manual subscription payments.
    *   **Email (SMTP) Settings:** Configure SMTP server details for sending platform emails (simulated).
    *   **Data Management (Simulated):** Options to trigger platform data backup and restoration processes.
*   **Patient Data Utilities (Simulated):**
    *   **Account Recovery:** Assist patients or clinicians by (simulating) sending password reset links.
    *   **Data Export:** (Simulate) initiating a patient data export process for compliance purposes.

**AI Integration in Admin Panel:**

*   **AI Email Composer (`ai-email-generator` flow):**
    *   **How it Helps:** Admins can provide a simple prompt (e.g., "Draft a welcome email for new clinicians focusing on AI features") and optionally a subject or recipient context.
    *   **AI Action:** The Genkit flow uses a Gemini model to generate a well-structured and contextually appropriate email body, and can also suggest a subject line.
    *   **Benefit:** Saves administrative time, ensures consistent and professional messaging, and helps craft engaging communications.
*   **AI-Driven Platform Insights (Analytics Dashboard - Conceptual):**
    *   **How it Helps:** While the charts display data, this conceptual feature implies an AI backend processing platform-wide data.
    *   **AI Action:** The AI would analyze trends, user behavior, content popularity, and adherence patterns to identify actionable insights. For instance, it might flag an exercise template with unusually low patient adherence or identify emerging search trends for specific conditions.
    *   **Benefit:** Enables proactive administrative decisions, helps optimize platform content and features, and identifies areas needing attention or improvement before they become major issues.

---

### 2. Clinician Panel

The Clinician Panel is a comprehensive suite of tools designed to empower healthcare professionals in delivering effective, personalized, and AI-enhanced exercise therapy.

**Core Clinician Features:**

*   **Patient Management:**
    *   **Add New Patients:** Onboard new patients, providing their name, email, date of birth, gender, contact details, medical conditions, and optionally assign an initial program template.
    *   **View Patient Roster:** Access a list of all assigned patients.
    *   **Detailed Patient Profiles:** Dive into individual patient profiles to view comprehensive details, including contact information, medical conditions, clinician notes, assigned exercise programs (current and past), and a history of their feedback on exercises.
*   **Exercise Program Creation & Management (`Program Builder`):**
    *   **Build Custom Programs:** Create exercise programs from scratch by manually selecting exercises from the library.
    *   **Utilize Templates:** Load predefined program templates (created by admins or other clinicians) to quickly start program creation.
    *   **Assign to Patients:** Assign newly created or existing programs to specific patients on their roster.
    *   **Modify Existing Programs:** Edit previously assigned programs, adjust exercises, sets, reps, duration, rest periods, and add specific notes for each exercise.
*   **Exercise Library Access:**
    *   **Browse & Filter:** Explore the extensive exercise library with manual search capabilities and filters (e.g., body part, difficulty, equipment).
    *   **Preview Exercises:** View detailed information for each exercise, including video demonstrations, instructions, and precautions, via a modal.
*   **Appointment Scheduling:**
    *   **Dynamic Calendar:** Manage appointments using an interactive calendar with weekly and monthly views.
    *   **Create & Edit Appointments:** Schedule new appointments for patients, specifying date, time, duration, type (e.g., Initial Consultation, Follow-up), and add notes. Edit existing appointments.
    *   **AI-Suggested Slots (Conceptual UI):** The calendar UI is designed to potentially highlight AI-suggested optimal appointment slots based on availability and other factors, aiding in efficient scheduling.
*   **Secure Messaging:**
    *   **One-on-One Chat:** Engage in secure, real-time text-based communication with assigned patients.
    *   **Attachment Support (Simulated):** Conceptually supports sending/receiving file attachments.
*   **Adherence Analytics:**
    *   **Track Patient Progress:** Access dashboards to monitor patient adherence to prescribed programs.
    *   **View Key Metrics:** Analyze overall adherence trends, patient distribution by adherence tiers (high, medium, low), and identify the most common non-adherent exercises.
    *   **Export Reports:** Download detailed patient adherence reports in CSV format.
*   **Subscription Management & Profile Settings:**
    *   **View Current Plan:** See details of their current subscription plan.
    *   **Change Plan (Manual Flow):** Initiate a plan change request, which directs them to a manual payment page where they can view bank details and upload a payment receipt for admin verification.
    *   **Update Profile:** Manage their professional profile, including name, specialization, and WhatsApp number.
    *   **Change Password:** Securely update their account password.
*   **Support Tickets:**
    *   **Submit Requests:** Directly submit support tickets to platform administrators for any technical issues, questions, or feedback regarding the platform.

**AI Integration in Clinician Panel:**

*   **AI Exercise Search (`ai-exercise-search` flow):**
    *   **How it Helps:** Clinicians can type natural language queries (e.g., "exercises for rotator cuff rehab phase 1" or "gentle low back stretches for elderly") into a search bar.
    *   **AI Action:** The Genkit flow processes this query and returns a list of the most relevant exercise names from the platform's library.
    *   **Benefit:** Dramatically speeds up the process of finding suitable exercises, making program design more intuitive and efficient, especially with a large library.
*   **AI Program Builder (`ai-program-builder` flow):** This is a multifaceted AI tool:
    *   **1. Initial Program Suggestion:**
        *   **How it Helps:** When a patient is selected (especially one with defined conditions), the clinician can request AI suggestions.
        *   **AI Action:** Based on the patient's conditions (e.g., "post-ACL surgery," "shoulder impingement") and the available exercise library, the AI suggests a set of 3-5 suitable exercises, complete with recommended parameters (e.g., "Sets: 3, Reps: 10").
        *   **Benefit:** Provides a validated starting point for new programs, saving time and leveraging evidence-based (simulated) recommendations.
    *   **2. Exercise Progression/Regression:**
        *   **How it Helps:** For any exercise within an existing program, the clinician can ask the AI to suggest a more challenging (progression) or an easier (regression) alternative.
        *   **AI Action:** The AI analyzes the current exercise and suggests a suitable replacement from the library, along with new parameters and a reason for the suggestion.
        *   **Benefit:** Facilitates dynamic program adjustments based on patient progress or needs, ensuring continuous and appropriate challenge.
    *   **3. Overall Program Review & Modification:**
        *   **How it Helps:** Clinicians can input an existing program and new patient feedback (e.g., "patient reports knee pain during squats") or a new goal (e.g., "increase focus on endurance").
        *   **AI Action:** The AI provides overall advice on how to modify the program and then gives specific suggestions for each exercise in the program (e.g., 'keep', 'modify parameters', 'replace with X', 'remove', or 'add Y exercise'), including reasons and new parameters if applicable.
        *   **Benefit:** Offers intelligent decision support for adapting programs, helping clinicians respond effectively to patient feedback and evolving goals.
*   **AI-Driven Patient Adherence Insights (Analytics Dashboard - Conceptual):**
    *   **How it Helps:** While the dashboard displays adherence data, this implies an underlying AI system.
    *   **AI Action:** The AI would (conceptually) analyze patterns in patient adherence, identifying patients who are at risk of non-compliance or specific exercises that consistently have low completion rates across multiple patients.
    *   **Benefit:** Allows clinicians to proactively intervene with at-risk patients, modify problematic exercises, and ultimately improve overall treatment outcomes.

---

### 3. Patient Portal

The Patient Portal is designed to be an engaging, intuitive, and supportive interface for patients to actively participate in and manage their recovery journey.

**Core Patient Features:**

*   **Personalized Dashboard:**
    *   **Overview:** Displays a welcome message, current date, and a snapshot of their current program progress.
    *   **Today's Focus:** Highlights the next 1-2 uncompleted exercises for the day.
    *   **Streak Counter & Badges:** Visually tracks their workout consistency (streak) and displays earned achievement badges.
    *   **Upcoming Appointments:** Shows a summary of their next few scheduled appointments.
*   **My Program:**
    *   **View Assigned Program:** Access their currently assigned exercise program with a clear list of exercises.
    *   **Detailed Exercise View:** For each exercise, view detailed instructions, prescribed parameters (sets, reps, duration, rest), clinician notes, and an embedded video demonstration.
    *   **Exercise Completion & Feedback:** Mark exercises as completed. After completion, provide feedback including a pain level on a 1-10 scale and textual comments for their clinician to review.
*   **Progress Tracking:**
    *   **Overall Completion:** View their overall completion percentage for the current program.
    *   **Exercise-Specific Completion:** See a chart visualizing completion rates for individual exercises in their program.
    *   **Badges & Achievements:** A dedicated section to view all earned badges and milestones.
    *   **Workout Consistency:** A visual representation (e.g., a 30-day grid) of their daily workout completion.
*   **Appointment Booking & Management:**
    *   **City-Based Booking:** Patients first select their city in Pakistan.
    *   **Service & Clinician Selection:** Choose a service type, then select an available clinician in their chosen city.
    *   **Date & Time Slot Selection:** Pick a preferred date and time slot from the clinician's (mock) availability.
    *   **Account Creation/Login for Finalization:** If not logged in, the patient is prompted to create an account or log in. The selected appointment details are temporarily stored and finalized after successful authentication.
    *   **View Appointments:** Access a list of their upcoming and past appointments, with details for each.
    *   **Cancel Appointments (Simulated):** Option to cancel upcoming scheduled appointments.
*   **Secure Messaging:**
    *   **Direct Clinician Communication:** Engage in secure, one-on-one text-based messaging with their assigned clinician.
*   **Educational Resources:**
    *   **Access Learning Hub:** Browse a library of articles and videos curated by platform administrators related to various conditions, general wellness, or specific exercises. Includes search and filtering capabilities.
    *   **View Resource Details:** Read articles or get links to watch videos with summaries and tags.
*   **Account Management:**
    *   **Update Profile:** Modify basic profile information (e.g., name).
    *   **Change Password:** Securely update their account password.
*   **Support Tickets:**
    *   **Submit Requests:** Patients can submit support tickets to platform administrators for technical issues or questions about using the portal.
*   **Signup & Login:**
    *   **Email/Password:** Standard account creation and login.
    *   **Google Sign-Up:** Option to sign up or log in using their Google account, followed by a brief profile completion step if it's a new user.

**AI Integration in Patient Portal:**

*   **AI-Driven Feedback Validation (`ai-driven-validation` flow):**
    *   **How it Helps:** When a patient is about to submit their feedback (pain level and comments) for a completed exercise.
    *   **AI Action:** The Genkit flow analyzes the input. If the feedback is vague (e.g., comments like "it hurts") but the pain level reported is moderate to high, the AI can prompt the patient for more specific details (e.g., "Please describe where you felt the pain and what type of pain it was.") *before* the feedback is officially submitted to the clinician.
    *   **Benefit:** Ensures clinicians receive more actionable and informative feedback, reducing the need for follow-up questions and helping them make better program adjustments.
*   **AI-Personalized Motivation (`ai-patient-motivator` flow):**
    *   **How it Helps:** Displayed prominently on the patient's dashboard as an "AI Coach Tip."
    *   **AI Action:** The Genkit flow takes contextual information about the patient (name, current program adherence, workout streak, recently completed exercises, upcoming challenging exercises, or recent pain feedback) and generates a short, personalized motivational message (1-2 sentences).
    *   **Benefit:** Aims to keep patients engaged, encouraged, and feeling supported throughout their rehabilitation journey by providing relevant and timely positive reinforcement.

---

## Technology Stack

TheraGenius is built using a modern and robust technology stack:

*   **Frontend Framework:** Next.js (utilizing the App Router for efficient routing and server components)
*   **Programming Language:** TypeScript (for type safety and improved code quality)
*   **UI Library:** ShadCN UI Components (providing a set of beautifully designed, accessible, and customizable components)
*   **Styling:** Tailwind CSS (a utility-first CSS framework for rapid UI development)
*   **Generative AI Backend:** Firebase Genkit (for orchestrating calls to Google Gemini models)
*   **AI Models:** Google Gemini (for powering the various AI-driven features)
*   **State Management (Prototype):** Primarily React's built-in `useState` and `useEffect` hooks, with mock data managed in component/page-level state or simple exported arrays (simulating backend data stores).
*   **Deployment (Conceptual):** Firebase App Hosting (as per `apphosting.yaml`)

This combination ensures a scalable, maintainable, and performant application capable of delivering a rich user experience and powerful AI functionalities, suitable for demonstrating a proof-of-concept for a sophisticated healthcare technology platform.
      
    