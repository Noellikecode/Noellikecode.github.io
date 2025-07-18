# Global Speech Access Map

## Overview

A crowdsourced interactive mapping platform that helps people find speech therapy resources worldwide. The application displays clinics, programs, and teletherapy services on an interactive map, allowing users to discover and contribute information about speech therapy accessibility globally.

**Current Status**: Successfully populated with 48 real speech therapy centers from the National Provider Identifier (NPI) database, covering major metropolitan areas across the United States including Colorado, Texas, New York, Maryland, California, Florida, Washington, Illinois, Georgia, and Arizona.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (all client files use .tsx extensions)
- **Build Tool**: Vite for development and bundling
- **Routing**: Wouter for client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Mapping**: Leaflet.js for interactive maps with dynamic imports

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Style**: RESTful endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Express sessions with PostgreSQL storage

### Development Environment
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Hot Reload**: Vite middleware integrated with Express in development
- **Type Safety**: Shared TypeScript types between frontend and backend

## Key Components

### Database Schema
- **Clinics Table**: Core entity storing clinic information including location, services, cost level, and verification status
- **Submissions Table**: Tracks pending clinic submissions with approval workflow
- **Users Table**: Admin user authentication
- **Analytics Table**: Site usage tracking and statistics

### API Endpoints
- `GET /api/clinics` - Retrieve verified clinics
- `GET /api/clinics/:id` - Get specific clinic details
- `GET /api/clinics/search` - Search with filters
- `POST /api/clinics` - Submit new clinic
- `GET /api/admin/submissions` - Admin: pending submissions
- `POST /api/admin/submissions/:id/approve` - Admin: approve submission
- `POST /api/admin/submissions/:id/reject` - Admin: reject submission
- `GET /api/analytics` - Site analytics

### Core Features
- **Interactive Map**: Leaflet-based world map with clinic markers displaying 48 real speech therapy centers
- **NPI Integration**: Automated import system from National Provider Identifier database for authentic clinic data
- **Submission System**: User-friendly form for adding new clinics
- **Admin Dashboard**: Review and approval workflow for submissions, plus NPI import functionality
- **Filtering**: Search by cost level, services, teletherapy availability, and location
- **Analytics**: Track site usage and clinic statistics

## Data Flow

1. **User Submission**: Users fill out clinic submission form
2. **Validation**: Client-side validation with Zod schemas
3. **Storage**: Submissions stored as unverified in database
4. **Admin Review**: Admins can approve/reject through dashboard
5. **Publishing**: Approved clinics appear on public map
6. **Discovery**: Users browse and filter clinics on interactive map

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **leaflet**: Interactive mapping library
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation
- **@radix-ui/***: Accessible UI primitives

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with esbuild as ESM module
- Served from single Express server with static file serving

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)

### Database Management
- Drizzle Kit for schema migrations
- PostgreSQL schemas shared between client and server
- Automatic database provisioning check on startup

### Hosting Considerations
- Designed for Replit deployment with integrated tooling
- Single-process architecture suitable for containerized environments
- Session storage uses PostgreSQL for persistence across restarts