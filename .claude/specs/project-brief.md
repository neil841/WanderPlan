# WanderPlan - Project Brief

## Overview
A comprehensive travel planning web application that enables users to create detailed itineraries, collaborate with others, manage budgets, and organize all travel-related information in one place. WanderPlan is designed to rival professional tools like Travefy, providing both individual travelers and travel agents with enterprise-grade planning capabilities.

## Target Users

### Primary Personas
1. **Individual Travelers**: People planning personal trips who need detailed itinerary management
2. **Group Trip Organizers**: Users coordinating travel for families, friends, or groups
3. **Travel Agents/Professionals**: Travel industry professionals managing multiple client trips
4. **Travel Enthusiasts**: Users who want to create and share detailed travel plans

## Requested Features

### Core Itinerary Management
- Day-by-day drag-and-drop itinerary builder with timeline view
- Calendar view of scheduled items (monthly/weekly/daily views)
- Event management supporting multiple types:
  - Destinations (with geocoding and coordinates)
  - Flights (with airline, flight number, gate info)
  - Hotels/Accommodations (check-in/out, booking references)
  - Activities/Attractions (location, tickets, descriptions)
  - Restaurants/Dining (reservations, cuisine type)
  - Transportation (pickup/drop-off, vehicle info)
  - Custom events

### Collaboration Features
- Trip sharing with customizable permission levels (viewer/editor/admin)
- Real-time messaging and discussion threads
- Ideas and polls for group decision-making
- Collaborator management and invitations
- Guest access without requiring login

### Financial Management
- Budget and expense tracking
- Expense splitting for group trips
- Per-person cost calculations
- Currency selection and conversion
- Cost breakdown by category

### Professional/Business Features
- Professional proposals and invoicing
- CRM integration for client management
- Client profiles with preferences and history
- Payment processing integration
- Lead capture forms

### Content & Discovery
- Interactive maps with event markers (Leaflet with OpenStreetMap)
- Route visualization between waypoints (Leaflet Routing Machine with OSRM)
- Destination guides and city content
- Search and autocomplete for destinations/activities/POIs
- Location-based recommendations (Foursquare Places API or OSM Overpass)
- Geocoding for location search (Nominatim or OSM-based)

### Document & Export
- Secure document management
- PDF export of itineraries with mobile-friendly layout
- Mobile-responsive web interface for on-the-go access
- Calendar integration (Google Calendar, Outlook sync)
- File attachments for bookings and confirmations

### Additional Features
- Website and landing page builder for travel agents
- Customizable branding for proposals
- Email notifications and invitations
- Activity feed and audit logging

## Technical Preferences

### Frontend Stack
- Next.js 14 with App Router
- React with TypeScript (strict mode)
- Tailwind CSS for styling
- shadcn/ui component library
- **dnd-kit** for drag-and-drop (modern, accessible)
- **FullCalendar** for calendar view component
- **Leaflet** for interactive maps with OpenStreetMap tiles
- **Leaflet Routing Machine** with OSRM for route visualization
- **@react-pdf/renderer** for PDF generation (primary)

### Backend Stack
- Next.js API Routes
- **PostgreSQL** database (relational, primary storage)
- **Prisma ORM** for type-safe database operations
- **NextAuth.js** for authentication (OAuth + email/password)
- **Socket.io or Pusher** for real-time features

### Third-Party Integrations
- **Maps**: OpenStreetMap + Leaflet (free, open-source)
- **Geocoding**: Nominatim (free OSM geocoding service)
- **POI Search**: OSM Overpass API (primary, unlimited free) + Foursquare Places API (secondary, 10k calls/month)
- **Routing**: OSRM (Open Source Routing Machine, free)
- **Payments**: Stripe
- **Storage**: AWS S3 or Cloudflare R2 for file uploads
- **Email**: SendGrid or Resend
- **Authentication**: NextAuth.js with OAuth providers (Google, GitHub, etc.)

### Development Tools
- TypeScript (strict mode)
- ESLint + Prettier
- Jest + React Testing Library
- Playwright for E2E testing

## Success Criteria

### MVP (Phase 1)
- User authentication and registration (NextAuth.js + PostgreSQL)
- Day-by-day itinerary builder with drag-and-drop (dnd-kit)
- Add/edit trip elements (destinations, flights, hotels, restaurants, activities)
- Calendar view of scheduled items (FullCalendar - monthly/weekly/daily)
- Interactive map with markers and route visualization (Leaflet + OSM + OSRM)
- PDF export with mobile-friendly layout (@react-pdf/renderer)
- Basic trip sharing functionality
- Search for destinations and POIs (OSM Overpass + Nominatim)
- Mobile-responsive design (Tailwind CSS)
- Cloud storage (PostgreSQL)

### Full Feature Set (Phase 2-4)
- Real-time collaboration
- Budget tracking and expense splitting
- CRM and invoicing for travel agents
- Interactive maps and destination content
- Document management
- Website builder

## Date Created
2025-11-08

## Reference Documentation
- Comprehensive feature guide: travel_app_clone_guide.md
- Technical architecture: architecture_impl.md
- **Conflict resolution**: conflict-resolution.md (all technical conflicts resolved)
