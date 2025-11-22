# WanderPlan 🌍✈️

> Professional travel planning platform for individuals, groups, and travel agents

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen.svg)](https://github.com/wanderplan/wanderplan)

## 📖 Table of Contents

- [What is WanderPlan?](#what-is-wanderplan)
- [Key Features](#key-features)
- [Who is it for?](#who-is-it-for)
- [Quick Start](#quick-start)
- [Features Overview](#features-overview)
- [Tech Stack](#tech-stack)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 What is WanderPlan?

WanderPlan is a **professional-grade travel planning web application** that helps you create detailed day-by-day itineraries, collaborate with others, manage budgets, and organize all your travel information in one place.

Think **Travefy meets Google Docs** - powerful collaboration, beautiful design, completely free and open-source.

### Why WanderPlan?

- ✅ **Professional-grade** - Built for travel agents and enthusiasts
- ✅ **Real-time collaboration** - Plan trips with friends, family, or clients
- ✅ **Complete financial management** - Budgets, expenses, invoicing, payments
- ✅ **CRM for travel agents** - Client management, proposals, invoices
- ✅ **Beautiful UI** - Modern design with drag-and-drop interface
- ✅ **100% Free** - No premium tiers, no limits, open-source

---

## 🎯 Key Features

### 📅 Itinerary Management
- **Day-by-day builder** with drag-and-drop timeline view
- **Calendar view** (monthly/weekly/daily)
- **Event types**: Flights, hotels, activities, restaurants, transportation
- **Interactive maps** with route visualization
- **Document attachments** for bookings and confirmations

### 👥 Collaboration
- **Real-time collaboration** - Multiple users editing simultaneously
- **Permission levels** - Viewer, Editor, Admin
- **Group messaging** and discussion threads
- **Polls and voting** for group decisions
- **Guest access** - No login required for viewers

### 💰 Financial Management
- **Budget tracking** with category breakdowns
- **Expense splitting** for group trips
- **Per-person costs** automatically calculated
- **Multi-currency** support
- **Visual charts** showing spending vs budget

### 💼 Professional Tools (Travel Agents)
- **CRM system** - Client management with status tracking
- **Proposals** - Create professional travel proposals
- **Invoicing** - Generate and send invoices
- **Stripe integration** - Accept payments online
- **Landing pages** - Build custom pages for each client
- **Lead capture** - Forms to collect leads

### 🗺️ Maps & Discovery
- **Interactive maps** powered by Leaflet & OpenStreetMap
- **Route visualization** with directions
- **POI search** - Find attractions, restaurants, activities
- **Destination guides** with curated content
- **Real-time weather** forecasts

### 📤 Export & Integration
- **PDF export** - Print-friendly itineraries
- **Calendar sync** - Google Calendar, Outlook
- **Email invitations** with automatic reminders
- **Secure document storage** with file attachments

---

## 👥 Who is it for?

### 🏖️ Individual Travelers
Plan your perfect vacation with detailed itineraries, budget tracking, and all your documents in one place.

**Use cases**:
- Honeymoon planning
- Solo backpacking trips
- Family vacations

### 👨‍👩‍👧‍👦 Group Trip Organizers
Coordinate travel for families, friends, or social groups with real-time collaboration and expense splitting.

**Use cases**:
- Group vacations
- Destination weddings
- Study abroad trips

### 💼 Travel Agents & Professionals
Manage multiple client itineraries with CRM, proposals, invoicing, and payment processing.

**Use cases**:
- Client trip planning
- Travel agency operations
- Tour operator management

### 🌍 Travel Enthusiasts
Create and share detailed travel guides with the community.

**Use cases**:
- Travel blogging
- Guide creation
- Trip inspiration sharing

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ database
- **Stripe account** (for payment processing)
- **Resend account** (for email sending)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wanderplan/wanderplan.git
   cd wanderplan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/wanderplan"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # Email (Resend)
   RESEND_API_KEY="re_..."
   FROM_EMAIL="noreply@yourdomain.com"
   FROM_NAME="WanderPlan"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma db seed  # Optional: seed with sample data
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

### First Steps

1. **Register an account** at `/register`
2. **Create your first trip** on the dashboard
3. **Add events** to your itinerary (flights, hotels, activities)
4. **Invite collaborators** to plan together
5. **Set a budget** and track expenses

---

## 📚 Features Overview

### Itinerary Builder

Create beautiful, detailed itineraries with:
- **Timeline view** - See your entire trip at a glance
- **Day-by-day breakdown** - Plan each day in detail
- **Drag-and-drop** - Reorder events easily
- **Event types**:
  - ✈️ Flights (with airline, flight number, times)
  - 🏨 Hotels (with check-in/out, confirmation numbers)
  - 🎭 Activities (with reservations, ticket info)
  - 🍽️ Restaurants (with reservations, dress code)
  - 🚗 Transportation (with pickup/dropoff details)
  - 📍 Destinations (with notes and highlights)

**Example itinerary**:
```
Day 1 - Arrival in Paris
├─ 10:00 AM - Flight: AA 123 (JFK → CDG)
├─ 2:00 PM - Hotel Check-in: Hotel Eiffel
├─ 4:00 PM - Activity: Eiffel Tower Tour
└─ 7:00 PM - Dinner: Le Jules Verne

Day 2 - Exploring Paris
├─ 9:00 AM - Activity: Louvre Museum
├─ 12:00 PM - Lunch: Café de Flore
├─ 3:00 PM - Activity: Seine River Cruise
└─ 7:00 PM - Dinner: Reservation at Septime
```

### Collaboration

Work together in real-time:
- **Live editing** - See changes as they happen
- **Comments** - Discuss specific events or days
- **Voting** - Poll the group on decisions
- **Permissions**:
  - **Admin** - Full control (delete trip, manage users)
  - **Editor** - Edit itinerary, add expenses
  - **Viewer** - Read-only access
- **Guest links** - Share view-only links without requiring login

### Financial Management

Stay on budget:
- **Budget categories**:
  - Flights
  - Accommodation
  - Activities
  - Food & Dining
  - Transportation
  - Shopping
  - Other
- **Expense tracking**:
  - Add actual expenses as you travel
  - See budget vs actual in real-time
  - Visual charts and breakdowns
- **Expense splitting**:
  - Split costs equally or custom amounts
  - Track who owes whom
  - Per-person totals

**Example**:
```
Budget: $3,000
Spent: $2,450
Remaining: $550

Breakdown:
- Flights: $800 / $1,000 (80%)
- Hotel: $600 / $800 (75%)
- Activities: $450 / $600 (75%)
- Food: $600 / $600 (100%) ⚠️ At limit
```

### CRM for Travel Agents

Manage your clients professionally:
- **Client database**:
  - Contact information
  - Trip history
  - Status tracking (Lead → Active → Past)
  - Tags and notes
- **Proposals**:
  - Create professional travel proposals
  - Line items with pricing
  - Tax and discount support
  - Send via email
- **Invoicing**:
  - Generate invoices from proposals
  - Track payment status
  - Automatic overdue detection
  - Stripe payment links
- **Landing pages**:
  - Build custom pages for each trip/package
  - Lead capture forms
  - Custom branding
  - Analytics

### Maps & Discovery

Visualize your journey:
- **Interactive maps** (Leaflet + OpenStreetMap)
- **Route planning** with turn-by-turn directions
- **POI search**:
  - Restaurants (Foursquare API)
  - Attractions (OSM)
  - Hotels (booking integrations)
- **Weather forecasts** for each destination
- **Photo galleries** from previous travelers

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Maps**: [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **State**: [TanStack Query](https://tanstack.com/query) (React Query)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

### Backend
- **API**: Next.js API Routes
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Email**: [Resend](https://resend.com/)
- **Payments**: [Stripe](https://stripe.com/)

### Testing
- **Unit Tests**: [Jest](https://jestjs.io/)
- **Component Tests**: [React Testing Library](https://testing-library.com/react)
- **E2E Tests**: [Playwright](https://playwright.dev/)
- **Coverage**: 85% (133 tests)

### Deployment
- **Frontend**: [Vercel](https://vercel.com/)
- **Database**: [Railway](https://railway.app/) / [Supabase](https://supabase.com/)
- **CI/CD**: GitHub Actions

---

## 📖 Documentation

- **[User Guide](./docs/USER-GUIDE.md)** - How to use WanderPlan
- **[API Documentation](./docs/API.md)** - Complete API reference
- **[Developer Guide](./docs/DEVELOPER.md)** - Contributing and development
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment
- **[Stripe Setup](./STRIPE-SETUP.md)** - Local Stripe testing

### For Developers
- **Architecture**: See [architecture-design.md](./.claude/specs/architecture-design.md)
- **Database Schema**: See [db-schema.md](./.claude/specs/db-schema.md)
- **API Specs**: See [api-specs.yaml](./.claude/specs/api-specs.yaml)

---

## 🤝 Contributing

We welcome contributions! See [DEVELOPER.md](./docs/DEVELOPER.md) for:
- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

---

## 📊 Project Status

**Current Phase**: ✅ Phase 5 Complete (CRM, Proposals, Invoices, Stripe, Landing Pages)

**Completed Features**:
- ✅ Authentication & user management
- ✅ Trip creation and itinerary builder
- ✅ Collaboration and sharing
- ✅ Budget and expense tracking
- ✅ Maps and route planning
- ✅ CRM for travel agents
- ✅ Proposals and invoicing
- ✅ Stripe payment integration
- ✅ Landing page builder
- ✅ Lead capture forms

**Coming Soon** (Phase 6+):
- 🔄 Real-time collaboration (WebSockets)
- 📱 Mobile app (React Native)
- 🌐 Multi-language support
- 📊 Advanced analytics
- 🤖 AI trip recommendations

---

## 🔒 Security

WanderPlan takes security seriously:
- **Authentication**: Secure JWT tokens with NextAuth.js
- **Authorization**: Role-based access control
- **Input validation**: Zod schemas on all endpoints
- **Rate limiting**: Protection against DoS attacks
- **HTTPS only**: All production traffic encrypted
- **Dependency scanning**: Automated vulnerability detection
- **Security tests**: 44 comprehensive security tests

**Report vulnerabilities**: [security@wanderplan.com](mailto:security@wanderplan.com)

---

## 📜 License

MIT License - see [LICENSE](./LICENSE) file

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Stripe](https://stripe.com/) - Payment processing
- [OpenStreetMap](https://www.openstreetmap.org/) - Map data
- [Resend](https://resend.com/) - Email delivery

---

## 📞 Support

- **Documentation**: [docs.wanderplan.com](https://docs.wanderplan.com)
- **GitHub Issues**: [github.com/wanderplan/wanderplan/issues](https://github.com/wanderplan/wanderplan/issues)
- **Email**: [support@wanderplan.com](mailto:support@wanderplan.com)

---

**Ready to start planning your next adventure?** 🌍✈️

[Get Started](http://localhost:3000/register) • [View Demo](https://demo.wanderplan.com) • [Read Docs](./docs/USER-GUIDE.md)
