# SchoolHub - School Monitoring & Data Management Platform

## Overview

SchoolHub is a cross-device responsive web application for public school monitoring, data management, and field accountability workflows. The system serves a strict organizational hierarchy (CEO → DEO → DDEO → AEO → Head Teacher → Teacher) with role-based access controls, data request workflows, school visit management, and comprehensive activity tracking for education field teams.

Key capabilities include:
- Hierarchical user authentication with role-specific dashboards
- Data request creation, assignment, and tracking with strict "assign down" permissions
- School visit planning and monitoring (monitoring, mentoring, office visits)
- School inventory and compliance tracking
- Leave calendar and staff management
- Evidence collection (photos, documents, voice notes)
- CSV/Excel export functionality for authorized users

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state, React Context for auth state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming (beige/black color scheme)
- **Build Tool**: Vite with custom plugins for meta images and Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Build**: esbuild for production bundling with selective dependency bundling

### Data Storage
- **Database**: PostgreSQL (via Neon serverless driver)
- **Schema Location**: `shared/schema.ts` using Drizzle table definitions
- **Migrations**: Drizzle Kit with `drizzle-kit push` command
- **Key Tables**:
  - `users`: User accounts with role, school, cluster, and district associations
  - `dataRequests`: Data collection requests with fields, priority, and status
  - `requestAssignees`: Many-to-many linking requests to assigned users with responses

### Authentication & Authorization
- **Auth Pattern**: Context-based authentication with role hierarchy enforcement
- **Role Hierarchy**: CEO (5) > DEO (4) > DDEO/AEO (3) > HEAD_TEACHER (2) > TEACHER (1)
- **Assignment Rules**: Users can only assign requests to direct subordinates (defined in `VALID_ASSIGNEES`)
- **Visibility Rules**: Upward visibility (superiors see all below), no peer or upward access

### Project Structure
```
├── client/src/          # React frontend application
│   ├── components/ui/   # shadcn/ui components
│   ├── contexts/        # React contexts (auth)
│   ├── hooks/           # Custom hooks including mock data hooks
│   ├── pages/           # Page components
│   └── lib/             # Utilities and query client
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database access layer
│   └── db.ts            # Database connection
├── shared/              # Shared code between client/server
│   └── schema.ts        # Drizzle schema definitions
└── migrations/          # Database migrations (generated)
```

### Design Patterns
- **Mock Data Hooks**: Currently uses localStorage-based mock data (`useMockDataRequests`, `useMockVisits`, etc.) for prototyping - designed to be replaced with API calls
- **Storage Interface**: `IStorage` interface in `server/storage.ts` abstracts database operations
- **Path Aliases**: `@/` for client source, `@shared/` for shared code

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Neon Serverless**: `@neondatabase/serverless` for serverless PostgreSQL connections
- **Drizzle ORM**: Type-safe database operations with `drizzle-orm` and `drizzle-zod` for validation

### UI Framework
- **Radix UI**: Complete primitive component library (dialog, dropdown, accordion, etc.)
- **shadcn/ui**: Pre-built component system configured in `components.json`
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component
- **cmdk**: Command palette component

### State & Data
- **TanStack React Query**: Server state management and caching
- **Zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation utilities

### Build & Development
- **Vite**: Frontend build tool with React and Tailwind plugins
- **esbuild**: Server bundling for production
- **TypeScript**: Type checking across client, server, and shared code
- **Replit Plugins**: Dev banner, cartographer, and runtime error overlay for Replit environment