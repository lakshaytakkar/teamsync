# TeamSync - Multi-Vertical Team Portal

## Overview
TeamSync is a multi-vertical team portal with exceptional UI/UX inspired by the Dropship.io design system. It supports multiple business verticals (HR, Sales CRM, Events, Admin) with a config-driven navigation system. Each vertical has its own dashboard, pages, and workflows. Built with React, TypeScript, Tailwind CSS, and Shadcn UI.

## User Preferences
- Single font: Plus Jakarta Sans only (Inter fully removed)
- No custom hover color classes on Shadcn Button components
- Use Shadcn Avatar instead of raw img for profile images
- All interactive elements need data-testid attributes
- Frontend-first with mock data (no database yet)

## System Architecture

### Multi-Vertical Architecture
The portal supports multiple business verticals, each with its own navigation and pages:
- **Verticals Config** (`client/src/lib/verticals-config.ts`): Defines all verticals with their navigation categories
- **Vertical Store** (`client/src/lib/vertical-store.ts`): React context for current vertical state, persisted to localStorage
- **Vertical Switcher** (`client/src/components/layout/vertical-switcher.tsx`): Dropdown in topbar to switch between verticals

### Active Verticals
1. **HR Portal** (id: `hr`, color: #225AEA) — People, Recruitment, Operations, Finance, Projects
2. **Sales CRM** (id: `sales`, color: #F34147) — Leads, Pipeline, Tasks, Follow-ups, Performance
3. **Events** (id: `events`, color: #E91E63) — Events, Venues, Check-in
4. **Admin & IT** (id: `admin`, color: #673AB7) — Team, Settings, Reports

### Frontend Technology
React with TypeScript, Tailwind CSS, Shadcn UI, Wouter routing, motion/react animations.

### Navigation
- **Two-Level Horizontal Top Navigation**: Dynamic based on active vertical
- **Vertical Switcher**: Replaces static logo area, allows switching between products
- **Level 1**: Category tabs (change per vertical)
- **Level 2**: Sub-page navigation within active category

### Page Organization
```
client/src/pages/
├── dashboard.tsx          # HR Dashboard
├── employees.tsx          # HR
├── candidates.tsx         # HR
├── departments.tsx        # HR
├── job-postings.tsx       # HR
├── leave-management.tsx   # HR
├── attendance.tsx         # HR
├── documents.tsx          # HR
├── payroll.tsx            # HR
├── projects.tsx           # HR
├── project-detail.tsx     # HR
├── sales/
│   ├── dashboard.tsx      # Sales Dashboard
│   ├── leads.tsx          # Lead Management
│   ├── pipeline.tsx       # Kanban Pipeline
│   ├── tasks.tsx          # Sales Tasks
│   ├── follow-ups.tsx     # Follow-ups
│   └── performance.tsx    # Team Performance
├── events/
│   ├── dashboard.tsx      # Events Hub
│   ├── events-list.tsx    # All Events
│   ├── venues.tsx         # Venue Directory
│   └── checkin.tsx        # Event Check-in
├── admin/
│   ├── dashboard.tsx      # System Overview
│   ├── team.tsx           # Team Management
│   ├── settings.tsx       # System Settings
│   └── reports.tsx        # Reports & Analytics
├── style-guide.tsx        # Dev: Style Guide
├── components-guide.tsx   # Dev: Components
├── icons-guide.tsx        # Dev: Icons
└── not-found.tsx          # 404
```

### Mock Data Files
- `client/src/lib/mock-data.ts` — HR entities (employees, candidates, departments, etc.)
- `client/src/lib/mock-data-sales.ts` — Sales CRM (leads, tasks, follow-ups, reps, pipeline stages)
- `client/src/lib/mock-data-events.ts` — Events (events, venues, attendees)
- `client/src/lib/mock-data-admin.ts` — Admin (team members, activity logs, reports)

### Core UI Components
- **DataTable**: Generic reusable table with search, filters, sorting, pagination, row actions
- **StatsCard**: Stats display with AnimatedNumber, sparklines, hover lift
- **StatusBadge**: Semantic color variants (success, error, warning, info, neutral)
- **PageBanner**: Branded banner with 3D WebP icon, title, description, action
- **AnimatedNumber**: Spring-animated counter using motion/react
- **RadialProgress**: SVG circular progress rings with animated fill
- **FormDialog**: Standardized dialog for create/edit forms
- **EmptyState**: Illustration + message + optional action
- **Loading**: TableSkeleton, StatsCardSkeleton, Skeleton components

### Backend
Express.js (Node.js) serving the Vite frontend on port 5000.

### Image Assets
All 3D icons and illustrations use WebP format (compressed from 1024×1024 PNGs):
- Icons: 128×128 WebP (~3KB each) in `client/public/3d-icons/`
- Illustrations: 256×256 WebP (~5KB each) in `client/src/assets/illustrations/`

## Component Registry References (shadcn-compatible)
- **KokonutUI** (https://kokonutui.com): Install: `npx shadcn@latest add @kokonutui/<name>`
- **Cult-UI** (https://www.cult-ui.com): Install: `npx shadcn@beta add @cult-ui/<name>`
- **Aceternity UI** (https://ui.aceternity.com): Copy-paste from docs
- **Tool-UI** (https://www.tool-ui.com): Install: `npx assistant-ui add tool-ui <name>`
- **AI SDK Elements** (https://elements.ai-sdk.dev): Install: `npx ai-elements@latest add <name>`

## Reference Project
Analysis of Suprans Team Portal saved in `.local/reference-project-analysis.md` — covers their 6 business verticals, team hierarchy, sidebar switcher pattern, and database schema.

## External Dependencies
- React, TypeScript, Tailwind CSS, Shadcn UI, Wouter, motion/react, Express.js
- Plus Jakarta Sans (Google Fonts), DiceBear (avatars), lucide-react (icons), Zod (validation)
