# WanderPlan - Feature Conflict Resolution

**Date**: 2025-11-08
**Status**: Resolved

This document identifies and resolves conflicting technical choices in the WanderPlan project to ensure a consistent, conflict-free architecture.

---

## Conflicts Identified & Resolutions

### 1. Database Technology Conflict ⚠️

**Conflict**:
- Architecture documents specify: **PostgreSQL with Prisma ORM**
- User MVP description mentions: **"Firebase Firestore (NoSQL)"**

**Analysis**:
- PostgreSQL: Relational database, excellent for complex relationships (trips → events → collaborators → expenses)
- Firebase Firestore: NoSQL, simpler setup but harder to manage complex relations
- Architecture guide already has detailed PostgreSQL schemas designed

**Resolution**: ✅ **PostgreSQL with Prisma ORM**

**Rationale**:
- Better for relational data (trips, events, users, collaborators, expenses, invoices)
- Comprehensive schema already designed in architecture_impl.md
- Prisma provides type-safe ORM for Next.js
- More control over data structure and queries
- Easier to implement complex features like expense splitting

---

### 2. Map Provider Conflict ⚠️

**Conflict**:
- Listed: **"Google Maps API for maps"**
- Also listed: **"Leaflet with OpenStreetMap"**
- Updated specs: **"OpenStreetMap + Leaflet (free alternative to Google Maps)"**

**Analysis**:
- Google Maps API: Excellent features, but limited free tier ($200/month credit, then paid)
- OpenStreetMap + Leaflet: Completely free, open-source, sufficient for MVP

**Resolution**: ✅ **Primary: OpenStreetMap + Leaflet**

**Rationale**:
- User emphasized free/open-source tools
- OSM with Leaflet is production-ready for mapping needs
- Route visualization via Leaflet Routing Machine + OSRM (free)
- Google Maps can be added as premium feature later if needed

**Implementation**:
- Maps: Leaflet.js with OpenStreetMap tiles
- Routing: Leaflet Routing Machine with OSRM backend
- Geocoding: Nominatim (OSM geocoding service)

---

### 3. Authentication Provider Conflict ⚠️

**Conflict**:
- Mentioned: **"Firebase Authentication"**
- Mentioned: **"Auth0"**
- Mentioned: **"OAuth providers for authentication"**
- Architecture: **"JWT tokens"**

**Analysis**:
- Firebase Auth: Easy setup but creates Firebase dependency
- Auth0: Feature-rich but adds external dependency
- NextAuth.js: Native Next.js solution, works with PostgreSQL
- Custom JWT: Full control but more implementation work

**Resolution**: ✅ **NextAuth.js (Auth.js) with PostgreSQL**

**Rationale**:
- Native Next.js 14 integration
- Supports OAuth providers (Google, GitHub, etc.)
- Works with PostgreSQL (no Firebase needed)
- Built-in JWT session management
- Type-safe with TypeScript
- Free and open-source

**Implementation**:
- NextAuth.js for authentication
- PostgreSQL for user storage (via Prisma adapter)
- Support for email/password + OAuth providers
- JWT sessions stored in database

---

### 4. PDF Generation Conflict ⚠️

**Conflict**:
- Listed: **"Puppeteer"**
- Listed: **"jsPDF"**
- Architecture mentions: **"PDFKit"**

**Analysis**:
- Puppeteer: Heavyweight (Chrome), best for HTML/CSS → PDF, server-side only
- jsPDF: Lightweight, client-side, limited styling
- PDFKit: Node.js library, programmatic PDF creation
- @react-pdf/renderer: React components → PDF, great for complex layouts

**Resolution**: ✅ **@react-pdf/renderer (Primary) + Puppeteer (Fallback)**

**Rationale**:
- @react-pdf/renderer: React-based, reusable components, works client or server
- Good for itinerary layouts with styling
- Puppeteer as fallback for very complex designs
- Both work well with Next.js

**Implementation**:
- Primary: @react-pdf/renderer for itinerary PDFs
- Complex layouts: Puppeteer (server-side API route)
- Mobile-optimized PDF layouts using React components

---

### 5. POI/Search API Conflict ⚠️

**Conflict**:
- Listed: **"Foursquare Places API (10k free calls)"**
- Listed: **"OSM Overpass API"**
- Mentioned: **"Google Places API"**

**Analysis**:
- OSM Overpass: Unlimited free, but data quality varies by region
- Foursquare Places API: 10k free calls/month, curated POI data
- Google Places API: Limited free tier, excellent data, expensive

**Resolution**: ✅ **Hybrid Approach**

**Primary**: OSM Overpass API (unlimited free)
**Secondary**: Foursquare Places API (10k calls/month for premium POIs)
**Future**: Google Places API (if budget allows)

**Rationale**:
- OSM Overpass covers basic POI searches (restaurants, hotels, attractions)
- Foursquare provides curated results for popular destinations
- Keeps costs minimal for MVP
- Can upgrade to Google Places later

**Implementation**:
- POI search: OSM Overpass (amenity=restaurant, tourism=hotel, etc.)
- Popular destinations: Foursquare Places API (within 10k limit)
- Geocoding: Nominatim (free OSM geocoding)

---

### 6. Drag-and-Drop Library Conflict (Minor) ⚠️

**Conflict**:
- Listed: **"react-beautiful-dnd"**
- Listed: **"dnd-kit"**

**Analysis**:
- react-beautiful-dnd: Mature, widely used, but maintenance concerns
- dnd-kit: Modern, actively maintained, better accessibility

**Resolution**: ✅ **dnd-kit**

**Rationale**:
- More actively maintained
- Better accessibility (WCAG compliance)
- Modern React patterns (hooks)
- Smaller bundle size

---

## Resolved Technical Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Drag-and-Drop**: dnd-kit
- **Calendar**: FullCalendar
- **Maps**: Leaflet + OpenStreetMap
- **Routing**: Leaflet Routing Machine + OSRM
- **PDF**: @react-pdf/renderer (primary), Puppeteer (fallback)

### Backend
- **Runtime**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io or Pusher
- **Storage**: AWS S3 or Cloudflare R2

### Third-Party APIs
- **Maps**: OpenStreetMap (free)
- **Geocoding**: Nominatim (free)
- **Routing**: OSRM (free)
- **POI Search**: OSM Overpass (primary, free) + Foursquare (secondary, 10k/month)
- **Payments**: Stripe
- **Email**: SendGrid or Resend

---

## No Conflicts (Confirmed Compatible)

✅ **Calendar View vs Calendar Integration**: Different features, both included
✅ **Real-time messaging + Next.js**: Compatible via Socket.io or Pusher
✅ **Mobile-responsive web** (no native mobile app per user request)
✅ **PostgreSQL + Prisma + Next.js**: Fully compatible stack
✅ **Tailwind CSS + shadcn/ui**: Designed to work together

---

## Summary

All technical conflicts have been resolved with clear choices that prioritize:
1. **Free/open-source tools** (as user requested)
2. **Next.js 14 compatibility**
3. **Scalability** for future features
4. **Type safety** with TypeScript
5. **Modern best practices**

The stack is now consistent and ready for Phase 0 planning agents.
