# LUMIN HR - Human Resources Management Portal

## Overview
A custom HR Management Portal built with the LUMIN design system. Focused on perfect UI/UX, standardized components, comprehensive CRUD operations, and recruiter-ready functionality.

## Tech Stack
- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn UI, Wouter (routing)
- **Backend**: Express.js (Node.js)
- **State**: In-memory (frontend state management with React useState)
- **Font**: Inter Tight (Google Fonts)
- **Design System**: LUMIN brand tokens

## Architecture

### Frontend Structure
```
client/src/
  components/
    layout/
      app-sidebar.tsx    - Navigation sidebar (Shadcn sidebar)
      topbar.tsx         - Top header bar with search, notifications, user menu
      page-header.tsx    - Reusable page header with title + actions
    hr/
      data-table.tsx     - Reusable data table with search, filters, pagination, row actions
      status-badge.tsx   - Status badge component with auto-variant mapping
      stats-card.tsx     - Dashboard stats card
      form-dialog.tsx    - Reusable form dialog for CRUD operations
    ui/                  - Shadcn UI components
  pages/
    dashboard.tsx        - Overview with stats, charts, recent activity
    employees.tsx        - Employee management with full CRUD
    candidates.tsx       - Recruitment pipeline management
    departments.tsx      - Department/org structure management
    job-postings.tsx     - Job posting management
    leave-management.tsx - Leave request management with approve/reject
    attendance.tsx       - Attendance tracking with daily records
    documents.tsx        - Document management
  lib/
    mock-data.ts         - Realistic mock data for all modules
```

### Design Tokens (LUMIN Brand)
- **Font**: Inter Tight (weights: 400, 500, 600, 700)
- **Radius**: 0.5rem default
- **Colors**: Shadcn semantic tokens (primary, muted, accent, destructive)
- **Status Colors**: Emerald (success), Red (error), Amber (warning), Blue (info), Slate (neutral)

### Key Components
- **DataTable**: Generic table with search, filters, sorting, pagination, checkboxes, row actions
- **StatusBadge**: Auto-maps status strings to color variants
- **FormDialog**: Standard dialog for create/edit forms
- **StatsCard**: Dashboard metric card with icon and change indicator

### HR Modules
1. **Dashboard** - Stats overview, recent candidates, pending leaves, attendance summary, dept overview
2. **Employees** - CRUD with department/status filters
3. **Candidates** - Pipeline management with stage progression
4. **Departments** - Organization structure management
5. **Job Postings** - Position management with type/status filters
6. **Leave Management** - Request submission and approval workflow
7. **Attendance** - Daily check-in/out tracking with stats
8. **Documents** - HR document management with categories

### Data Model
All types defined in `shared/schema.ts` with Zod validation schemas.
Currently using frontend state (useState) with mock data. Database integration planned for later phase.

## Running
- `npm run dev` starts both Express backend and Vite frontend dev server
- Frontend served on same port as backend via Vite middleware
