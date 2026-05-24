# University Integrated Management System (UIMS) - Enterprise Resource Planning (ERP) Core

[![NestJS Build](https://img.shields.io/badge/Backend-NestJS%2011-red?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![React Version](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma Version](https://img.shields.io/badge/Database-Prisma%207%20%2B%20PostgreSQL-indigo?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Google OR-Tools](https://img.shields.io/badge/Optimization-Google%20OR--Tools-orange?style=for-the-badge&logo=google)](https://developers.google.com/optimization)

An enterprise-grade, comprehensive university administration portal managing programmes, prerequisite validation graphs, constraint-based timetabling, cancellation-recovery slots, automated retake cascades, and AI-assisted academic appeals.

---

## 🏗️ System Architecture

```mermaid
graph TD
    %% Clients
    Client[React 18 / Tailwind v4 Client]
    
    %% API Gateway & Backend
    subgraph Backend [NestJS Application Core]
        API[NestJS Core API Gateway]
        M01[M01: Program & MQA Repository]
        M02[M02: Student Profile & Study Plans]
        M03[M03: Course & Prerequisite Engine]
        M04[M04: Timetable & Solver Bridge]
        M05[M05: Venue & Space Manager]
        M06[M06: Exams & Retake Cascades]
        M07[M07: Enrolment & Credit Gates]
        M08[M08: HR & Lecturer Management]
        M09[M09: Finance & Fee Billing]
        M10[M10: Notifications & AI Appeals]
    end

    %% Solver Service
    subgraph Optimization [Solver Engine]
        FastAPI[FastAPI Bridge]
        ORTools[Google OR-Tools Scheduler]
    end

    %% Database
    Database[(PostgreSQL 16 Database)]

    %% Connections
    Client <-->|HTTP / JSON| API
    API --> M01 & M02 & M03 & M04 & M05 & M06 & M07 & M08 & M09 & M10
    M04 <-->|REST API| FastAPI
    FastAPI <--> ORTools
    M01 & M02 & M03 & M04 & M05 & M06 & M07 & M08 & M09 & M10 <-->|Prisma ORM| Database
```

---

## 📁 Repository Structure

```tree
qiu-ims-erp/
├── src/                          # NestJS Backend Modules
│   ├── course/                   # M03: Course, prerequisites, equivalency registers
│   ├── enrolment/                # M07: Add/drop gate & prerequisite impact checks
│   ├── exam/                     # M06: Retake insertion, deferrals & extensions
│   ├── finance/                  # M09: Tuition calculations & billing adjustments
│   ├── hr/                       # M08: Lecturer records, contracts & availability
│   ├── notification/             # M10: Email/Push handlers, AI-based appeal assessment
│   ├── prisma/                   # Prisma database connection module
│   ├── programme/                # M01: Versioned curriculum plans & MQA registers
│   ├── student/                  # M02: Study plan generator & early academic risk alerts
│   ├── timetable/                # M04: Google OR-Tools solver bridge
│   ├── venue/                    # M05: Resource allocation & space booking
│   ├── app.module.ts             # Global module configuration
│   └── main.ts                   # NestJS entry point
├── frontend/                     # React 18 + Vite Frontend App
│   ├── src/
│   │   ├── components/           # Shared components (Sidebar, ui elements)
│   │   ├── pages/                # Application page layouts
│   │   ├── lib/                  # Utility functions
│   │   ├── index.css             # Tailwind v4 configuration
│   │   └── main.tsx              # React entry point
│   ├── package.json              # Frontend package configuration
│   └── vite.config.ts            # Vite compiler & Tailwind v4 plugin configuration
├── prisma/                       # Database Configurations
│   ├── schema.prisma             # Full-scope 10-module relational schema
│   └── seed.ts                   # Seeding script for faculties, programmes, and records
├── docs/                         # Documentation
│   └── progress.md               # Feature completion ledger
├── package.json                  # Root Node dependency structure
├── tsconfig.json                 # Shared Typescript configuration
└── CLAUDE.md                     # Engineering protocols & quick execution guide
```

---

## 🌟 Modules & Key Features

### M01: Programme & MQA Repository
- **Curriculum Tracking**: Versioned structures governing intakes and cohorts.
- **Accreditation Register**: Complete registration of programmes against structural MQA standards.
- **Calendar Types**: Supports `STANDARD` academic calendars and `NON_STANDARD` calendars (e.g., Medicine, Pharmacy) bypassing automatic credit policies.

### M02: Student Academic Profile
- **Active Study Plans**: Generates custom semester-by-semester courses according to the student's version.
- **Risk Detection Engine**: Automatically flags students whose GPA trajectory or credit withdrawal records show academic distress (`PlanStatus`: `DELAYED` / `EXTENSION_REQUIRED`).

### M03: Course & Prerequisite Engine
- **Prerequisite Validation**: Strict graph traversal ensuring prerequisite paths are satisfied before enrolment.
- **Equivalency Register**: Maps course equivalencies to merge sections across different departments.

### M04: Timetable Generator
- **OR-Tools Integration**: Bridge connection to Google OR-Tools FastAPI engine.
- **Hard Constraints**: No double-bookings for classrooms, lecturers, or student sections. Ensures room capacity validation using combined headcounts.

### M05: Venue & Space Manager
- **Interactive Space Allocator**: Allocates lecture theaters, labs, and classrooms.
- **Cancellation Recovery**: Tracks class cancellations and scores replacement slots by student disruption score, rendering the optimal alternative in real-time.

### M06: Exams & Results Module
- **Dual-Obligation Retakes**: Automatically tracks fails, plans scheduling inside the student's study plan, and cascades deferred subjects forward.
- **Extension Semester Generator**: Automatically appends extension semesters if the standard curriculum duration is exceeded prior to industrial training.

### M07: Enrolment & Registration
- **Credit Gates**: Strict enforcement of credit caps (20 credits for Long Semesters, 10 credits for Short Semesters).
- **Enrolment Validation**: Features interactive "AI Impact Previews" showing downstream prerequisite damage before allowing a subject drop.

### M08: HR & Lecturer Management
- **Availability Matrix**: Feeds lecturer leave records and preferred hours directly into the solver.
- **Workload Enforcement**: Enforces max credit-hour teaching load caps per lecturer contracts.

### M09: Finance & Fee Billing
- **Tuition Billing**: Auto-calculates fees based on credit hours, course types, and scholarship criteria.
- **Appeal Adjustments**: Automatically recalculates adjustments for overloading and retakes.

### M10: Notifications & Appeals
- **Transaction Alerts**: Push notifications and email dispatches.
- **AI Pre-Assessment**: High-fidelity AI analysis of credit overloading (up to 21 credits) and prerequisite waiver appeals using historical GPA trends.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **PostgreSQL**: `v16.x` or higher
- **PackageManager**: `npm`

### 1. Backend Installation & Database Setup
1. Clone the repository and navigate to the project directory:
   ```bash
   cd qiu-ims-erp
   ```
2. Install NestJS backend dependencies:
   ```bash
   npm install
   ```
3. Set up your database environment variables. Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uims_erp?schema=public"
   ```
4. Push the schema and apply migrations to your database:
   ```bash
   npx prisma db push
   ```
5. Seed the database with faculties, programmes, and records:
   ```bash
   npx prisma db seed
   ```

### 2. Frontend Installation
1. Move to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```

---

## 🛠️ Execution & Verification Commands

Use the following commands (referenced inside [CLAUDE.md](file:///Users/jinzhou/Documents/Project/qiu-ims-erp/CLAUDE.md)) to run, build, and test:

### Development Commands
- **Start Backend API (Dev Mode)**:
  ```bash
  npm run start:dev
  ```
- **Start Frontend Dev Server**:
  ```bash
  npm run dev --prefix frontend
  ```

### Build & Type Verification
- **Validate Database Schema**:
  ```bash
  npx prisma validate
  ```
- **Run Backend Compilation**:
  ```bash
  npm run build --prefix . -- --silent
  ```
- **Run Frontend Type-Checks**:
  ```bash
  npm run build --prefix frontend -- --silent
  ```

### Testing Suites
- **Run Backend Unit Tests**:
  ```bash
  npm run test
  ```
