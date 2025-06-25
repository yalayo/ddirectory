# D Directory - Contractor Management Platform

## Overview

D Directory is a full-stack web application that connects homeowners with trusted contractors in the Lake Charles, Louisiana area. The platform features a React frontend with Express.js backend, PostgreSQL database managed with Drizzle ORM, and a comprehensive contractor directory with search, filtering, and booking capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express-session with PostgreSQL session store
- **Authentication**: bcryptjs for password hashing and session-based auth

### Database Design
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless with WebSocket support

## Key Components

### Core Entities
1. **Contractors**: Main business entities with comprehensive profiles including ratings, specialties, and contact information
2. **Project Types**: Categorized service offerings (bathroom remodeling, kitchen remodeling, custom homes, etc.)
3. **Reviews**: Customer feedback system linked to contractors
4. **Users**: Manager authentication system for administrative access

### Frontend Pages
- **Home**: Main directory with search, filtering, and contractor listings
- **Contractor Profile**: Detailed contractor information and reviews
- **Book Service**: Service booking form with project type selection
- **Manager Dashboard**: Administrative interface for contractor management
- **Manager Login**: Authentication portal for administrative access

### API Endpoints
- Contractor CRUD operations with search and filtering
- Authentication endpoints for manager login/logout
- Project type management
- Review system integration

## Data Flow

1. **User Journey**: Users browse contractors → filter by category/location → view profiles → book services
2. **Manager Workflow**: Managers authenticate → access dashboard → manage contractor listings → update information
3. **Search & Filter**: Real-time filtering by category, location, radius, and search terms
4. **Authentication**: Session-based authentication for manager access with secure password handling

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **express-session**: Session management
- **bcryptjs**: Password security

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **Drizzle Kit**: Database schema management

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with Replit environment
- **Database**: PostgreSQL 16 with automatic provisioning
- **Development Server**: Vite dev server with HMR
- **Build Process**: Vite for frontend, esbuild for backend

### Production Configuration
- **Build Command**: `npm run build` (Vite + esbuild bundle)
- **Start Command**: `npm run start` (serves bundled application)
- **Port Configuration**: Internal port 5000, external port 80
- **Environment**: Production Node.js with optimized builds

### Database Management
- **Schema Deployment**: `npm run db:push` for schema updates
- **Connection**: Environment variables for database credentials
- **Migrations**: Drizzle Kit migration system

## Changelog

```
Changelog:
- June 25, 2025. Initial setup
- June 25, 2025. Enhanced contractor management system:
  * Fixed contractor list ordering to maintain stable ID-based sorting
  * Improved edit dialog functionality with proper form reset
  * Added Houzz scraper feature for admin users
  * Implemented consistent ordering across all contractor queries
  * Enhanced delete confirmation and error handling
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```