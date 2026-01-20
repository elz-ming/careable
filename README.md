# 🧡 Careable

Careable is a centralized event management and community support platform designed specifically for caregiver organizations and children with disabilities. It streamlines the process of organizing activities, managing volunteer participation, and ensuring participants have easy access to wellness events.

## 🚀 Key Features

### 🏢 Staff Portal (Management)
*   **AI-Powered Event Extraction**: Upload calendar images (PNG, JPEG, PDF) and let **Gemini Vision** automatically extract event details, venues, and timings with reasoning-based accuracy.
*   **Comprehensive Event Management**: Create, edit, and cancel events. View all activities in responsive card or table layouts.
*   **Data Normalization**: Intelligent mapping of Singapore-based venues and automatic conversion of 12h time formats to ISO-standard 24h.
*   **QR Attendance Tracking**: (In progress) Automatic generation of ticket codes for secure event check-ins.

### 🙋 Volunteer Dashboard
*   **Opportunity Discovery**: Browse a real-time feed of "Latest Needs" and sign up for volunteer roles.
*   **Self-Service Scheduling**: View upcoming volunteer commitments and manage registration status.
*   **Integrated QR Codes**: Quick access to attendance QR codes for on-site verification.

### 👨‍👩‍👧‍👦 Participant Portal
*   **Event Discovery**: Explore upcoming community events through a beautiful, searchable landing page and dashboard.
*   **Smart Registration**: A seamless "one-click" registration flow. First-time users are guided to provide their full names for accurate record-keeping.
*   **Wellness Tracking**: Keep track of joined activities and upcoming schedules in one place.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
*   **Authentication**: [Clerk](https://clerk.com/) (Role-based access control)
*   **Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
*   **AI Engine**: [Google Gemini 2.0 Flash](https://ai.google.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Date Handling**: [date-fns](https://date-fns.org/)

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have Node.js 18+ and a Supabase/Clerk account.

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Gemini AI
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.0-flash-exp
```

### 3. Database Setup
Execute the SQL scripts located in the `/sql` directory in your Supabase SQL Editor in the following order:
1. `01_supabase_schema.sql` (Tables & Enums)
2. `02_auth_integration.sql` (Clerk Sync)
3. `03_fix_schema_and_roles.sql` (Role Helpers)
4. `04_add_event_unique_constraint.sql` (Deduplication)
5. `05_add_event_status.sql` (Event Lifecycle)
6. `06_add_is_first_time_to_profiles.sql` (Onboarding Flow)
7. `07_fix_rls_for_registration.sql` (Permissions)

### 4. Installation
```bash
npm install
npm run dev
```

## 🏗️ Project Structure

*   `app/(staff)`: Staff management views and AI extraction logic.
*   `app/(volunteer)`: Volunteer-specific dashboard and opportunity listing.
*   `app/(participant)`: Participant browsing and registration flows.
*   `app/api/calendar/extract`: SSE-based streaming API for Gemini AI reasoning.
*   `lib/supabase`: Server and client-side database utilities.

## 📄 License
© 2026 Careable. Built with love for the community.
